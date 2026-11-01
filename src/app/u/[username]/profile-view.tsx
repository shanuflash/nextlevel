"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/src/components/avatar";
import { CoverImage } from "@/src/components/cover-image";
import { CATEGORIES, CATEGORY_TAB_COLORS } from "@/src/lib/constants";
import {
  updateGame,
  removeGame,
  setGameStatus,
} from "@/src/app/dashboard/games/actions";
import { GameStatusDialog } from "@/src/components/game-status-dialog";
import {
  CategoryMenu,
  anchorBelow,
  type MenuAnchor,
} from "@/src/components/category-menu";
import { removeWithUndo } from "@/src/lib/remove-with-undo";
import { backdropPrefetchProps } from "@/src/lib/backdrop-cache";
import { toast } from "sonner";

interface GameItem {
  id: string;
  category: string;
  igdbId: number;
  title: string;
  slug: string;
  coverImageId: string | null;
  genre: string | null;
  releaseDate: string | null;
  updatedAt: Date;
}

interface Category {
  id: string;
  label: string;
  games: GameItem[];
}

interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  totalGames: number;
  favoriteGenre: string;
  joinedDate: string;
  finishedCount: number;
  categories: Category[];
}

type GameWithCat = GameItem & { categoryId: string; categoryLabel: string };

type SortBy = "updated" | "title" | "release";
const SORTS: { id: SortBy; label: string }[] = [
  { id: "updated", label: "Recently updated" },
  { id: "title", label: "Title A–Z" },
  { id: "release", label: "Release date" },
];

// Cards render in pages so a 500-game catalog doesn't mount 500 images.
const PAGE_SIZE = 36;

function isReleased(releaseDate: string | null): boolean {
  if (!releaseDate) return false;
  return releaseDate <= new Date().toISOString().split("T")[0];
}

function toTime(d: Date | string) {
  return d instanceof Date ? d.getTime() : new Date(d).getTime();
}

// Small category flag shown on each cover in the "All" view.
function CategoryFlag({ categoryId }: { categoryId: string }) {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  return (
    <div className="absolute top-2 left-2 z-10 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-full bg-black/55 backdrop-blur-sm px-2 py-1 text-[10px] font-semibold text-white/90">
      <span className={`size-2 flex-none rounded-full ${cat.bar}`} />
      <span className="truncate">{cat.label}</span>
    </div>
  );
}

/* ─── Identity + stats ─── */

function ShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/u/${username}`;
    // Native share sheet on phones; clipboard everywhere else.
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: `@${username} on NextLevel`, url });
        return;
      } catch {
        /* dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <button
      onClick={share}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white"
    >
      {copied ? "Link copied" : "Share profile"}
    </button>
  );
}

function ProfileHeader({
  profile,
  counts,
  isOwner,
}: {
  profile: ProfileData;
  counts: Record<string, number>;
  isOwner: boolean;
}) {
  const stats = [
    {
      label: "Games",
      value: profile.totalGames,
      className: "text-primary",
    },
    ...CATEGORIES.filter((c) => c.id !== "dropped").map((c) => ({
      label: c.label,
      value: counts[c.id] || 0,
      className: c.color,
    })),
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-4 rounded-2xl sm:rounded-3xl border border-white/8 bg-white/3 p-4 sm:flex-row sm:items-center sm:p-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <Avatar
            name={profile.displayName}
            image={profile.avatarUrl}
            size="lg"
            showRing
          />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">
              {profile.displayName}
            </h1>
            <p className="text-white/40 text-sm">
              @{profile.username}
              <span className="text-white/20">
                {" "}
                · Joined {profile.joinedDate}
              </span>
            </p>
            {profile.bio && (
              <p className="text-white/55 mt-2 text-sm line-clamp-2 max-w-md">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 sm:flex-none">
          <ShareButton username={profile.username} />
          {isOwner && (
            <Link
              href="/dashboard/settings"
              className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white"
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      {/* One strip instead of six tiles: scrolls sideways on phones. */}
      <div className="flex overflow-x-auto rounded-2xl border border-white/8 bg-white/3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex-none border-r border-white/8 px-4 py-3 sm:flex-1 sm:px-5"
          >
            <div
              className={`text-lg sm:text-xl font-bold tabular-nums leading-none ${s.className}`}
            >
              {s.value}
            </div>
            <div className="mt-1.5 whitespace-nowrap text-[11px] text-white/40">
              {s.label}
            </div>
          </div>
        ))}
        <div className="flex-none px-4 py-3 sm:flex-1 sm:px-5">
          <div className="whitespace-nowrap text-sm font-semibold leading-tight text-white/80">
            {profile.favoriteGenre}
          </div>
          <div className="mt-1.5 whitespace-nowrap text-[11px] text-white/40">
            Top genre
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Grid ─── */

function GameCard({
  game,
  showFlag,
  onSelect,
}: {
  game: GameWithCat;
  showFlag: boolean;
  onSelect: (g: GameWithCat) => void;
}) {
  return (
    <button
      onClick={() => onSelect(game)}
      {...backdropPrefetchProps(game.igdbId)}
      aria-label={`${game.title}, ${game.categoryLabel}`}
      className="group relative text-left w-full"
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-xl sm:rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all duration-300 group-hover:ring-white/25 sm:group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/40">
        <CoverImage imageId={game.coverImageId} />
        {showFlag && <CategoryFlag categoryId={game.categoryId} />}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/35 to-transparent p-2 sm:p-3 pt-8 sm:pt-10">
          <p className="text-[10px] sm:text-xs font-semibold leading-tight line-clamp-2">
            {game.title}
          </p>
        </div>
      </div>
    </button>
  );
}

function PagedGrid({
  games,
  showFlag,
  onSelect,
}: {
  games: GameWithCat[];
  showFlag: boolean;
  onSelect: (g: GameWithCat) => void;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visible < games.length;

  // Load the next page shortly before the user reaches the end.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible((v) => v + PAGE_SIZE);
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
        {games.slice(0, visible).map((g) => (
          <GameCard
            key={g.id}
            game={g}
            showFlag={showFlag}
            onSelect={onSelect}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="mt-6 flex justify-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="min-h-10 rounded-full border border-white/10 bg-white/5 px-5 text-xs font-medium text-white/60 hover:text-white"
          >
            Show more ({games.length - visible} left)
          </button>
        </div>
      )}
    </>
  );
}

/* ─── Visitor's own status, inside the game sheet ─── */

function VisitorStatus({
  game,
  isLoggedIn,
  category,
  onChange,
}: {
  game: GameWithCat;
  isLoggedIn: boolean;
  category: string | undefined;
  onChange: (igdbId: number, category: string) => void;
}) {
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);

  if (!isLoggedIn) {
    return (
      <Link
        href="/signup"
        className="flex min-h-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        Sign up to track this game
      </Link>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === category);
  return (
    <>
      <button
        onClick={(e) => setAnchor(anchorBelow(e.currentTarget, "start"))}
        aria-haspopup="menu"
        className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${
          cat
            ? `${cat.bg} ${cat.color}`
            : "border-primary/25 bg-primary/10 text-primary hover:bg-primary/20"
        }`}
      >
        {cat ? (
          <>
            <span className={`size-2 rounded-full ${cat.bar}`} aria-hidden />
            In your library: {cat.label}
          </>
        ) : (
          "+ Add to my library"
        )}
      </button>
      {anchor && (
        <CategoryMenu
          anchor={anchor}
          title="Your status"
          value={category}
          onSelect={(next) => onChange(game.igdbId, next)}
          onClose={() => setAnchor(null)}
        />
      )}
    </>
  );
}

