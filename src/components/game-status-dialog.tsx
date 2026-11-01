"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { igdbImage } from "@/src/lib/igdb";
import { CATEGORIES } from "@/src/lib/constants";
import { CoverImage } from "@/src/components/cover-image";
import { loadBackdrop, peekBackdrop } from "@/src/lib/backdrop-cache";

/**
 * Game detail sheet for a catalog entry. Owners change status with a single
 * tap (saves immediately) and can remove; visitors just see the status.
 */
export function GameStatusDialog({
  game,
  onClose,
  onChangeCategory,
  onRemove,
  children,
}: {
  game: {
    title: string;
    genre: string | null;
    coverImageId: string | null;
    igdbId: number;
    category: string;
  };
  onClose: () => void;
  /** Omit for read-only (visitor) view. */
  onChangeCategory?: (category: string) => void;
  onRemove?: () => void;
  /** Extra actions, e.g. a visitor's own "Add to my library". */
  children?: React.ReactNode;
}) {
  // undefined = still looking, null = game has no artwork or screenshots.
  // Already-seen games (or ones prefetched on hover) render instantly.
  const [backdrop, setBackdrop] = useState<string | null | undefined>(() =>
    peekBackdrop(game.igdbId)
  );
  const blurredCover = igdbImage(game.coverImageId, "t_cover_small");
  const current = CATEGORIES.find((c) => c.id === game.category);
  const canEdit = Boolean(onChangeCategory);

  useEffect(() => {
    let cancelled = false;
    loadBackdrop(game.igdbId).then((id) => {
      if (!cancelled) setBackdrop(id);
    });
    return () => {
      cancelled = true;
    };
  }, [game.igdbId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={game.title}
        className="bg-surface-elevated border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92dvh] overflow-y-auto"
      >
        {/* Wide artwork when the game has some; otherwise the cover sits
            uncropped on a blurred copy of itself instead of being stretched. */}
        <div className="relative aspect-video overflow-hidden bg-white/5">
          {blurredCover && (
            <Image
              src={blurredCover}
              alt=""
              fill
              className="object-cover scale-125 blur-2xl opacity-60"
              sizes="10vw"
            />
          )}
          {backdrop ? (
            <CoverImage
              imageId={backdrop}
              size="t_screenshot_big"
              placeholderSize="t_screenshot_med"
            />
          ) : (
            backdrop === null &&
            game.coverImageId && (
              <div className="absolute inset-y-4 left-1/2 aspect-3/4 -translate-x-1/2 overflow-hidden rounded-xl shadow-2xl shadow-black/60">
                <CoverImage imageId={game.coverImageId} />
              </div>
            )
          )}
          <div className="absolute inset-0 bg-linear-to-t from-surface-elevated via-transparent to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 size-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 sm:p-6 -mt-6 sm:-mt-8 relative space-y-4">
          <div>
            <h2 className="text-xl font-bold leading-tight">{game.title}</h2>
            {game.genre && (
              <p className="text-xs text-white/40 mt-1">{game.genre}</p>
            )}
          </div>

          {canEdit ? (
            <div role="radiogroup" aria-label="Status">
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => {
                  const isCurrent = c.id === game.category;
                  return (
                    <button
                      key={c.id}
                      role="radio"
                      aria-checked={isCurrent}
                      onClick={() => {
                        if (!isCurrent) onChangeCategory?.(c.id);
                        onClose();
                      }}
                      className={`flex min-h-11 items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                        isCurrent
                          ? c.bg + " " + c.color
                          : "border-white/8 text-white/50 hover:text-white/80 hover:border-white/15"
                      }`}
                    >
                      <span
                        className={`size-2 rounded-full ${c.bar}`}
                        aria-hidden
                      />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            current && (
              <span
                className={`inline-block text-xs font-medium px-2.5 py-1 rounded-lg border ${current.bg} ${current.color}`}
              >
                {current.label}
              </span>
            )
          )}

          {children}

          <div className="flex gap-2 pt-1">
            <Link
              href={`/game/${game.igdbId}`}
              className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/8 transition-colors"
            >
              View Game Page
            </Link>
            {onRemove && (
              <button
                onClick={() => {
                  onClose();
                  onRemove();
                }}
                className="px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
