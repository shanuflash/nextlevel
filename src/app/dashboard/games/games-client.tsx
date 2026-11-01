"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { updateGame, removeGame, setFavorite } from "./actions";
import { FavoriteToggle } from "@/src/components/favorite-toggle";
import { AddGamesDialog } from "./add-games-dialog";
import { CATEGORIES } from "@/src/lib/constants";
import {
  CategoryMenu,
  anchorBelow,
  type MenuAnchor,
} from "@/src/components/category-menu";
import { GameStatusDialog } from "@/src/components/game-status-dialog";
import { removeWithUndo } from "@/src/lib/remove-with-undo";
import { backdropPrefetchProps } from "@/src/lib/backdrop-cache";
import { toast } from "sonner";
import type { UserGameRow } from "@/src/lib/types";
import { CoverImage } from "@/src/components/cover-image";

export type { UserGameRow };

type SortBy = "newest" | "oldest" | "a-z" | "z-a" | "release";

const SORTS: { id: SortBy; label: string }[] = [
  { id: "newest", label: "Recently updated" },
  { id: "oldest", label: "Least recently updated" },
  { id: "a-z", label: "Title A–Z" },
  { id: "z-a", label: "Title Z–A" },
  { id: "release", label: "Release date" },
];

interface Filters {
  status: string;
  q: string;
  genre: string;
  platform: string;
  year: string;
  /** Only applies to Want to Play: "", "released" or "unreleased". */
  released: string;
  sort: SortBy;
}

const DEFAULT_FILTERS: Filters = {
  status: "all",
  q: "",
  genre: "",
  platform: "",
  year: "",
  released: "",
  sort: "newest",
};

function readFilters(params: URLSearchParams): Filters {
  const status = params.get("status") ?? "all";
  const sort = params.get("sort") as SortBy | null;
  return {
    status: CATEGORIES.some((c) => c.id === status) ? status : "all",
    q: params.get("q") ?? "",
    genre: params.get("genre") ?? "",
    platform: params.get("platform") ?? "",
    year: params.get("year") ?? "",
    released:
      status === "want-to-play" &&
      ["released", "unreleased"].includes(params.get("released") ?? "")
        ? params.get("released")!
        : "",
    sort: sort && SORTS.some((s) => s.id === sort) ? sort : "newest",
  };
}

function isReleased(releaseDate: string | null): boolean {
  if (!releaseDate) return false;
  return releaseDate <= new Date().toISOString().split("T")[0];
}

// Keep filters in the URL so they survive reloads, back/forward and sharing.
function writeFilters(f: Filters) {
  const params = new URLSearchParams();
  for (const key of Object.keys(f) as (keyof Filters)[]) {
    if (f[key] !== DEFAULT_FILTERS[key]) params.set(key, f[key]);
  }
  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    query ? `?${query}` : window.location.pathname
  );
}

function splitList(value: string | null): string[] {
  return value ? value.split(", ").filter(Boolean) : [];
}

