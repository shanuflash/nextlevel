import { unstable_cache } from "next/cache";

export type IGDBImageSize =
  | "t_thumb"
  | "t_cover_small"
  | "t_cover_big"
  | "t_cover_big_2x"
  | "t_screenshot_med"
  | "t_screenshot_big"
  | "t_screenshot_huge"
  | "t_720p"
  | "t_1080p";

export function igdbImage(
  imageId: string | null | undefined,
  size: IGDBImageSize
) {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.webp`;
}

export function igdbCover(
  imageId: string | null | undefined,
  size: IGDBImageSize = "t_cover_big_2x"
) {
  return igdbImage(imageId, size);
}

// YouTube thumbnail for a trailer/video id
export function youtubeThumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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

export function igdbHeaders(token: string) {
  return {
    "Client-ID": process.env.TWITCH_CLIENT_ID!,
    Authorization: `Bearer ${token}`,
    "Content-Type": "text/plain",
  };
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
  popularity: number;
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
  total_rating_count?: number;
  hypes?: number;
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
    popularity: (g.total_rating_count ?? 0) + (g.hypes ?? 0) * 10,
  };
}

export async function fetchIGDBGames(
  igdbIds: number[]
): Promise<Map<number, IGDBGameMeta>> {
  const map = new Map<number, IGDBGameMeta>();
  if (igdbIds.length === 0) return map;

  const unique = [...new Set(igdbIds)];

  try {
    const token = await getIGDBToken();
    const headers = igdbHeaders(token);

    const chunks: number[][] = [];
    for (let i = 0; i < unique.length; i += 500) {
      chunks.push(unique.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const ids = chunk.join(",");
      const res = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers,
        body: `fields name, slug, cover.image_id, genres.name, platforms.abbreviation, first_release_date, summary, total_rating_count, hypes;
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
  igdbId: number
): Promise<IGDBGameMeta | null> {
  const map = await fetchIGDBGames([igdbId]);
  return map.get(igdbId) ?? null;
}

/* ------------------------------------------------------------------ *
 * Rich game detail — used by the single game page (/game/[igdbId]).  *
 * Fetched live and cached for 24h via unstable_cache.                *
 * ------------------------------------------------------------------ */

export type StoreKind =
  | "steam"
  | "epic"
  | "gog"
  | "xbox"
  | "playstation"
  | "nintendo"
  | "official"
  | "youtube"
  | "twitch"
  | "twitter"
  | "reddit"
  | "discord"
  | "appstore"
  | "googleplay"
  | "itch"
  | "wikipedia"
  | "fandom"
  | "instagram"
  | "facebook"
  | "igdb"
  | "link";

export interface IGDBStoreLink {
  kind: StoreKind;
  label: string;
  url: string;
}

export interface IGDBVideo {
  videoId: string;
  name: string | null;
}

export interface IGDBReleaseDate {
  human: string | null;
  date: number | null;
  platform: string | null;
}

export interface IGDBCompany {
  name: string;
  roles: ("developer" | "publisher" | "porting" | "supporting")[];
}

export interface IGDBAgeRating {
  system: string;
  label: string;
}

export interface IGDBRelatedGame {
  igdbId: number;
  title: string;
  slug: string;
  coverImageId: string | null;
}

export interface IGDBGameDetail {
  igdbId: number;
  title: string;
  slug: string;
  summary: string | null;
  storyline: string | null;
  releaseDate: string | null;
  igdbUrl: string | null;
  totalRating: number | null;
  totalRatingCount: number | null;
  aggregatedRating: number | null;
  aggregatedRatingCount: number | null;
  userRating: number | null;
  userRatingCount: number | null;
  coverImageId: string | null;
  artworkImageIds: string[];
  screenshotImageIds: string[];
  videos: IGDBVideo[];
  genres: string[];
  themes: string[];
  gameModes: string[];
  playerPerspectives: string[];
  gameEngines: string[];
  platforms: { name: string; abbreviation: string | null }[];
  releaseDates: IGDBReleaseDate[];
  companies: IGDBCompany[];
  ageRatings: IGDBAgeRating[];
  storeLinks: IGDBStoreLink[];
  alternativeNames: string[];
  franchise: string | null;
  parentGame: IGDBRelatedGame | null;
  similarGames: IGDBRelatedGame[];
  dlcs: IGDBRelatedGame[];
  expansions: IGDBRelatedGame[];
}

