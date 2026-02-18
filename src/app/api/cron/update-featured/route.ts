import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/auth";
import { game } from "@/schema/game-schema";
import { eq, gt, sql } from "drizzle-orm";
import { getIGDBToken, igdbHeaders } from "@/src/lib/igdb";
import { verifyCronSecret } from "@/src/lib/cron";

export const runtime = "nodejs";
export const maxDuration = 60;

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

const FIELDS =
  "name, slug, cover.image_id, genres.name, platforms.abbreviation, first_release_date, summary, total_rating_count, hypes";

async function upsertGame(raw: IGDBRaw) {
  const existing = await db.query.game.findFirst({
    where: eq(game.igdbId, raw.id),
  });

  const genres = raw.genres?.map((g) => g.name).join(", ") || null;
  const platforms =
    raw.platforms
      ?.map((p) => p.abbreviation)
      .filter(Boolean)
      .join(", ") || null;
  const releaseDate = raw.first_release_date
    ? new Date(raw.first_release_date * 1000).toISOString().split("T")[0]
    : null;
  const popularity = (raw.total_rating_count ?? 0) + (raw.hypes ?? 0) * 10;

  if (existing) {
    await db
      .update(game)
      .set({
        title: raw.name,
        slug: raw.slug,
        coverImageId: raw.cover?.image_id ?? null,
        genres,
        platforms,
        releaseDate,
        summary: raw.summary ?? null,
        popularity,
      })
      .where(eq(game.id, existing.id));
    return existing.id;
  } else {
    const id = crypto.randomUUID();
    await db.insert(game).values({
      id,
      igdbId: raw.id,
      title: raw.name,
      slug: raw.slug,
      coverImageId: raw.cover?.image_id ?? null,
      genres,
      platforms,
      releaseDate,
      summary: raw.summary ?? null,
      popularity,
    });
    return id;
  }
}

export async function GET(req: NextRequest) {
  const unauthorized = verifyCronSecret(req);
  if (unauthorized) return unauthorized;

  try {
    const token = await getIGDBToken();
    const headers = igdbHeaders(token);

    const now = Math.floor(Date.now() / 1000);
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60;

    const hypeRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers,
      body: `fields ${FIELDS};\nwhere hypes > 0 & first_release_date > ${now} & cover != null;\nsort hypes desc;\nlimit 5;`,
    });
    const hypeGames: IGDBRaw[] = hypeRes.ok ? await hypeRes.json() : [];

    const recentRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers,
      body: `fields ${FIELDS};\nwhere first_release_date > ${ninetyDaysAgo} & first_release_date < ${now} & cover != null & total_rating_count > 0;\nsort total_rating_count desc;\nlimit 5;`,
    });
    const recentGames: IGDBRaw[] = recentRes.ok ? await recentRes.json() : [];

    await db.run(
      sql`UPDATE game SET is_featured_anticipated = 0, is_featured_released = 0`
    );

    let anticipatedCount = 0;
    for (const raw of hypeGames) {
      const gameId = await upsertGame(raw);
      await db
        .update(game)
        .set({ isFeaturedAnticipated: true })
        .where(eq(game.id, gameId));
      anticipatedCount++;
    }

    let releasedCount = 0;
    for (const raw of recentGames) {
      const gameId = await upsertGame(raw);
      await db
        .update(game)
        .set({ isFeaturedReleased: true })
        .where(eq(game.id, gameId));
      releasedCount++;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const upcomingGames = await db
      .select({ id: game.id, igdbId: game.igdbId })
      .from(game)
      .where(gt(game.releaseDate, todayStr));

    let releaseDateUpdates = 0;
    if (upcomingGames.length > 0) {
      const upcomingChunks: number[][] = [];
      const upcomingIds = upcomingGames.map((g) => g.igdbId);
      for (let i = 0; i < upcomingIds.length; i += 500) {
        upcomingChunks.push(upcomingIds.slice(i, i + 500));
      }

      const dateMap = new Map<number, string | null>();
      for (const chunk of upcomingChunks) {
        const ids = chunk.join(",");
        const res = await fetch("https://api.igdb.com/v4/games", {
          method: "POST",
          headers,
          body: `fields first_release_date;\nwhere id = (${ids});\nlimit 500;`,
        });
        if (!res.ok) continue;
        const raw: { id: number; first_release_date?: number }[] =
          await res.json();
        for (const g of raw) {
          dateMap.set(
            g.id,
            g.first_release_date
              ? new Date(g.first_release_date * 1000)
                  .toISOString()
                  .split("T")[0]
              : null
          );
        }
      }

      for (const g of upcomingGames) {
        const freshDate = dateMap.get(g.igdbId);
        if (freshDate !== undefined) {
          await db
            .update(game)
            .set({ releaseDate: freshDate })
            .where(eq(game.id, g.id));
          releaseDateUpdates++;
        }
      }
    }

    return NextResponse.json({
      message: `Updated ${anticipatedCount} anticipated, ${releasedCount} released, ${releaseDateUpdates} release dates refreshed`,
      anticipated: anticipatedCount,
      released: releasedCount,
      releaseDateUpdates,
    });
  } catch (e) {
    console.error("[cron] update-featured failed:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
