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

export async function getIGDBToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt)
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