// IGDB websites.type enum (website_types) -> store kind
const WEBSITE_KIND: Record<number, StoreKind> = {
  1: "official",
  2: "fandom",
  3: "wikipedia",
  4: "facebook",
  5: "twitter",
  6: "twitch",
  8: "instagram",
  9: "youtube",
  10: "appstore",
  11: "appstore",
  12: "googleplay",
  13: "steam",
  14: "reddit",
  15: "itch",
  16: "epic",
  17: "gog",
  18: "discord",
  22: "xbox",
  23: "playstation",
  24: "nintendo",
};

const STORE_LABEL: Record<StoreKind, string> = {
  steam: "Steam",
  epic: "Epic Games",
  gog: "GOG",
  xbox: "Xbox",
  playstation: "PlayStation",
  nintendo: "Nintendo",
  official: "Official site",
  youtube: "YouTube",
  twitch: "Twitch",
  twitter: "X / Twitter",
  reddit: "Reddit",
  discord: "Discord",
  appstore: "App Store",
  googleplay: "Google Play",
  itch: "itch.io",
  wikipedia: "Wikipedia",
  fandom: "Wiki",
  instagram: "Instagram",
  facebook: "Facebook",
  igdb: "View on IGDB",
  link: "Website",
};

// Priority for ordering store/link buttons (lower = first)
const STORE_PRIORITY: StoreKind[] = [
  // Stores first
  "steam",
  "epic",
  "gog",
  "xbox",
  "playstation",
  "nintendo",
  "appstore",
  "googleplay",
  "itch",
  // Then the official site
  "official",
  // Then everything else (socials, wikis, reference)
  "youtube",
  "twitch",
  "discord",
  "reddit",
  "twitter",
  "instagram",
  "facebook",
  "wikipedia",
  "fandom",
  "link",
  "igdb",
];

// IGDB age_ratings.rating_category enum (age_rating_categories) -> "ORG RATING"
const AGE_RATING_LABEL: Record<number, string> = {
  1: "ESRB RP",
  2: "ESRB EC",
  3: "ESRB E",
  4: "ESRB E10+",
  5: "ESRB T",
  6: "ESRB M",
  7: "ESRB AO",
  8: "PEGI 3",
  9: "PEGI 7",
  10: "PEGI 12",
  11: "PEGI 16",
  12: "PEGI 18",
  13: "CERO A",
  14: "CERO B",
  15: "CERO C",
  16: "CERO D",
  17: "CERO Z",
  18: "USK 0",
  19: "USK 6",
  20: "USK 12",
  21: "USK 16",
  22: "USK 18",
  23: "GRAC All",
  24: "GRAC 12+",
  25: "GRAC 15+",
  26: "GRAC 19+",
  28: "CLASS_IND L",
  29: "CLASS_IND 10",
  30: "CLASS_IND 12",
  31: "CLASS_IND 14",
  32: "CLASS_IND 16",
  33: "CLASS_IND 18",
  34: "ACB G",
  35: "ACB PG",
  36: "ACB M",
  37: "ACB MA 15+",
  38: "ACB R 18+",
  39: "ACB RC",
  40: "GRAC 18+",
};

// Which organisations to surface (most internationally recognised)
const PREFERRED_AGE_SYSTEMS = ["ESRB", "PEGI"];

