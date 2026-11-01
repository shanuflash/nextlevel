"use client";

import { getGameBackdrop } from "@/src/lib/game-backdrop";
import { igdbImage } from "@/src/lib/igdb";

// Per-tab memo of igdbId -> backdrop image id (null = game has none).
// Holding the promise also dedupes concurrent requests for the same game.
const lookups = new Map<number, Promise<string | null>>();
const resolved = new Map<number, string | null>();

/** Backdrop id if it's already known, else undefined. */
export function peekBackdrop(igdbId: number): string | null | undefined {
  return resolved.get(igdbId);
}

/** Look up (once per tab) and warm the browser cache with the image itself. */
export function loadBackdrop(igdbId: number): Promise<string | null> {
  let lookup = lookups.get(igdbId);
  if (!lookup) {
    lookup = getGameBackdrop(igdbId)
      .then((id) => {
        resolved.set(igdbId, id);
        const url = igdbImage(id, "t_screenshot_big");
        if (url) new Image().src = url;
        return id;
      })
      .catch(() => {
        // Let a later open retry instead of remembering the failure.
        lookups.delete(igdbId);
        return null;
      });
    lookups.set(igdbId, lookup);
  }
  return lookup;
}

/** Fire-and-forget warmup for hover/press on a card. */
export function prefetchBackdrop(igdbId: number) {
  void loadBackdrop(igdbId);
}

// Hover intent: only prefetch if the pointer rests on a card briefly, so
// sweeping across a grid doesn't queue a server action per card.
const HOVER_INTENT_MS = 150;
let hoverTimer: ReturnType<typeof setTimeout> | undefined;

/** Spread onto a card that opens the game sheet. */
export function backdropPrefetchProps(igdbId: number) {
  return {
    onPointerEnter: () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => prefetchBackdrop(igdbId), HOVER_INTENT_MS);
    },
    onPointerLeave: () => clearTimeout(hoverTimer),
    onPointerDown: () => prefetchBackdrop(igdbId),
    onFocus: () => prefetchBackdrop(igdbId),
  };
}
