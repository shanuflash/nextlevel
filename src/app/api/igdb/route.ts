import { NextRequest, NextResponse } from "next/server";
import { getIGDBToken, type IGDBGameMeta } from "@/src/lib/igdb";

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
  };
}

const FIELDS =
  "name, slug, cover.image_id, genres.name, platforms.abbreviation, first_release_date, summary, total_rating, total_rating_count";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 1) return NextResponse.json([]);

  try {
    const token = await getIGDBToken();
    const headers = {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    };

    const escaped = query.replace(/"/g, '\\"');
    const isNumeric = /^\d+$/.test(query.trim());

    // Always do a text search
    const textRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers,
      body: `fields ${FIELDS};\nwhere name ~ *"${escaped}"*;\nsort total_rating_count desc;\nlimit 10;`,
    });

    if (!textRes.ok) {
      const text = await textRes.text();
      console.error("IGDB error:", textRes.status, text);
      return NextResponse.json(
        { error: "IGDB request failed" },
        { status: 502 },
      );
    }

    const games: IGDBRawSearchResult[] = await textRes.json();

    // If the query is numeric, also try an ID lookup and prepend it
    if (isNumeric) {
      const idRes = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers,
        body: `fields ${FIELDS};\nwhere id = ${query.trim()};\nlimit 1;`,
      });
      if (idRes.ok) {
        const idGames: IGDBRawSearchResult[] = await idRes.json();
        // Prepend ID match, avoiding duplicates
        const existingIds = new Set(games.map((g) => g.id));
        for (const g of idGames) {
          if (!existingIds.has(g.id)) {
            games.unshift(g);
          }
        }
      }
    }

    console.log(`[IGDB] Query: "${query}", results: ${games.length}`);

    return NextResponse.json(games.map(mapResult));
  } catch (e) {
    console.error("IGDB search error:", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