function toTime(d: Date | string) {
  return d instanceof Date ? d.getTime() : new Date(d).getTime();
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative min-w-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 w-full appearance-none truncate rounded-xl border bg-white/5 pl-3 pr-8 text-xs font-medium focus:border-primary/40 focus:outline-none ${
          value ? "border-white/20 text-white" : "border-white/10 text-white/55"
        }`}
      >
        {children}
      </select>
      <svg
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-white/35"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m7 10 5 5 5-5" />
      </svg>
    </label>
  );
}

export function GamesClient({ games: initialGames }: { games: UserGameRow[] }) {
  const searchParams = useSearchParams();
  const [games, setGames] = useState(initialGames);
  const [filters, setFilters] = useState(() => readFilters(searchParams));
  // /dashboard/games?add=1 (dashboard "Add games") opens the dialog directly.
  const [isShowingAdd, setIsShowingAdd] = useState(
    () => searchParams.get("add") === "1"
  );
  const [openGameId, setOpenGameId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{
    anchor: MenuAnchor;
    gameId: string;
  } | null>(null);

  useEffect(() => {
    // Drop ?add=1 once it has opened the dialog.
    if (new URLSearchParams(window.location.search).has("add")) {
      writeFilters(readFilters(new URLSearchParams(window.location.search)));
    }
  }, []);

  function updateFilters(patch: Partial<Filters>) {
    // Write the URL outside the state updater: updaters run during render,
    // and replaceState there makes Next's router update mid-render.
    const next = { ...filters, ...patch };
    setFilters(next);
    writeFilters(next);
  }

  const existingIgdbIds = new Set(games.map((g) => g.igdbId));

  const openGame = games.find((g) => g.id === openGameId) ?? null;
  const menuGame = menu ? games.find((g) => g.id === menu.gameId) : undefined;

  async function toggleFavorite(game: UserGameRow) {
    const next = !game.isFavorite;
    setGames((prev) =>
      prev.map((g) => (g.id === game.id ? { ...g, isFavorite: next } : g))
    );
    try {
      await setFavorite(game.id, next);
      toast.success(
        next ? `Pinned "${game.title}" to your profile` : "Unpinned"
      );
    } catch (e) {
      handleRevert(game);
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

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

  const options = useMemo(() => {
    const genres = new Set<string>();
    const platforms = new Set<string>();
    const years = new Set<string>();
    for (const g of games) {
      splitList(g.genre).forEach((x) => genres.add(x));
      splitList(g.platforms).forEach((x) => platforms.add(x));
      if (g.releaseDate) years.add(g.releaseDate.slice(0, 4));
    }
    return {
      genres: [...genres].sort(),
      platforms: [...platforms].sort(),
      years: [...years].sort().reverse(),
    };
  }, [games]);

  const q = filters.q.trim().toLowerCase();
  const matchesNonStatus = (g: UserGameRow) =>
    (!q || g.title.toLowerCase().includes(q)) &&
    (!filters.genre || splitList(g.genre).includes(filters.genre)) &&
    (!filters.platform || splitList(g.platforms).includes(filters.platform)) &&
    (!filters.year || Boolean(g.releaseDate?.startsWith(filters.year)));

  // Status counts reflect the other active filters, so chips never lie.
  const narrowed = games.filter(matchesNonStatus);
  const countFor = (status: string) =>
    narrowed.filter((g) => g.category === status).length;
  const inStatus =
    filters.status === "all"
      ? narrowed
      : narrowed.filter((g) => g.category === filters.status);
  const releasedCount = inStatus.filter((g) =>
    isReleased(g.releaseDate)
  ).length;
  const filtered = !filters.released
    ? inStatus
    : inStatus.filter(
        (g) => isReleased(g.releaseDate) === (filters.released === "released")
      );

  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case "a-z":
        return a.title.localeCompare(b.title);
      case "z-a":
        return b.title.localeCompare(a.title);
      case "release":
        return (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "");
      default: {
        const diff = toTime(b.updatedAt) - toTime(a.updatedAt);
        const timeDiff = filters.sort === "newest" ? diff : -diff;
        return timeDiff !== 0 ? timeDiff : a.title.localeCompare(b.title);
      }
    }
  });

  const hasFilters = Boolean(
    q || filters.genre || filters.platform || filters.year
  );
  const statusOptions = [
    { id: "all", label: "All", count: narrowed.length },
    ...CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      count: countFor(c.id),
    })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Games</h1>
          <p className="text-white/40 text-sm mt-1">
            {games.length} game{games.length !== 1 ? "s" : ""} in your catalog
          </p>
        </div>
        <button
          onClick={() => setIsShowingAdd(true)}
          className="min-h-11 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          + Add Games
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative lg:w-72 lg:flex-none">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/30"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={filters.q}
              onChange={(e) => updateFilters({ q: e.target.value })}
              placeholder="Search your library"
              aria-label="Search your library"
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 text-sm focus:border-primary/40 focus:outline-none placeholder:text-white/25"
            />
          </div>
          <div className="hidden sm:flex flex-wrap gap-2 lg:ml-2">
            {statusOptions.map((opt) => {
              const cat = CATEGORIES.find((c) => c.id === opt.id);
              const isActive = filters.status === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() =>
                    updateFilters({ status: opt.id, released: "" })
                  }
                  aria-pressed={isActive}
                  className={`shrink-0 min-h-10 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isActive
                      ? cat
                        ? `${cat.bg} ${cat.color}`
                        : "bg-white/12 text-white border-white/20"
                      : "text-white/40 border-white/8 hover:text-white/60"
                  }`}
                >
                  {opt.label} ({opt.count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <div className="sm:hidden">
            <FilterSelect
              label="Filter by status"
              value={filters.status === "all" ? "" : filters.status}
              onChange={(v) =>
                updateFilters({ status: v || "all", released: "" })
              }
            >
              <option value="">All statuses ({narrowed.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} ({countFor(cat.id)})
                </option>
              ))}
            </FilterSelect>
          </div>
          <div className="sm:w-40">
            <FilterSelect
              label="Filter by genre"
              value={filters.genre}
              onChange={(genre) => updateFilters({ genre })}
            >
              <option value="">All genres</option>
              {options.genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </FilterSelect>
          </div>
          <div className="sm:w-40">
            <FilterSelect
              label="Filter by platform"
              value={filters.platform}
              onChange={(platform) => updateFilters({ platform })}
            >
              <option value="">All platforms</option>
              {options.platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </FilterSelect>
          </div>
          <div className="sm:w-32">
            <FilterSelect
              label="Filter by release year"
              value={filters.year}
              onChange={(year) => updateFilters({ year })}
            >
              <option value="">Any year</option>
              {options.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </FilterSelect>
          </div>
          {hasFilters && (
            <button
              onClick={() =>
                updateFilters({ q: "", genre: "", platform: "", year: "" })
              }
              className="h-10 px-3 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Clear filters
            </button>
          )}
          <div className="col-span-2 sm:col-span-1 sm:ml-auto sm:w-56">
            <FilterSelect
              label="Sort games"
              value={filters.sort}
              onChange={(sort) => updateFilters({ sort: sort as SortBy })}
            >
              {SORTS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  Sort: {opt.label}
                </option>
              ))}
            </FilterSelect>
          </div>
        </div>

        {filters.status === "want-to-play" && (
          <div className="flex flex-wrap gap-2">
            {[
              { id: "", label: "All", count: inStatus.length },
              { id: "released", label: "Released", count: releasedCount },
              {
                id: "unreleased",
                label: "Unreleased",
                count: inStatus.length - releasedCount,
              },
            ].map((sub) => {
              const isActive = filters.released === sub.id;
              return (
                <button
                  key={sub.id || "all"}
                  onClick={() => updateFilters({ released: sub.id })}
                  aria-pressed={isActive}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isActive
                      ? "bg-white/12 text-white border-white/20"
                      : "text-white/40 border-white/8 hover:text-white/60 hover:border-white/15"
                  }`}
                >
                  {sub.label}
                  <span className="ml-1.5 opacity-60">{sub.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-white/3 rounded-2xl border border-white/8">
          <p className="text-white/40 text-sm">
            {games.length === 0
              ? "No games yet. Add your first game above."
              : hasFilters
                ? "No games match these filters."
                : filters.released
                  ? `No ${filters.released} games in Want to Play.`
                  : "No games in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {sorted.map((g) => {
            const cat = CATEGORIES.find((c) => c.id === g.category);
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
                  {...backdropPrefetchProps(g.igdbId)}
                  aria-label={`${g.title}${cat ? `, ${cat.label}` : ""}`}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-3/4 overflow-hidden rounded-xl sm:rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/25 sm:group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/40">
                    <CoverImage imageId={g.coverImageId} />
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
        >
          <FavoriteToggle
            isFavorite={openGame.isFavorite}
            onToggle={() => toggleFavorite(openGame)}
          />
        </GameStatusDialog>
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
