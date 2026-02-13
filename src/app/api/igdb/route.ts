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
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) return NextResponse.json([]);

  try {
    const token = await getIGDBToken();

    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `search "${query.replace(/"/g, '\\"')}";
fields name, slug, cover.image_id, genres.name, platforms.abbreviation, first_release_date, summary;
limit 5;`,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("IGDB error:", res.status, text);
      return NextResponse.json(
        { error: "IGDB request failed" },
        { status: 502 },
      );
    }

    const games: IGDBRawSearchResult[] = await res.json();

    const results: IGDBGameMeta[] = games.map((g) => ({
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
    }));

    return NextResponse.json(results);
  } catch (e) {
    console.error("IGDB search error:", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
