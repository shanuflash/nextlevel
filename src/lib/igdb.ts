export function igdbCover(
  imageId: string | null | undefined,
  size:
    | "t_thumb"
    | "t_cover_small"
    | "t_cover_big"
    | "t_cover_big_2x"
    | "t_1080p" = "t_cover_big_2x",
) {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.webp`;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export async function getIGDBToken(forceRefresh = false) {
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt)
    return cachedToken.token;

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

  const data: { access_token: string; expires_in: number } = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  };

  return cachedToken.token;
}

export interface IGDBGameMeta {
  igdbId: number;
  title: string;
  slug: string;
  coverImageId: string | null;
  genres: string[];
  platforms: string[];
  releaseDate: string | null;
  summary: string | null;
}

interface IGDBRawGame {
  id: number;
  name: string;
  slug: string;
  cover?: { image_id: string };
  genres?: { name: string }[];
  platforms?: { abbreviation?: string }[];
  first_release_date?: number;
  summary?: string;
}

function mapRawGame(g: IGDBRawGame): IGDBGameMeta {
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

export async function fetchIGDBGames(
  igdbIds: number[],
): Promise<Map<number, IGDBGameMeta>> {
  const map = new Map<number, IGDBGameMeta>();
  if (igdbIds.length === 0) return map;

  const unique = [...new Set(igdbIds)];

  try {
    const token = await getIGDBToken();

    const chunks: number[][] = [];
    for (let i = 0; i < unique.length; i += 500) {
      chunks.push(unique.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const ids = chunk.join(",");
      const res = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body: `fields name, slug, cover.image_id, genres.name, platforms.abbreviation, first_release_date, summary;
where id = (${ids});
limit 500;`,
      });

      if (!res.ok) continue;

      const games: IGDBRawGame[] = await res.json();
      for (const g of games) map.set(g.id, mapRawGame(g));
    }
  } catch (e) {
    console.error("IGDB batch fetch error:", e);
  }

  return map;
}

export async function fetchIGDBGame(
  igdbId: number,
): Promise<IGDBGameMeta | null> {
  const map = await fetchIGDBGames([igdbId]);
  return map.get(igdbId) ?? null;
}

// --- Most hyped upcoming games (cached) ---

export interface IGDBHypeGame {
  igdbId: number;
  title: string;
  slug: string;
  coverImageId: string | null;
  genres: string[];
  releaseDate: string | null;
  hypes: number;
}

interface HypeCache {
  games: IGDBHypeGame[];
  fetchedAt: number;
}

let hypeCache: HypeCache | null = null;
const HYPE_CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function fetchHypeGames(
  limit = 5,
): Promise<IGDBHypeGame[]> {
  if (hypeCache && Date.now() - hypeCache.fetchedAt < HYPE_CACHE_TTL) {
    return hypeCache.games.slice(0, limit);
  }

  try {
    const token = await getIGDBToken();
    const now = Math.floor(Date.now() / 1000);

    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `fields name, slug, cover.image_id, genres.name, first_release_date, hypes;\nwhere hypes > 0 & first_release_date > ${now} & cover != null;\nsort hypes desc;\nlimit 15;`,
    });

    if (!res.ok) return [];

    interface IGDBRawHype {
      id: number;
      name: string;
      slug: string;
      cover?: { image_id: string };
      genres?: { name: string }[];
      first_release_date?: number;
      hypes?: number;
    }

    const raw: IGDBRawHype[] = await res.json();

    const games: IGDBHypeGame[] = raw.map((g) => ({
      igdbId: g.id,
      title: g.name,
      slug: g.slug,
      coverImageId: g.cover?.image_id ?? null,
      genres: g.genres?.map((genre) => genre.name) ?? [],
      releaseDate: g.first_release_date
        ? new Date(g.first_release_date * 1000).toISOString().split("T")[0]
        : null,
      hypes: g.hypes ?? 0,
    }));

    hypeCache = { games, fetchedAt: Date.now() };
    return games.slice(0, limit);
  } catch {
    return hypeCache?.games.slice(0, limit) ?? [];
  }
}

// --- Recently released games (cached) ---

export interface IGDBRecentGame {
  igdbId: number;
  title: string;
  slug: string;
  coverImageId: string | null;
  genres: string[];
  releaseDate: string | null;
  totalRatingCount: number;
}

interface RecentCache {
  games: IGDBRecentGame[];
  fetchedAt: number;
}

let recentCache: RecentCache | null = null;
const RECENT_CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function fetchRecentReleases(
  limit = 5,
): Promise<IGDBRecentGame[]> {
  if (recentCache && Date.now() - recentCache.fetchedAt < RECENT_CACHE_TTL) {
    return recentCache.games.slice(0, limit);
  }

  try {
    const token = await getIGDBToken();
    const now = Math.floor(Date.now() / 1000);
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60;

    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `fields name, slug, cover.image_id, genres.name, first_release_date, total_rating_count;\nwhere first_release_date > ${ninetyDaysAgo} & first_release_date < ${now} & cover != null & total_rating_count > 0;\nsort total_rating_count desc;\nlimit 15;`,
    });

    if (!res.ok) return [];

    interface IGDBRawRecent {
      id: number;
      name: string;
      slug: string;
      cover?: { image_id: string };
      genres?: { name: string }[];
      first_release_date?: number;
      total_rating_count?: number;
    }

    const raw: IGDBRawRecent[] = await res.json();

    const games: IGDBRecentGame[] = raw.map((g) => ({
      igdbId: g.id,
      title: g.name,
      slug: g.slug,
      coverImageId: g.cover?.image_id ?? null,
      genres: g.genres?.map((genre) => genre.name) ?? [],
      releaseDate: g.first_release_date
        ? new Date(g.first_release_date * 1000).toISOString().split("T")[0]
        : null,
      totalRatingCount: g.total_rating_count ?? 0,
    }));

    recentCache = { games, fetchedAt: Date.now() };
    return games.slice(0, limit);
  } catch {
    return recentCache?.games.slice(0, limit) ?? [];
  }
}
