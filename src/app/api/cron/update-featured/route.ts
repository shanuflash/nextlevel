import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/auth";
import { game } from "@/schema/game-schema";
import { eq, gt, inArray, sql } from "drizzle-orm";
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

function mapRawToValues(raw: IGDBRaw) {
  return {
    title: raw.name,
    slug: raw.slug,
    coverImageId: raw.cover?.image_id ?? null,
    genres: raw.genres?.map((g) => g.name).join(", ") || null,
    platforms:
      raw.platforms
        ?.map((p) => p.abbreviation)
        .filter(Boolean)
        .join(", ") || null,
    releaseDate: raw.first_release_date
      ? new Date(raw.first_release_date * 1000).toISOString().split("T")[0]
      : null,
    summary: raw.summary ?? null,
    popularity: (raw.total_rating_count ?? 0) + (raw.hypes ?? 0) * 10,
  };
}

async function batchUpsertGames(
  rawGames: IGDBRaw[]
): Promise<Map<number, string>> {
  if (rawGames.length === 0) return new Map();

  const igdbIds = rawGames.map((r) => r.id);
  const existing = await db
    .select({ id: game.id, igdbId: game.igdbId })
    .from(game)
    .where(inArray(game.igdbId, igdbIds));

  const existingMap = new Map(existing.map((g) => [g.igdbId, g.id]));
  const result = new Map<number, string>();

  for (const raw of rawGames) {
    const existingId = existingMap.get(raw.id);
    const values = mapRawToValues(raw);

    if (existingId) {
      await db.update(game).set(values).where(eq(game.id, existingId));
      result.set(raw.id, existingId);
    } else {
      const id = crypto.randomUUID();
      await db.insert(game).values({ id, igdbId: raw.id, ...values });
      result.set(raw.id, id);
    }
  }

  return result;
}

export async function GET(req: NextRequest) {
  const unauthorized = verifyCronSecret(req);
  if (unauthorized) return unauthorized;

  try {
    const token = await getIGDBToken();
    const headers = igdbHeaders(token);

    const now = Math.floor(Date.now() / 1000);
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60;

    const [hypeRes, recentRes] = await Promise.all([
      fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers,
        body: `fields ${FIELDS};\nwhere hypes > 0 & first_release_date > ${now} & cover != null;\nsort hypes desc;\nlimit 5;`,
      }),
      fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers,
        body: `fields ${FIELDS};\nwhere first_release_date > ${ninetyDaysAgo} & first_release_date < ${now} & cover != null & total_rating_count > 0;\nsort total_rating_count desc;\nlimit 5;`,
      }),
    ]);

    const hypeGames: IGDBRaw[] = hypeRes.ok ? await hypeRes.json() : [];
    const recentGames: IGDBRaw[] = recentRes.ok ? await recentRes.json() : [];

    await db.run(
      sql`UPDATE game SET is_featured_anticipated = 0, is_featured_released = 0`
    );

    const allRaw = [...hypeGames, ...recentGames];
    const idMap = await batchUpsertGames(allRaw);

    const anticipatedIds = hypeGames
      .map((r) => idMap.get(r.id))
      .filter((id): id is string => !!id);
    const releasedIds = recentGames
      .map((r) => idMap.get(r.id))
      .filter((id): id is string => !!id);

    if (anticipatedIds.length > 0) {
      await db
        .update(game)
        .set({ isFeaturedAnticipated: true })
        .where(inArray(game.id, anticipatedIds));
    }
    if (releasedIds.length > 0) {
      await db
        .update(game)
        .set({ isFeaturedReleased: true })
        .where(inArray(game.id, releasedIds));
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const upcomingGames = await db
      .select({ id: game.id, igdbId: game.igdbId })
      .from(game)
      .where(gt(game.releaseDate, todayStr));

    let releaseDateUpdates = 0;
    if (upcomingGames.length > 0) {
      const upcomingIds = upcomingGames.map((g) => g.igdbId);
      const dateMap = new Map<number, string | null>();

      for (let i = 0; i < upcomingIds.length; i += 500) {
        const chunk = upcomingIds.slice(i, i + 500);
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

      const dateUpdates = upcomingGames
        .filter((g) => dateMap.has(g.igdbId))
        .map((g) =>
          db
            .update(game)
            .set({ releaseDate: dateMap.get(g.igdbId)! })
            .where(eq(game.id, g.id))
        );

      if (dateUpdates.length > 0) {
        const BATCH_SIZE = 100;
        for (let i = 0; i < dateUpdates.length; i += BATCH_SIZE) {
          const slice = dateUpdates.slice(i, i + BATCH_SIZE);
          await db.batch(slice as [(typeof slice)[0], ...typeof slice]);
        }
        releaseDateUpdates = dateUpdates.length;
      }
    }

    return NextResponse.json({
      message: `Updated ${anticipatedIds.length} anticipated, ${releasedIds.length} released, ${releaseDateUpdates} release dates refreshed`,
      anticipated: anticipatedIds.length,
      released: releasedIds.length,
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