interface RawWebsite {
  url?: string;
  type?: number;
}
interface RawCompany {
  company?: { name?: string };
  developer?: boolean;
  publisher?: boolean;
  porting?: boolean;
  supporting?: boolean;
}
interface RawRelated {
  id: number;
  name?: string;
  slug?: string;
  cover?: { image_id?: string };
}
interface IGDBRawGameDetail {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  first_release_date?: number;
  url?: string;
  total_rating?: number;
  total_rating_count?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  rating?: number;
  rating_count?: number;
  cover?: { image_id?: string };
  artworks?: { image_id?: string }[];
  screenshots?: { image_id?: string }[];
  videos?: { video_id?: string; name?: string }[];
  genres?: { name?: string }[];
  themes?: { name?: string }[];
  game_modes?: { name?: string }[];
  player_perspectives?: { name?: string }[];
  game_engines?: { name?: string }[];
  platforms?: { name?: string; abbreviation?: string }[];
  release_dates?: {
    human?: string;
    date?: number;
    platform?: { abbreviation?: string };
  }[];
  involved_companies?: RawCompany[];
  age_ratings?: { rating_category?: number }[];
  websites?: RawWebsite[];
  similar_games?: RawRelated[];
  dlcs?: RawRelated[];
  expansions?: RawRelated[];
  franchises?: { name?: string }[];
  collection?: { name?: string };
  alternative_names?: { name?: string }[];
  parent_game?: RawRelated;
}

function names(arr?: { name?: string }[]): string[] {
  return arr?.map((x) => x.name).filter((n): n is string => Boolean(n)) ?? [];
}

function mapRelated(r?: RawRelated): IGDBRelatedGame | null {
  if (!r || !r.name) return null;
  return {
    igdbId: r.id,
    title: r.name,
    slug: r.slug ?? "",
    coverImageId: r.cover?.image_id ?? null,
  };
}

