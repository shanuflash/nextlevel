import { NextRequest, NextResponse } from "next/server";
import { getIGDBToken, igdbHeaders, type IGDBGameMeta } from "@/src/lib/igdb";

interface IGDBRawSearchResult {
  id: number;
  name: string;
  slug: string;
  cover?: { image_id: string };
  genres?: { name: string }[];
  platforms?: { abbreviation?: string }[];
  first_release_date?: number;
  summary?: string;
  total_rating?: number;
  total_rating_count?: number;
}

function mapResult(g: IGDBRawSearchResult): IGDBGameMeta {
  return {
    igdbId: g.id,
    title: g.name,
    slug: g.slug,
    coverImageId: g.cover?.image_id ?? null,
    genres: g.genres?.map((genre) => genre.name) ?? [],
    platforms:
      g.platforms
        ?.map((p) => p.abbreviation)
        .filter((a): a is string => Boolean(a)) ?? [],
    releaseDate: g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString().split("T")[0]
      : null,
    summary: g.summary ?? null,
    popularity: (g.total_rating_count ?? 0),
  };
}

const FIELDS =
  "name, slug, cover.image_id, genres.name, platforms.abbreviation, first_release_date, summary, total_rating, total_rating_count";

async function igdbFetch(
  headers: Record<string, string>,
  body: string,
): Promise<IGDBRawSearchResult[]> {
  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers,
    body,
  });

  if (res.status === 401) {
    const freshToken = await getIGDBToken(true);
    const retryHeaders = { ...headers, Authorization: `Bearer ${freshToken}` };
    const retry = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: retryHeaders,
      body,
    });
    if (!retry.ok) {
      console.error("IGDB retry failed:", retry.status, await retry.text());
      return [];
    }
    return retry.json();
  }

  if (!res.ok) {
    console.error("IGDB error:", res.status, await res.text());
    return [];
  }

  return res.json();
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 1) return NextResponse.json([]);

  try {
    const token = await getIGDBToken();
    const headers = igdbHeaders(token);

    const escaped = query.replace(/"/g, '\\"');
    const isNumeric = /^\d+$/.test(query.trim());

    const games = await igdbFetch(
      headers,
      `fields ${FIELDS};\nwhere name ~ *"${escaped}"*;\nsort total_rating_count desc;\nlimit 10;`,
    );

    if (isNumeric) {
      const idGames = await igdbFetch(
        headers,
        `fields ${FIELDS};\nwhere id = ${query.trim()};\nlimit 1;`,
      );
      const existingIds = new Set(games.map((g) => g.id));
      for (const g of idGames) {
        if (!existingIds.has(g.id)) {
          games.unshift(g);
        }
      }
    }

    return NextResponse.json(games.map(mapResult));
  } catch (e) {
    console.error("IGDB search error:", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
