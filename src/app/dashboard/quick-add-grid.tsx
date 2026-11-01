"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/src/lib/constants";
import { setGameStatus } from "./games/actions";
import {
  CategoryMenu,
  anchorBelow,
  type MenuAnchor,
} from "@/src/components/category-menu";
import { toast } from "sonner";
import type { PopularGame } from "@/src/lib/types";
import { CoverImage } from "@/src/components/cover-image";

export function QuickAddGrid({ games }: { games: PopularGame[] }) {
  // igdbId -> category the user picked for it here.
  const [added, setAdded] = useState<Map<number, string>>(new Map());
  const [menu, setMenu] = useState<{
    anchor: MenuAnchor;
    game: PopularGame;
  } | null>(null);

  async function handleQuickAdd(g: PopularGame, category: string) {
    const prev = added.get(g.igdbId);
    setAdded((m) => new Map(m).set(g.igdbId, category));
    try {
      // setGameStatus adds or re-categorizes, so changing a pick just works.
      await setGameStatus({ igdbId: g.igdbId, category });
      const label = CATEGORIES.find((c) => c.id === category)?.label;
      toast.success(`Added "${g.title}" to ${label}`);
    } catch (e: unknown) {
      setAdded((m) => {
        const next = new Map(m);
        if (prev) next.set(g.igdbId, prev);
        else next.delete(g.igdbId);
        return next;
      });
      toast.error(e instanceof Error ? e.message : "Failed to add game");
    }
  }

  if (games.length === 0) return null;

  return (
    <div className="bg-white/3 rounded-2xl border border-white/8 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Get Started</h2>
        <p className="text-sm text-white/40 mt-1">
          Build your gaming catalog in seconds. Tap + Add on anything
          you&apos;ve played or want to.
        </p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {games.map((g) => {
          const addedCat = CATEGORIES.find((c) => c.id === added.get(g.igdbId));
          const firstGenre = g.genres?.split(", ")[0];

          return (
            <div key={g.igdbId} className="group relative">
              <Link href={`/game/${g.igdbId}`}>
                <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/20">
                  <CoverImage imageId={g.coverImageId} alt={g.title} />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3 pt-12">
                    <p className="text-xs font-semibold leading-tight line-clamp-2">
                      {g.title}
                    </p>
                    {firstGenre && (
                      <p className="text-[10px] mt-0.5 text-white/40">
                        {firstGenre}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) =>
                  setMenu({
                    anchor: anchorBelow(e.currentTarget, "end"),
                    game: g,
                  })
                }
                aria-haspopup="menu"
                aria-label={
                  addedCat
                    ? `${g.title}: ${addedCat.label}. Change status`
                    : `Add ${g.title}`
                }
                className={`absolute top-2 right-2 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg backdrop-blur-sm transition-all ${
                  addedCat
                    ? "bg-black/75 text-white"
                    : "bg-black/70 text-white hover:bg-primary/80"
                }`}
              >
                {addedCat ? (
                  <>
                    <span
                      className={`size-2 rounded-full ${addedCat.bar}`}
                      aria-hidden
                    />
                    {addedCat.label}
                  </>
                ) : (
                  "+ Add"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {added.size > 0 && (
        <div className="text-center text-xs text-white/30">
          {added.size} game{added.size !== 1 ? "s" : ""} added &mdash; keep
          going or head to{" "}
          <Link
            href="/dashboard/games"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            My Games
          </Link>
        </div>
      )}

      <div className="text-center pt-1">
        <Link
          href="/dashboard/games"
          className="inline-flex items-center gap-1.5 text-sm text-primary/80 hover:text-primary transition-colors"
        >
          Or search for any game
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {menu && (
        <CategoryMenu
          anchor={menu.anchor}
          title={menu.game.title}
          value={added.get(menu.game.igdbId)}
          onSelect={(category) => handleQuickAdd(menu.game, category)}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