/* ─── Profile View ─── */

export function ProfileView({
  profile,
  isOwner,
  isLoggedIn,
  viewerCategories,
}: {
  profile: ProfileData;
  isOwner: boolean;
  isLoggedIn: boolean;
  /** Logged-in visitor's own statuses, keyed by igdbId. */
  viewerCategories: Record<number, string>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of profile.categories) map[cat.id] = cat.games.length;
    return map;
  }, [profile.categories]);

  const validCategories = useMemo(
    () => new Set(["all", ...profile.categories.map((c) => c.id)]),
    [profile.categories]
  );

  const [activeCategory, setActiveCategoryState] = useState(() => {
    const param = searchParams.get("category");
    return param && validCategories.has(param) ? param : "all";
  });

  const [releaseFilter, setReleaseFilterState] = useState<
    "all" | "released" | "unreleased"
  >(() => {
    const param = searchParams.get("released");
    return param === "released" || param === "unreleased" ? param : "all";
  });

  const [sortBy, setSortByState] = useState<SortBy>(() => {
    const param = searchParams.get("sort") as SortBy | null;
    return param && SORTS.some((s) => s.id === param) ? param : "updated";
  });

  const syncUrl = useCallback(
    (category: string, release: string, sort: SortBy) => {
      const params = new URLSearchParams(window.location.search);
      if (category === "all") params.delete("category");
      else params.set("category", category);
      if (category === "want-to-play" && release !== "all") {
        params.set("released", release);
      } else {
        params.delete("released");
      }
      if (sort === "updated") params.delete("sort");
      else params.set("sort", sort);
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        query ? `?${query}` : window.location.pathname
      );
    },
    []
  );

  const setActiveCategory = (category: string) => {
    setActiveCategoryState(category);
    syncUrl(category, releaseFilter, sortBy);
  };
  const setReleaseFilter = (release: "all" | "released" | "unreleased") => {
    setReleaseFilterState(release);
    syncUrl(activeCategory, release, sortBy);
  };
  const setSortBy = (sort: SortBy) => {
    setSortByState(sort);
    syncUrl(activeCategory, releaseFilter, sort);
  };

  const [selectedGame, setSelectedGame] = useState<GameWithCat | null>(null);
  const [viewerStatus, setViewerStatus] = useState(viewerCategories);

  // Profile data comes from the server, so refresh it after each change.
  async function changeCategory(game: GameWithCat, category: string) {
    try {
      await updateGame(game.id, category);
      const cat = CATEGORIES.find((c) => c.id === category);
      toast.success(`Moved "${game.title}" to ${cat?.label ?? category}`);
      router.refresh();
    } catch {
      toast.error("Failed to update game");
    }
  }

  function remove(game: GameWithCat) {
    removeWithUndo({
      title: game.title,
      remove: async () => {
        const removed = await removeGame(game.id);
        router.refresh();
        return removed;
      },
      onFailed: () => router.refresh(),
      onRestored: () => router.refresh(),
    });
  }

  async function setVisitorStatus(igdbId: number, category: string) {
    const prev = viewerStatus[igdbId];
    setViewerStatus((m) => ({ ...m, [igdbId]: category }));
    try {
      await setGameStatus({ igdbId, category });
      const label = CATEGORIES.find((c) => c.id === category)?.label;
      toast.success(
        prev ? `Moved to ${label} in your library` : `Added to your ${label}`
      );
    } catch (e) {
      setViewerStatus((m) => {
        const next = { ...m };
        if (prev) next[igdbId] = prev;
        else delete next[igdbId];
        return next;
      });
      toast.error(e instanceof Error ? e.message : "Failed to add game");
    }
  }

  const filteredGames = useMemo(() => {
    const scoped =
      activeCategory === "all"
        ? profile.categories
        : profile.categories.filter((c) => c.id === activeCategory);
    let games: GameWithCat[] = scoped.flatMap((cat) =>
      cat.games.map((g) => ({
        ...g,
        categoryId: cat.id,
        categoryLabel: cat.label,
      }))
    );
    if (activeCategory === "want-to-play" && releaseFilter !== "all") {
      games = games.filter((g) =>
        releaseFilter === "released"
          ? isReleased(g.releaseDate)
          : !isReleased(g.releaseDate)
      );
    }
    return games.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "release") {
        return (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "");
      }
      return toTime(b.updatedAt) - toTime(a.updatedAt);
    });
  }, [activeCategory, releaseFilter, sortBy, profile.categories]);

  const wantToPlay = profile.categories.find((c) => c.id === "want-to-play");
  const releasedCount =
    wantToPlay?.games.filter((g) => isReleased(g.releaseDate)).length ?? 0;

  return (
    <>
      <ProfileHeader profile={profile} counts={counts} isOwner={isOwner} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2 overflow-x-auto -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 min-h-11 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeCategory === "all"
                ? "bg-white/12 text-white border-white/20"
                : "bg-transparent text-white/40 border-white/8 hover:text-white/60 hover:border-white/15"
            }`}
          >
            All
            <span className="ml-2 text-xs opacity-60">
              {profile.totalGames}
            </span>
          </button>
          {profile.categories.map((cat) => {
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 min-h-11 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  isActive
                    ? (CATEGORY_TAB_COLORS[cat.id] ??
                      "bg-white/15 text-white border-white/20")
                    : "bg-transparent text-white/40 border-white/8 hover:text-white/60 hover:border-white/15"
                }`}
              >
                {cat.label}
                <span className="ml-2 text-xs opacity-60">
                  {cat.games.length}
                </span>
              </button>
            );
          })}
        </div>
        <label className="relative sm:w-48 sm:flex-none">
          <span className="sr-only">Sort games</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-3 pr-8 text-xs font-medium text-white/70 focus:border-primary/40 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                Sort: {s.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-white/35"
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

      {activeCategory === "want-to-play" && wantToPlay && (
        <div className="flex flex-wrap gap-2 mb-6 -mt-2">
          {(
            [
              { id: "all", label: "All", count: wantToPlay.games.length },
              { id: "released", label: "Released", count: releasedCount },
              {
                id: "unreleased",
                label: "Unreleased",
                count: wantToPlay.games.length - releasedCount,
              },
            ] as const
          ).map((sub) => {
            const isActive = releaseFilter === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setReleaseFilter(sub.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? "bg-white/12 text-white border-white/20"
                    : "bg-transparent text-white/40 border-white/8 hover:text-white/60 hover:border-white/15"
                }`}
              >
                {sub.label}
                <span className="ml-1.5 opacity-60">{sub.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {filteredGames.length === 0 ? (
        <div className="text-center py-16 bg-white/3 rounded-2xl border border-white/8">
          <p className="text-white/40 text-sm">No games in this catalog yet.</p>
        </div>
      ) : (
        <PagedGrid
          // Remount on filter/sort change so paging restarts at the top.
          key={`${activeCategory}-${releaseFilter}-${sortBy}`}
          games={filteredGames}
          showFlag={activeCategory === "all"}
          onSelect={setSelectedGame}
        />
      )}

      {selectedGame && (
        <GameStatusDialog
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onChangeCategory={
            isOwner
              ? (category) => changeCategory(selectedGame, category)
              : undefined
          }
          onRemove={isOwner ? () => remove(selectedGame) : undefined}
        >
          {!isOwner && (
            <VisitorStatus
              game={selectedGame}
              isLoggedIn={isLoggedIn}
              category={viewerStatus[selectedGame.igdbId]}
              onChange={setVisitorStatus}
            />
          )}
        </GameStatusDialog>
      )}
    </>
  );
}
