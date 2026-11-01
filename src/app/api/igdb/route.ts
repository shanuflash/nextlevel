import { NextRequest, NextResponse } from "next/server";
import {
  getIGDBToken,
  igdbHeaders,
  type IGDBSearchResult,
} from "@/src/lib/igdb";
import { getSession } from "@/src/lib/session";

const CACHE_TTL_MS = 60_000;
const RESULT_LIMIT = 12;
const searchCache = new Map<
  string,
  { data: IGDBSearchResult[]; expiresAt: number }
>();

interface IGDBRawSearchResult {
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
  game_type?: { type?: string };
  version_parent?: { id: number };
  parent_game?: { name?: string };
}

// IGDB game_type labels that nobody tracks as a game of their own: mods,
// patches, seasons, cosmetic packs and community forks. Bundles are dropped
// too; the games inside them are listed individually.
const HIDDEN_KINDS = new Set([
  "Mod",
  "Update",
  "Season",
  "Fork",
  "Pack / Addon",
  "Bundle",
]);

// Add-ons rank just below their base game when both match equally well.
const ADDON_KINDS = new Set([
  "DLC",
  "Expansion",
  "Standalone Expansion",
  "Episode",
]);

function isListable(g: IGDBRawSearchResult): boolean {
  const kind = g.game_type?.type;
  if (kind && HIDDEN_KINDS.has(kind)) return false;
  // Editions (GOTY, Deluxe, Collector's…) point at the game they repackage.
  if (g.version_parent) return false;
  return true;
}

// IGDB's `search` ranks purely on text, so a 1995 "Hades" with no players
// outranks Supergiant's. Blend how well the name matches with how many people
// have rated or are hyped for the game.
function score(g: IGDBRawSearchResult, query: string): number {
  const name = g.name.toLowerCase();
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);

  let match = 0;
  if (name === q) match = 3;
  else if (name.startsWith(q)) match = 2;
  else if (words.every((w) => name.includes(w))) match = 1;

  const popularity = Math.log10(
    1 + (g.total_rating_count ?? 0) + (g.hypes ?? 0)
  );
  const kind = g.game_type?.type;
  const addonPenalty = kind && ADDON_KINDS.has(kind) ? 0.5 : 0;

  return match + popularity - addonPenalty;
}

function mapResult(g: IGDBRawSearchResult): IGDBSearchResult {
  const kind = g.game_type?.type;
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
    popularity: g.total_rating_count ?? 0,
    kind: kind && kind !== "Main Game" ? kind : null,
    parentTitle: g.parent_game?.name ?? null,
  };
}

const FIELDS =
  "name, slug, cover.image_id, genres.name, platforms.abbreviation, first_release_date, summary, total_rating_count, hypes, game_type.type, version_parent, parent_game.name";

async function igdbFetch(
  headers: Record<string, string>,
  body: string
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
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query) return NextResponse.json([]);

  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const token = await getIGDBToken();
    const headers = igdbHeaders(token);

    const escaped = query.replace(/"/g, '\\"');
    const isNumeric = /^\d+$/.test(query);

    // `search` is the relevance pool; the substring query catches partially
    // typed names ("hollo") that full-text search misses.
    const [idGames, searchGames, wildcardGames] = await Promise.all([
      isNumeric
        ? igdbFetch(
            headers,
            `fields ${FIELDS};\nwhere id = ${query};\nlimit 1;`
          )
        : Promise.resolve([]),
      igdbFetch(headers, `search "${escaped}";\nfields ${FIELDS};\nlimit 40;`),
      igdbFetch(
        headers,
        `fields ${FIELDS};\nwhere name ~ *"${escaped}"*;\nsort total_rating_count desc;\nlimit 15;`
      ),
    ]);

    // An exact IGDB ID always comes first, whatever its type.
    const seen = new Set<number>(idGames.map((g) => g.id));
    const pool: IGDBRawSearchResult[] = [];
    for (const g of [...searchGames, ...wildcardGames]) {
      if (seen.has(g.id) || !isListable(g)) continue;
      seen.add(g.id);
      pool.push(g);
    }
    pool.sort((a, b) => score(b, query) - score(a, query));

    const results = [...idGames, ...pool].slice(0, RESULT_LIMIT).map(mapResult);

    searchCache.set(cacheKey, {
      data: results,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json(results);
  } catch (e) {
    console.error("IGDB search error:", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
