"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { bulkAddGames } from "./actions";
import { igdbCover, type IGDBSearchResult } from "@/src/lib/igdb";
import { CATEGORIES } from "@/src/lib/constants";
import {
  CategoryMenu,
  anchorBelow,
  type MenuAnchor,
} from "@/src/components/category-menu";
import { toast } from "sonner";
import type { UserGameRow } from "@/src/lib/types";

interface QueuedGame {
  igdbId: number;
  title: string;
  coverImageId: string | null;
  category: string;
}

function resultMeta(r: IGDBSearchResult): string {
  const kind = r.kind
    ? r.parentTitle
      ? `${r.kind} of ${r.parentTitle}`
      : r.kind
    : null;
  const platforms =
    r.platforms.length > 3
      ? `${r.platforms.slice(0, 3).join(", ")} +${r.platforms.length - 3}`
      : r.platforms.join(", ");
  return [r.releaseDate?.slice(0, 4), kind, platforms]
    .filter(Boolean)
    .join(" · ");
}

function ResultSkeleton() {
  return (
    <div className="space-y-1" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5">
          <div className="w-10 h-14 rounded-lg bg-white/6 animate-pulse flex-none" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-white/6 animate-pulse" />
            <div className="h-2.5 w-3/5 rounded bg-white/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Single place to add games: search, give each pick a status, add them all.
 * The search box and footer stay put; only the results list scrolls, and its
 * height is fixed so the dialog never jumps as results arrive.
 */
export function AddGamesDialog({
  onClose,
  existingIgdbIds,
  onAdded,
}: {
  onClose: () => void;
  existingIgdbIds: Set<number>;
  onAdded: (rows: UserGameRow[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IGDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedFor, setSearchedFor] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueuedGame[]>([]);
  const [menu, setMenu] = useState<{
    anchor: MenuAnchor;
    game: { igdbId: number; title: string; coverImageId: string | null };
  } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const abortRef = useRef<AbortController>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu, onClose]);

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!/^\d+$/.test(trimmed) && trimmed.length < 2) {
      abortRef.current?.abort();
      setIsSearching(false);
      setResults([]);
      setSearchedFor(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/igdb?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setSearchedFor(trimmed);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setResults([]);
      setSearchedFor(trimmed);
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Show the loading state during the debounce too, not just the fetch.
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed) || trimmed.length >= 2) setIsSearching(true);
    debounceRef.current = setTimeout(() => search(value), 300);
  }

  function queueGame(
    game: { igdbId: number; title: string; coverImageId: string | null },
    category: string
  ) {
    setQueue((prev) =>
      prev.some((q) => q.igdbId === game.igdbId)
        ? prev.map((q) => (q.igdbId === game.igdbId ? { ...q, category } : q))
        : [...prev, { ...game, category }]
    );
  }

  function unqueue(igdbId: number) {
    setQueue((prev) => prev.filter((q) => q.igdbId !== igdbId));
  }

  function openMenu(
    el: HTMLElement,
    game: { igdbId: number; title: string; coverImageId: string | null }
  ) {
    setMenu({ anchor: anchorBelow(el, "end"), game });
  }

  async function handleAdd() {
    if (queue.length === 0) return;
    setIsAdding(true);
    try {
      const outcome = await bulkAddGames(
        queue.map((q) => ({ igdbId: q.igdbId, category: q.category }))
      );
      const rows = outcome.filter((r) => r.ok && r.row).map((r) => r.row!);
      if (rows.length > 0) onAdded(rows);
      const skipped = outcome.length - rows.length;
      if (rows.length === 1) {
        const cat = CATEGORIES.find((c) => c.id === rows[0].category);
        toast.success(`Added "${rows[0].title}" to ${cat?.label ?? "library"}`);
      } else if (rows.length > 1) {
        toast.success(`Added ${rows.length} games to your library`);
      }
      if (skipped > 0)
        toast.warning(
          `${skipped} game${skipped !== 1 ? "s" : ""} skipped (already in library)`
        );
      onClose();
    } catch {
      toast.error("Failed to add games");
    } finally {
      setIsAdding(false);
    }
  }

  const menuQueued = menu
    ? queue.find((q) => q.igdbId === menu.game.igdbId)
    : undefined;
  const showSkeleton = isSearching && results.length === 0;

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
        aria-labelledby="add-games-title"
        className="bg-surface-elevated border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-xl flex flex-col max-h-[92dvh]"
      >
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-4">
          <div>
            <h2 id="add-games-title" className="text-lg font-semibold">
              Add games
            </h2>
            <p className="text-xs text-white/35 mt-0.5">
              Pick a status for each game, then add them all at once.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="size-10 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors -mr-2 -mt-1 flex-none"
          >
            ✕
          </button>
        </div>

        <div className="px-5 sm:px-6">
          <div className="relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search games by name"
              aria-label="Search games"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/25"
            />
            {isSearching && (
              <span
                className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-white/15 border-t-white/60 animate-spin"
                aria-label="Searching"
              />
            )}
          </div>
        </div>

        <div className="mt-3 h-[min(50dvh,24rem)] overflow-y-auto px-3 sm:px-4">
          {showSkeleton ? (
            <ResultSkeleton />
          ) : results.length > 0 ? (
            <ul
              className={`space-y-0.5 pb-2 transition-opacity ${isSearching ? "opacity-50" : ""}`}
            >
              {results.map((r) => {
                const inLibrary = existingIgdbIds.has(r.igdbId);
                const queued = queue.find((q) => q.igdbId === r.igdbId);
                const queuedCat = queued
                  ? CATEGORIES.find((c) => c.id === queued.category)
                  : undefined;
                const game = {
                  igdbId: r.igdbId,
                  title: r.title,
                  coverImageId: r.coverImageId,
                };
                return (
                  <li key={r.igdbId}>
                    <div
                      className={`flex items-center gap-3 p-2 rounded-xl ${
                        inLibrary ? "opacity-45" : "hover:bg-white/4"
                      }`}
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/5 flex-none relative">
                        {r.coverImageId && (
                          <Image
                            src={
                              igdbCover(r.coverImageId, "t_cover_small") ?? ""
                            }
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-white/35 truncate">
                          {resultMeta(r)}
                        </p>
                      </div>
                      {inLibrary ? (
                        <span className="text-[11px] text-emerald-400/80 flex-none pr-2">
                          In library
                        </span>
                      ) : queuedCat ? (
                        <button
                          onClick={(e) => openMenu(e.currentTarget, game)}
                          aria-label={`${r.title}: ${queuedCat.label}. Change status`}
                          className={`flex-none inline-flex items-center gap-1.5 min-h-9 px-3 rounded-full border text-xs font-medium ${queuedCat.bg} ${queuedCat.color}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${queuedCat.bar}`}
                            aria-hidden
                          />
                          {queuedCat.label}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => openMenu(e.currentTarget, game)}
                          aria-label={`Add ${r.title}`}
                          className="flex-none min-h-9 px-3 rounded-full border border-white/10 text-xs font-medium text-white/60 hover:text-white hover:border-white/25 hover:bg-white/5 transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-white/25 text-sm pt-16">
              {searchedFor
                ? `No games found for "${searchedFor}"`
                : "Start typing to search 200,000+ games"}
            </p>
          )}
        </div>

        <div className="border-t border-white/8 p-4 sm:px-6 space-y-3">
          {/* Fixed-height strip so selecting games never resizes the dialog. */}
          <div className="flex h-8 items-center gap-1.5 overflow-x-auto">
            {queue.length === 0 ? (
              <p className="text-xs text-white/25">No games selected yet</p>
            ) : (
              <>
                {queue.map((q) => {
                  const cat = CATEGORIES.find((c) => c.id === q.category);
                  return (
                    <span
                      key={q.igdbId}
                      className={`inline-flex flex-none items-center gap-1 border rounded-full pl-2.5 pr-1 py-1 text-[11px] ${cat?.bg} ${cat?.color}`}
                    >
                      <span className="truncate max-w-32">{q.title}</span>
                      <button
                        onClick={() => unqueue(q.igdbId)}
                        aria-label={`Remove ${q.title} from selection`}
                        className="size-5 rounded-full hover:bg-white/10 flex items-center justify-center opacity-60 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            {queue.length > 0 && (
              <button
                onClick={() => setQueue([])}
                className="mr-auto text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={isAdding || queue.length === 0}
              className="min-w-32 px-5 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {isAdding
                ? "Adding…"
                : queue.length === 0
                  ? "Add games"
                  : `Add ${queue.length} game${queue.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>

      {menu && (
        <CategoryMenu
          anchor={menu.anchor}
          title={menu.game.title}
          value={menuQueued?.category}
          onSelect={(category) => queueGame(menu.game, category)}
          onRemove={menuQueued ? () => unqueue(menuQueued.igdbId) : undefined}
          removeLabel="Remove from selection"
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
