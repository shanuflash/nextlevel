"use server";

import { fetchIGDBGameDetail } from "@/src/lib/igdb";

/**
 * A wide image for a game (artwork, else a screenshot) for headers that
 * would otherwise stretch the portrait cover. Uses the 24h-cached detail.
 */
export async function getGameBackdrop(igdbId: number): Promise<string | null> {
  if (!Number.isInteger(igdbId) || igdbId <= 0) return null;
  const detail = await fetchIGDBGameDetail(igdbId);
  return detail?.artworkImageIds[0] ?? detail?.screenshotImageIds[0] ?? null;
}
