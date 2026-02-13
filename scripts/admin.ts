/**
 * NextLevel Admin Script
 * ──────────────────────
 * Utility commands for managing the game database.
 *
 * Usage:
 *   npx tsx scripts/admin.ts <command>
 *
 * Commands:
 *   stats              Show database stats (game/user counts, categories, etc.)
 *   resync-metadata     Re-fetch all game metadata (title, cover, genres, etc.) from IGDB
 *   update-popularity   Update popularity scores for all games from IGDB
 *   update-featured     Refresh Most Anticipated & Recently Released flags from IGDB
 *   find-orphans        Find user_game rows with missing game references
 *   backup              Fork the database to a timestamped backup (requires TURSO_API_TOKEN)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });

import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// ─── IGDB helpers ───────────────────────────────────────────────────────────

async function getIGDBToken(): Promise<string> {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error(`Twitch auth failed: ${res.status}`);
  const data: { access_token: string } = await res.json();
  return data.access_token;
}

function igdbHeaders(token: string) {
  return {
    "Client-ID": process.env.TWITCH_CLIENT_ID!,
    Authorization: `Bearer ${token}`,
    "Content-Type": "text/plain",
  };
}

// ─── Commands ───────────────────────────────────────────────────────────────

async function stats() {
  const gameCount = await client.execute("SELECT count(*) as cnt FROM game");
  const ugCount = await client.execute("SELECT count(*) as cnt FROM user_game");
  const userCount = await client.execute("SELECT count(*) as cnt FROM user");
  const cats = await client.execute(
    "SELECT category, count(*) as cnt FROM user_game GROUP BY category ORDER BY cnt DESC",
  );
  const topPop = await client.execute(
    "SELECT title, popularity FROM game ORDER BY popularity DESC LIMIT 10",
  );
  const orphans = await client.execute(
    "SELECT count(*) as cnt FROM user_game WHERE game_id NOT IN (SELECT id FROM game)",
  );

  console.log("╔══════════════════════════════════════╗");
  console.log("║       NextLevel Database Stats       ║");
  console.log("╠══════════════════════════════════════╣");
  console.log(`║  Users:        ${String(userCount.rows[0].cnt).padStart(18)} ║`);
  console.log(`║  Games:        ${String(gameCount.rows[0].cnt).padStart(18)} ║`);
  console.log(`║  User Games:   ${String(ugCount.rows[0].cnt).padStart(18)} ║`);
  console.log(`║  Orphaned UG:  ${String(orphans.rows[0].cnt).padStart(18)} ║`);
  console.log("╠══════════════════════════════════════╣");
  console.log("║  Categories:                         ║");
  for (const row of cats.rows) {
    console.log(`║    ${String(row.category).padEnd(16)} ${String(row.cnt).padStart(14)} ║`);
  }
  console.log("╠══════════════════════════════════════╣");
  console.log("║  Top 10 by Popularity:               ║");
  for (const row of topPop.rows) {
    const title = String(row.title).length > 25
      ? String(row.title).substring(0, 22) + "..."
      : String(row.title);
    console.log(`║    ${title.padEnd(25)} ${String(row.popularity).padStart(5)} ║`);
  }
  console.log("╚══════════════════════════════════════╝");
}

async function resyncMetadata() {
  const allGames = await client.execute("SELECT id, igdb_id FROM game");
  console.log(`Re-syncing metadata for ${allGames.rows.length} games...\n`);

  const token = await getIGDBToken();
  const headers = igdbHeaders(token);

  const igdbIds = allGames.rows.map((g) => g.igdb_id as number);
  const FIELDS =
    "name, slug, cover.image_id, genres.name, platforms.abbreviation, first_release_date, summary, total_rating_count, hypes";

  interface IGDBRaw {
    id: number;
    name: string;
    slug: string;
    cover?: { image_id: string };
    genres?: { name: string }[];
    platforms?: { abbreviation?: string }[];
    first_release_date?: number;
    summary?: string;
    total_rating_count?: number;
    hypes?: number;
  }

  const igdbMap = new Map<number, IGDBRaw>();

  for (let i = 0; i < igdbIds.length; i += 500) {
    const chunk = igdbIds.slice(i, i + 500);
    const ids = chunk.join(",");
    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers,
      body: `fields ${FIELDS};\nwhere id = (${ids});\nlimit 500;`,
    });
    if (!res.ok) {
      console.error(`  IGDB chunk failed: ${res.status}`, await res.text());
      continue;
    }
    const raw: IGDBRaw[] = await res.json();
    for (const g of raw) igdbMap.set(g.id, g);
    console.log(`  Fetched chunk ${Math.floor(i / 500) + 1} (${raw.length} games)`);
  }

  let updated = 0;
  let failed = 0;

  for (const g of allGames.rows) {
    const raw = igdbMap.get(g.igdb_id as number);
    if (!raw) {
      console.log(`  SKIP: igdb_id ${g.igdb_id} not found on IGDB`);
      failed++;
      continue;
    }

    const popularity = (raw.total_rating_count ?? 0) + (raw.hypes ?? 0) * 10;

    await client.execute({
      sql: `UPDATE game SET
        title = ?, slug = ?, cover_image_id = ?, genres = ?,
        platforms = ?, release_date = ?, summary = ?, popularity = ?
        WHERE id = ?`,
      args: [
        raw.name,
        raw.slug,
        raw.cover?.image_id ?? null,
        raw.genres?.map((g) => g.name).join(", ") || null,
        raw.platforms?.map((p) => p.abbreviation).filter(Boolean).join(", ") || null,
        raw.first_release_date
          ? new Date(raw.first_release_date * 1000).toISOString().split("T")[0]
          : null,
        raw.summary ?? null,
        popularity,
        g.id,
      ],
    });
    updated++;
  }

  console.log(`\nDone! ${updated} updated, ${failed} failed`);
}

async function updatePopularity() {
  const allGames = await client.execute("SELECT id, igdb_id FROM game");
  console.log(`Updating popularity for ${allGames.rows.length} games...\n`);

  const token = await getIGDBToken();
  const headers = igdbHeaders(token);

  const igdbIds = allGames.rows.map((g) => g.igdb_id as number);
  const scores = new Map<number, number>();

  for (let i = 0; i < igdbIds.length; i += 500) {
    const chunk = igdbIds.slice(i, i + 500);
    const ids = chunk.join(",");
    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers,
      body: `fields total_rating_count, hypes;\nwhere id = (${ids});\nlimit 500;`,
    });
    if (!res.ok) continue;
    const raw: { id: number; total_rating_count?: number; hypes?: number }[] =
      await res.json();
    for (const g of raw) {
      scores.set(g.id, (g.total_rating_count ?? 0) + (g.hypes ?? 0) * 10);
    }
  }

  let updated = 0;
  for (const g of allGames.rows) {
    const score = scores.get(g.igdb_id as number);
    if (score !== undefined) {
      await client.execute({
        sql: "UPDATE game SET popularity = ? WHERE id = ?",
        args: [score, g.id],
      });
      updated++;
    }
  }

  console.log(`Updated ${updated}/${allGames.rows.length} games`);

  const top = await client.execute(
    "SELECT title, popularity FROM game ORDER BY popularity DESC LIMIT 10",
  );
  console.log("\nTop 10:");
  for (const row of top.rows) {
    console.log(`  ${String(row.popularity).padStart(6)} — ${row.title}`);
  }
}

async function findOrphans() {
  const orphans = await client.execute(
    "SELECT ug.id, ug.user_id, ug.game_id, ug.category, ug.rating FROM user_game ug WHERE ug.game_id NOT IN (SELECT id FROM game)",
  );

  if (orphans.rows.length === 0) {
    console.log("No orphaned user_game rows found. Everything is clean!");
    return;
  }

  console.log(`Found ${orphans.rows.length} orphaned user_game rows:\n`);
  for (const row of orphans.rows) {
    console.log(
      `  id=${row.id} userId=${row.user_id} gameId=${row.game_id} category=${row.category} rating=${row.rating ?? "-"}`,
    );
  }
  console.log(
    "\nThese rows reference games that no longer exist in the game table.",
  );
  console.log("To clean them up, run: npx tsx scripts/admin.ts clean-orphans");
}

async function cleanOrphans() {
  const result = await client.execute(
    "DELETE FROM user_game WHERE game_id NOT IN (SELECT id FROM game)",
  );
  console.log(`Deleted ${result.rowsAffected} orphaned user_game rows`);
}

async function backup() {
  const apiToken = process.env.TURSO_API_TOKEN;
  if (!apiToken) {
    console.log("TURSO_API_TOKEN not set in .env");
    console.log("Get one from: https://turso.tech/app → Settings → API Tokens");
    return;
  }

  const orgSlug = "vercel-icfg-e4h5duucdh387sxitndsqgyr";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const forkName = `nextlevel-backup-${timestamp}`;

  console.log(`Creating backup fork: ${forkName}`);

  const res = await fetch(
    `https://api.turso.tech/v1/organizations/${orgSlug}/databases`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: forkName,
        group: "icfg-e4h5duucdh387sxitndsqgyr-aws-ap-south-1",
        seed: {
          type: "database",
          name: "nextlevel",
          timestamp: new Date().toISOString(),
        },
      }),
    },
  );

  if (!res.ok) {
    console.log("Backup failed:", res.status, await res.text());
    return;
  }

  const data = await res.json();
  console.log(`\nBackup created: ${data.database?.Name || forkName}`);
  console.log("You can delete it later from the Turso dashboard.");
}

async function updateFeatured() {
  const token = await getIGDBToken();
  const headers = igdbHeaders(token);

  const FIELDS =
    "name, slug, cover.image_id, genres.name, platforms.abbreviation, first_release_date, summary, total_rating_count, hypes";

  interface IGDBRaw {
    id: number;
    name: string;
    slug: string;
    cover?: { image_id: string };
    genres?: { name: string }[];
    platforms?: { abbreviation?: string }[];
    first_release_date?: number;
    summary?: string;
    total_rating_count?: number;
    hypes?: number;
  }

  const now = Math.floor(Date.now() / 1000);
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60;

  console.log("Fetching most anticipated games from IGDB...");
  const hypeRes = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers,
    body: `fields ${FIELDS};\nwhere hypes > 0 & first_release_date > ${now} & cover != null;\nsort hypes desc;\nlimit 5;`,
  });
  const hypeGames: IGDBRaw[] = hypeRes.ok ? await hypeRes.json() : [];
  console.log(`  Got ${hypeGames.length} anticipated games`);

  console.log("Fetching recently released games from IGDB...");
  const recentRes = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers,
    body: `fields ${FIELDS};\nwhere first_release_date > ${ninetyDaysAgo} & first_release_date < ${now} & cover != null & total_rating_count > 0;\nsort total_rating_count desc;\nlimit 5;`,
  });
  const recentGames: IGDBRaw[] = recentRes.ok ? await recentRes.json() : [];
  console.log(`  Got ${recentGames.length} recently released games`);

  // Clear all existing flags
  console.log("\nClearing existing featured flags...");
  await client.execute(
    "UPDATE game SET is_featured_anticipated = 0, is_featured_released = 0",
  );

  async function upsertRaw(raw: IGDBRaw): Promise<string> {
    const existing = await client.execute({
      sql: "SELECT id FROM game WHERE igdb_id = ?",
      args: [raw.id],
    });

    const genres = raw.genres?.map((g) => g.name).join(", ") || null;
    const platforms =
      raw.platforms?.map((p) => p.abbreviation).filter(Boolean).join(", ") ||
      null;
    const releaseDate = raw.first_release_date
      ? new Date(raw.first_release_date * 1000).toISOString().split("T")[0]
      : null;
    const popularity = (raw.total_rating_count ?? 0) + (raw.hypes ?? 0) * 10;

    if (existing.rows.length > 0) {
      const id = existing.rows[0].id as string;
      await client.execute({
        sql: `UPDATE game SET title = ?, slug = ?, cover_image_id = ?, genres = ?,
              platforms = ?, release_date = ?, summary = ?, popularity = ?
              WHERE id = ?`,
        args: [
          raw.name, raw.slug, raw.cover?.image_id ?? null, genres,
          platforms, releaseDate, raw.summary ?? null, popularity, id,
        ],
      });
      return id;
    } else {
      const id = crypto.randomUUID();
      await client.execute({
        sql: `INSERT INTO game (id, igdb_id, title, slug, cover_image_id, genres, platforms, release_date, summary, popularity)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, raw.id, raw.name, raw.slug, raw.cover?.image_id ?? null,
          genres, platforms, releaseDate, raw.summary ?? null, popularity,
        ],
      });
      return id;
    }
  }

  // Upsert anticipated games and set flag
  console.log("Setting anticipated flags...");
  for (const raw of hypeGames) {
    const id = await upsertRaw(raw);
    await client.execute({
      sql: "UPDATE game SET is_featured_anticipated = 1 WHERE id = ?",
      args: [id],
    });
    console.log(`  ✓ ${raw.name}`);
  }

  // Upsert recently released games and set flag
  console.log("Setting recently released flags...");
  for (const raw of recentGames) {
    const id = await upsertRaw(raw);
    await client.execute({
      sql: "UPDATE game SET is_featured_released = 1 WHERE id = ?",
      args: [id],
    });
    console.log(`  ✓ ${raw.name}`);
  }

  console.log(
    `\nDone! ${hypeGames.length} anticipated, ${recentGames.length} released`,
  );
}

// ─── CLI ────────────────────────────────────────────────────────────────────

const command = process.argv[2];

const COMMANDS: Record<string, () => Promise<void>> = {
  stats,
  "resync-metadata": resyncMetadata,
  "update-popularity": updatePopularity,
  "update-featured": updateFeatured,
  "find-orphans": findOrphans,
  "clean-orphans": cleanOrphans,
  backup,
};

if (!command || !COMMANDS[command]) {
  console.log("NextLevel Admin Script");
  console.log("──────────────────────\n");
  console.log("Usage: npx tsx scripts/admin.ts <command>\n");
  console.log("Commands:");
  console.log("  stats              Database overview (counts, categories, top games)");
  console.log("  resync-metadata    Re-fetch ALL game data from IGDB (title, cover, genres, etc.)");
  console.log("  update-popularity  Update popularity scores only");
  console.log("  update-featured    Refresh Most Anticipated & Recently Released flags");
  console.log("  find-orphans       Find user_game rows with missing game references");
  console.log("  clean-orphans      Delete orphaned user_game rows");
  console.log("  backup             Fork database to a timestamped backup");
  process.exit(0);
}

COMMANDS[command]().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
