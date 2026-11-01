"use server";

import { unstable_cache } from "next/cache";
import { getIGDBToken, igdbHeaders } from "@/src/lib/igdb";

// Throws on IGDB errors so a transient failure isn't cached for a week;
// only real answers (including "this game has no artwork") are.
async function fetchBackdropUncached(igdbId: number): Promise<string | null> {
  const body = `fields artworks.image_id, screenshots.image_id;\nwhere id = ${igdbId};\nlimit 1;`;
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
  if (!res.ok) throw new Error(`IGDB backdrop lookup failed: ${res.status}`);
  const [g]: {
    artworks?: { image_id?: string }[];
    screenshots?: { image_id?: string }[];
  }[] = await res.json();
  return g?.artworks?.[0]?.image_id ?? g?.screenshots?.[0]?.image_id ?? null;
}

/**
 * A wide image for a game (artwork, else a screenshot) for headers that
 * would otherwise stretch the portrait cover. Asks IGDB for just those two
 * fields rather than the full game-page payload, and caches for a week since
 * artwork rarely changes.
 */
export async function getGameBackdrop(igdbId: number): Promise<string | null> {
  if (!Number.isInteger(igdbId) || igdbId <= 0) return null;
  try {
    return await unstable_cache(
      () => fetchBackdropUncached(igdbId),
      ["igdb-backdrop-v1", String(igdbId)],
      { revalidate: 60 * 60 * 24 * 7, tags: [`igdb-detail-${igdbId}`] }
    )();
  } catch {
    return null;
  }
}
