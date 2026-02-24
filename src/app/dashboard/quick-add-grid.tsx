"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { igdbCover } from "@/src/lib/igdb";
import { addGame } from "./games/actions";
import { toast } from "sonner";
import type { PopularGame } from "@/src/lib/types";

export function QuickAddGrid({ games }: { games: PopularGame[] }) {
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleQuickAdd(g: PopularGame) {
    setLoadingId(g.igdbId);
    try {
      await addGame({ igdbId: g.igdbId, category: "want-to-play" });
      setAddedIds((prev) => new Set(prev).add(g.igdbId));
      toast.success(`Added "${g.title}" to Want to Play`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add game");
    } finally {
      setLoadingId(null);
    }
  }

  if (games.length === 0) return null;

  return (
    <div className="bg-white/2 rounded-2xl border border-white/8 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Get Started</h2>
        <p className="text-sm text-white/40 mt-1">
          Build your gaming catalog in seconds. Tap any game to add it.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {games.map((g) => {
          const coverUrl = igdbCover(g.coverImageId, "t_cover_big_2x");
          const added = addedIds.has(g.igdbId);
          const loading = loadingId === g.igdbId;
          const firstGenre = g.genres?.split(", ")[0];

          return (
            <div key={g.igdbId} className="group relative">
              <Link href={`/game/${g.igdbId}`}>
                <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/20">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={g.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                  ) : (
                    <div className="size-full bg-white/5" />
                  )}
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
                onClick={() => handleQuickAdd(g)}
                disabled={added || loading}
                className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm transition-all ${
                  added
                    ? "bg-emerald-500/80 text-white cursor-default"
                    : "bg-black/70 text-white hover:bg-primary/80"
                } disabled:cursor-not-allowed`}
              >
                {loading ? "..." : added ? "Added" : "+ Want to Play"}
              </button>
            </div>
          );
        })}
      </div>

      {addedIds.size > 0 && (
        <div className="text-center text-xs text-white/30">
          {addedIds.size} game{addedIds.size !== 1 ? "s" : ""} added &mdash;
          keep going or head to{" "}
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
    </div>
  );
}
