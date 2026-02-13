import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/auth";
import { game } from "@/schema/game-schema";
import { eq, sql } from "drizzle-orm";
import { getIGDBToken } from "@/src/lib/igdb";

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
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getIGDBToken();
    const headers = {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    };

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

    return NextResponse.json({
      message: `Updated ${anticipatedCount} anticipated, ${releasedCount} released`,
      anticipated: anticipatedCount,
      released: releasedCount,
    });
  } catch (e) {
    console.error("[cron] update-featured failed:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
