"use client";

import { useState } from "react";
import Image from "next/image";
import { updateGame, removeGame } from "./actions";
import { AddGamesDialog } from "./add-games-dialog";
import { igdbCover } from "@/src/lib/igdb";
import { CATEGORIES } from "@/src/lib/constants";
import {
  CategoryMenu,
  anchorBelow,
  type MenuAnchor,
} from "@/src/components/category-menu";
import { GameStatusDialog } from "@/src/components/game-status-dialog";
import { removeWithUndo } from "@/src/lib/remove-with-undo";
import { toast } from "sonner";
import type { UserGameRow } from "@/src/lib/types";

export type { UserGameRow };

type SortBy = "newest" | "oldest" | "a-z" | "z-a";

export function GamesClient({ games: initialGames }: { games: UserGameRow[] }) {
  const [games, setGames] = useState(initialGames);
  const [isShowingAdd, setIsShowingAdd] = useState(false);
  const [openGameId, setOpenGameId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{
    anchor: MenuAnchor;
    gameId: string;
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  const existingIgdbIds = new Set(games.map((g) => g.igdbId));

  const openGame = games.find((g) => g.id === openGameId) ?? null;
  const menuGame = menu ? games.find((g) => g.id === menu.gameId) : undefined;

  async function changeCategory(game: UserGameRow, category: string) {
    setGames((prev) =>
      prev.map((g) => (g.id === game.id ? { ...g, category } : g))
    );
    try {
      await updateGame(game.id, category);
      const cat = CATEGORIES.find((c) => c.id === category);
      toast.success(`Moved "${game.title}" to ${cat?.label ?? category}`);
    } catch {
      handleRevert(game);
      toast.error("Failed to update game");
    }
  }

  function remove(game: UserGameRow) {
    setGames((prev) => prev.filter((g) => g.id !== game.id));
    removeWithUndo({
      title: game.title,
      remove: () => removeGame(game.id),
      onFailed: () => handleRevert(game),
      onRestored: () => handleRevert(game),
    });
  }

  function handleAdded(rows: UserGameRow[]) {
    setGames((prev) => {
      const existing = new Set(prev.map((g) => g.id));
      const next = rows.filter((r) => !existing.has(r.id));
      return next.length > 0 ? [...prev, ...next] : prev;
    });
  }

  function handleRevert(game: UserGameRow) {
    setGames((prev) => {
      const exists = prev.some((g) => g.id === game.id);
      return exists
        ? prev.map((g) => (g.id === game.id ? game : g))
        : [...prev, game];
    });
  }

  const filtered =
    activeCategory === "all"
      ? games
      : games.filter((g) => g.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "a-z" || sortBy === "z-a") {
      const cmp = a.title.localeCompare(b.title);
      return sortBy === "a-z" ? cmp : -cmp;
    }
    const aTime =
      a.updatedAt instanceof Date
        ? a.updatedAt.getTime()
        : new Date(a.updatedAt).getTime();
    const bTime =
      b.updatedAt instanceof Date
        ? b.updatedAt.getTime()
        : new Date(b.updatedAt).getTime();
    const timeDiff = sortBy === "newest" ? bTime - aTime : aTime - bTime;
    return timeDiff !== 0 ? timeDiff : a.title.localeCompare(b.title);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Games</h1>
          <p className="text-white/40 text-sm mt-1">
            {games.length} game{games.length !== 1 ? "s" : ""} in your catalog
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <button
            onClick={() => setIsShowingAdd(true)}
            className="col-span-2 min-h-11 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            + Add Games
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <label className="relative">
          <span className="sr-only">Filter by category</span>
          <select
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 pr-8 text-sm font-medium text-white/80 focus:border-primary/40 focus:outline-none"
          >
            <option value="all">All games ({games.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label} ({games.filter((g) => g.category === cat.id).length}
                )
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/35"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m7 10 5 5 5-5"
            />
          </svg>
        </label>
        <label className="relative">
          <span className="sr-only">Sort games</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortBy)}
            className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 pr-8 text-sm font-medium text-white/80 focus:border-primary/40 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="a-z">A–Z</option>
            <option value="z-a">Z–A</option>
          </select>
          <svg
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/35"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m7 10 5 5 5-5"
            />
          </svg>
        </label>
      </div>

      <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 min-h-10 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeCategory === "all"
                ? "bg-white/12 text-white border-white/20"
                : "text-white/40 border-white/8 hover:text-white/60"
            }`}
          >
            All ({games.length})
          </button>
          {CATEGORIES.map((cat) => {
            const catCount = games.filter((g) => g.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 min-h-10 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeCategory === cat.id
                    ? cat.bg + " " + cat.color
                    : "text-white/40 border-white/8 hover:text-white/60"
                }`}
              >
                {cat.label} ({catCount})
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[11px] text-white/30">Sort:</span>
          {(
            [
              { id: "a-z", label: "A–Z" },
              { id: "z-a", label: "Z–A" },
              { id: "newest", label: "Newest" },
              { id: "oldest", label: "Oldest" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`shrink-0 min-h-9 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                sortBy === opt.id
                  ? "bg-white/12 text-white border-white/20"
                  : "text-white/40 border-white/8 hover:text-white/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/3 rounded-2xl border border-white/8">
          <p className="text-white/40 text-sm">
            {activeCategory === "all"
              ? "No games yet. Add your first game above."
              : "No games in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {sorted.map((g) => {
            const cat = CATEGORIES.find((c) => c.id === g.category);
            const coverUrl = igdbCover(g.coverImageId);
            return (
              <div
                key={g.id}
                className="group relative"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({
                    anchor: { x: e.clientX, y: e.clientY },
                    gameId: g.id,
                  });
                }}
              >
                <button
                  onClick={() => setOpenGameId(g.id)}
                  aria-label={`${g.title}${cat ? `, ${cat.label}` : ""}`}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-3/4 overflow-hidden rounded-xl sm:rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/25 sm:group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/40">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, (max-width: 768px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="size-full bg-white/5" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-2 sm:p-3 pt-8 sm:pt-10">
                      <p className="text-[10px] sm:text-xs font-semibold leading-tight line-clamp-2">
                        {g.title}
                      </p>
                      {cat && (
                        <p
                          className={`flex items-center gap-1 text-[10px] mt-0.5 ${cat.color}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${cat.bar}`}
                            aria-hidden
                          />
                          {cat.label}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
                {/* Desktop quick status; on touch the card opens the sheet. */}
                <button
                  onClick={(e) =>
                    setMenu({
                      anchor: anchorBelow(e.currentTarget, "end"),
                      gameId: g.id,
                    })
                  }
                  aria-label={`Change status for ${g.title}`}
                  className="absolute top-2 right-2 hidden sm:flex items-center justify-center size-8 rounded-full bg-black/60 text-white/80 backdrop-blur-sm ring-1 ring-white/15 opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100 hover:bg-black/80 hover:text-white sm:group-hover:-translate-y-1"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="currentColor"
                    aria-hidden
                  >
                    <circle cx="5" cy="12" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="19" cy="12" r="1.8" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {isShowingAdd && (
        <AddGamesDialog
          onClose={() => setIsShowingAdd(false)}
          existingIgdbIds={existingIgdbIds}
          onAdded={handleAdded}
        />
      )}
      {openGame && (
        <GameStatusDialog
          game={openGame}
          onClose={() => setOpenGameId(null)}
          onChangeCategory={(category) => changeCategory(openGame, category)}
          onRemove={() => remove(openGame)}
        />
      )}
      {menu && menuGame && (
        <CategoryMenu
          anchor={menu.anchor}
          title={menuGame.title}
          value={menuGame.category}
          onSelect={(category) => changeCategory(menuGame, category)}
          onRemove={() => remove(menuGame)}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