function buildStoreLinks(raw: IGDBRawGameDetail): IGDBStoreLink[] {
  const links: IGDBStoreLink[] = [];
  const seen = new Set<string>();

  const push = (kind: StoreKind, url: string) => {
    if (!url) return;
    const key = `${kind}:${url}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ kind, label: STORE_LABEL[kind], url });
  };

  // Store + social links come from the websites list (steam, gog, epic, etc.)
  for (const w of raw.websites ?? []) {
    if (!w.url || w.type == null) continue;
    const kind = WEBSITE_KIND[w.type] ?? "link";
    push(kind, w.url);
  }

  // Always offer the IGDB page as a fallback reference
  if (raw.url) push("igdb", raw.url);

  links.sort(
    (a, b) => STORE_PRIORITY.indexOf(a.kind) - STORE_PRIORITY.indexOf(b.kind)
  );
  return links;
}

function mapRawDetail(g: IGDBRawGameDetail): IGDBGameDetail {
  const companies: IGDBCompany[] = (g.involved_companies ?? [])
    .map((c) => {
      const roles: IGDBCompany["roles"] = [];
      if (c.developer) roles.push("developer");
      if (c.publisher) roles.push("publisher");
      if (c.porting) roles.push("porting");
      if (c.supporting) roles.push("supporting");
      return { name: c.company?.name ?? "", roles };
    })
    .filter((c) => c.name && c.roles.length > 0);

  const allAgeRatings: IGDBAgeRating[] = (g.age_ratings ?? [])
    .map((a) => {
      const combined =
        a.rating_category != null ? AGE_RATING_LABEL[a.rating_category] : undefined;
      if (!combined) return null;
      const [system, ...rest] = combined.split(" ");
      return { system, label: rest.join(" ") };
    })
    .filter((a): a is IGDBAgeRating => a !== null);
  const preferred = allAgeRatings.filter((a) =>
    PREFERRED_AGE_SYSTEMS.includes(a.system)
  );
  const ageRatings = preferred.length > 0 ? preferred : allAgeRatings.slice(0, 3);

  const releaseDates: IGDBReleaseDate[] = (g.release_dates ?? []).map((r) => ({
    human: r.human ?? null,
    date: r.date ?? null,
    platform: r.platform?.abbreviation ?? null,
  }));

  return {
    igdbId: g.id,
    title: g.name,
    slug: g.slug,
    summary: g.summary ?? null,
    storyline: g.storyline ?? null,
    releaseDate: g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString().split("T")[0]
      : null,
    igdbUrl: g.url ?? null,
    totalRating: g.total_rating ?? null,
    totalRatingCount: g.total_rating_count ?? null,
    aggregatedRating: g.aggregated_rating ?? null,
    aggregatedRatingCount: g.aggregated_rating_count ?? null,
    userRating: g.rating ?? null,
    userRatingCount: g.rating_count ?? null,
    coverImageId: g.cover?.image_id ?? null,
    artworkImageIds:
      g.artworks
        ?.map((a) => a.image_id)
        .filter((id): id is string => Boolean(id)) ?? [],
    screenshotImageIds:
      g.screenshots
        ?.map((s) => s.image_id)
        .filter((id): id is string => Boolean(id)) ?? [],
    videos:
      g.videos
        ?.filter((v) => v.video_id)
        .map((v) => ({ videoId: v.video_id!, name: v.name ?? null })) ?? [],
    genres: names(g.genres),
    themes: names(g.themes),
    gameModes: names(g.game_modes),
    playerPerspectives: names(g.player_perspectives),
    gameEngines: names(g.game_engines),
    platforms:
      g.platforms
        ?.filter((p) => p.name)
        .map((p) => ({ name: p.name!, abbreviation: p.abbreviation ?? null })) ??
      [],
    releaseDates,
    companies,
    ageRatings,
    storeLinks: buildStoreLinks(g),
    alternativeNames: names(g.alternative_names),
    franchise: g.franchises?.[0]?.name ?? g.collection?.name ?? null,
    parentGame: mapRelated(g.parent_game),
    similarGames: (g.similar_games ?? [])
      .map(mapRelated)
      .filter((x): x is IGDBRelatedGame => x !== null),
    dlcs: (g.dlcs ?? [])
      .map(mapRelated)
      .filter((x): x is IGDBRelatedGame => x !== null),
    expansions: (g.expansions ?? [])
      .map(mapRelated)
      .filter((x): x is IGDBRelatedGame => x !== null),
  };
}

const DETAIL_FIELDS = `fields
  name, slug, summary, storyline, first_release_date, url,
  total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, rating, rating_count,
  cover.image_id, artworks.image_id, screenshots.image_id, videos.video_id, videos.name,
  genres.name, themes.name, game_modes.name, player_perspectives.name, game_engines.name,
  platforms.name, platforms.abbreviation,
  release_dates.human, release_dates.date, release_dates.platform.abbreviation,
  involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
  involved_companies.porting, involved_companies.supporting,
  age_ratings.rating_category, websites.url, websites.type,
  similar_games.name, similar_games.slug, similar_games.cover.image_id,
  dlcs.name, dlcs.slug, dlcs.cover.image_id, expansions.name, expansions.slug, expansions.cover.image_id,
  franchises.name, collection.name, alternative_names.name, parent_game.name, parent_game.slug, parent_game.cover.image_id;`;

async function fetchIGDBGameDetailUncached(
  igdbId: number
): Promise<IGDBGameDetail | null> {
  try {
    const token = await getIGDBToken();
    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: igdbHeaders(token),
      body: `${DETAIL_FIELDS}\nwhere id = ${igdbId};\nlimit 1;`,
    });
    if (!res.ok) return null;
    const games: IGDBRawGameDetail[] = await res.json();
    const g = games[0];
    if (!g) return null;
    return mapRawDetail(g);
  } catch (e) {
    console.error("IGDB detail fetch error:", e);
    return null;
  }
}

export async function fetchIGDBGameDetail(
  igdbId: number
): Promise<IGDBGameDetail | null> {
  // Bump the version segment whenever the fetched field set / mapping changes
  // so stale cache entries from older code are abandoned.
  const cached = unstable_cache(
    () => fetchIGDBGameDetailUncached(igdbId),
    ["igdb-detail-v3", String(igdbId)],
    { revalidate: 60 * 60 * 24, tags: ["igdb-detail", `igdb-detail-${igdbId}`] }
  );
  return cached();
}
