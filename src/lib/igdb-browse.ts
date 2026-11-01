import { unstable_cache } from "next/cache";
import { getIGDBToken, igdbHeaders } from "@/src/lib/igdb";

/* ------------------------------------------------------------------ *
 * Browse lists for Explore: new releases, coming soon, top rated and *
 * top games by genre/platform. Each list is one IGDB query, cached   *
 * for a few hours via unstable_cache.                                *
 * ------------------------------------------------------------------ */

export interface BrowseGame {
  igdbId: number;
  title: string;
  coverImageId: string | null;
  /** Unix seconds. */
  releaseDate: number | null;
  totalRating: number | null;
}

export interface BrowseOption {
  slug: string;
  label: string;
  ids: number[];
}

// Chips for genre browsing. Slugs are IGDB's own; a few related genres are
// folded together so each chip returns a meaningful list.
export const BROWSE_GENRES: BrowseOption[] = [
  { slug: "role-playing-rpg", label: "RPG", ids: [12] },
  { slug: "shooter", label: "Shooter", ids: [5] },
  { slug: "adventure", label: "Adventure", ids: [31] },
  { slug: "hack-and-slash-beat-em-up", label: "Hack & slash", ids: [25] },
  { slug: "strategy", label: "Strategy", ids: [15, 11, 16] },
  { slug: "platform", label: "Platformer", ids: [8] },
  { slug: "indie", label: "Indie", ids: [32] },
  { slug: "puzzle", label: "Puzzle", ids: [9] },
  { slug: "racing", label: "Racing", ids: [10] },
  { slug: "sport", label: "Sport", ids: [14] },
  { slug: "fighting", label: "Fighting", ids: [4] },
  { slug: "simulator", label: "Simulator", ids: [13] },
  { slug: "tactical", label: "Tactical", ids: [24] },
  { slug: "visual-novel", label: "Visual novel", ids: [34] },
  { slug: "card-and-board-game", label: "Card & board", ids: [35] },
];

// Current-gen platforms only. Switch covers both Switch and Switch 2.
export const BROWSE_PLATFORMS: BrowseOption[] = [
  { slug: "pc", label: "PC", ids: [6] },
  { slug: "ps5", label: "PS5", ids: [167] },
  { slug: "xbox-series", label: "Xbox Series", ids: [169] },
  { slug: "switch", label: "Switch", ids: [130, 508] },
];

export function findGenre(slug: string | undefined) {
  return BROWSE_GENRES.find((g) => g.slug === slug) ?? null;
}

export function findPlatform(slug: string | undefined) {
  return BROWSE_PLATFORMS.find((p) => p.slug === slug) ?? null;
}

const FIELDS = "name, cover.image_id, first_release_date, total_rating";

// Main games, remakes and remasters with art; no editions (GOTY, Deluxe…)
// and nothing tagged Erotic (theme 42), which otherwise tops some genres.
const LISTABLE =
  "cover != null & game_type = (0,8,9) & version_parent = null & themes != (42)";

const LIST_SIZE = 12;
const GRID_SIZE = 24;
const DAY = 86_400;

interface RawBrowseGame {
  id: number;
  name: string;
  cover?: { image_id?: string };
  first_release_date?: number;
  total_rating?: number;
}

// Throws on IGDB errors so a failure isn't cached for hours; callers catch.
async function queryGames(body: string): Promise<BrowseGame[]> {
  let res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: igdbHeaders(await getIGDBToken()),
    body,
  });
  if (res.status === 401) {
    res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: igdbHeaders(await getIGDBToken(true)),
      body,
    });
  }
  if (!res.ok) throw new Error(`IGDB browse query failed: ${res.status}`);
  const games: RawBrowseGame[] = await res.json();
  return games.map((g) => ({
    igdbId: g.id,
    title: g.name,
    coverImageId: g.cover?.image_id ?? null,
    releaseDate: g.first_release_date ?? null,
    totalRating: g.total_rating ?? null,
  }));
}

function cached(key: string[], fn: () => Promise<BrowseGame[]>) {
  return unstable_cache(fn, ["igdb-browse-v1", ...key], {
    revalidate: 60 * 60 * 6,
    tags: ["igdb-browse"],
  })();
}

const now = () => Math.floor(Date.now() / 1000);

/** Released in the last ~60 days, most anticipated first. */
export function getNewReleases() {
  return cached(["new"], () => {
    const t = now();
    return queryGames(
      `fields ${FIELDS};\nwhere ${LISTABLE} & first_release_date >= ${t - 60 * DAY} & first_release_date <= ${t};\nsort hypes desc;\nlimit ${LIST_SIZE};`
    );
  });
}

/** Out in the next ~6 months, most anticipated first. */
export function getComingSoon() {
  return cached(["soon"], () => {
    const t = now();
    return queryGames(
      `fields ${FIELDS};\nwhere ${LISTABLE} & first_release_date > ${t} & first_release_date <= ${t + 183 * DAY};\nsort hypes desc;\nlimit ${LIST_SIZE};`
    );
  });
}

/** All-time best rated, among games with enough ratings to trust. */
export function getTopRated() {
  return cached(["top"], () =>
    queryGames(
      `fields ${FIELDS};\nwhere ${LISTABLE} & total_rating >= 85 & total_rating_count >= 200;\nsort total_rating desc;\nlimit ${LIST_SIZE};`
    )
  );
}

/** Most-rated games in a genre and/or on a platform (ids from the allowlists). */
export function getTopByFilter(
  genre: BrowseOption | null,
  platform: BrowseOption | null
) {
  const filters = [
    genre && `genres = (${genre.ids.join(",")})`,
    platform && `platforms = (${platform.ids.join(",")})`,
  ].filter(Boolean);
  return cached(["filter", genre?.slug ?? "", platform?.slug ?? ""], () =>
    queryGames(
      `fields ${FIELDS};\nwhere ${[LISTABLE, ...filters].join(" & ")};\nsort total_rating_count desc;\nlimit ${GRID_SIZE};`
    )
  );
}
