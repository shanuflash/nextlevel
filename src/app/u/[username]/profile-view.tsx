"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { igdbCover } from "@/src/lib/igdb";
import { Avatar } from "@/src/components/avatar";
import { CATEGORIES, CATEGORY_TAB_COLORS } from "@/src/lib/constants";
import { updateGame, removeGame } from "@/src/app/dashboard/games/actions";
import { GameStatusDialog } from "@/src/components/game-status-dialog";
import { removeWithUndo } from "@/src/lib/remove-with-undo";
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

function isReleased(releaseDate: string | null): boolean {
  if (!releaseDate) return false;
  return releaseDate <= new Date().toISOString().split("T")[0];
}

// Cycling aspect ratios give the masonry grid its varied-height rhythm.
const ASPECT_RATIOS = [
  "aspect-[3/4]",
  "aspect-[2/3]",
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[2/3]",
  "aspect-[3/4]",
  "aspect-[3/5]",
  "aspect-[3/4]",
];

// Small category flag shown on each cover — the color dot + label carry the
// tracking state now that there are no rating badges.
function CategoryFlag({ categoryId }: { categoryId: string }) {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  return (
    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2 py-1 text-[10px] font-semibold text-white/90">
      <span className={`size-2 rounded-full ${cat.bar}`} />
      {cat.label}
    </div>
  );
}

/* ─── Identity + Stats (bento) ─── */

function ProfileHeader({
  profile,
  counts,
}: {
  profile: ProfileData;
  counts: Record<string, number>;
}) {
  return (
    <div className="mb-6 space-y-4">
      {/* Identity + headline stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="col-span-2 flex items-center gap-4 sm:gap-5 rounded-2xl sm:rounded-3xl border border-white/8 bg-white/3 p-4 sm:p-6">
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
            <p className="text-white/40 text-sm">@{profile.username}</p>
            {profile.bio && (
              <p className="text-white/55 mt-2 text-sm line-clamp-2 max-w-sm">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/8 bg-white/3 p-4 sm:p-6 flex flex-col justify-center">
          <div className="text-3xl font-bold tabular-nums text-primary leading-none">
            {profile.totalGames}
          </div>
          <div className="text-xs text-white/40 mt-2">Total Games</div>
          <div className="absolute inset-x-0 bottom-0 h-0.75 bg-primary" />
        </div>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/8 bg-white/3 p-4 sm:p-6 flex flex-col justify-center">
          <div className="text-3xl font-bold tabular-nums text-emerald-400 leading-none">
            {profile.finishedCount}
          </div>
          <div className="text-xs text-white/40 mt-2">Finished</div>
          <div className="absolute inset-x-0 bottom-0 h-0.75 bg-emerald-500" />
        </div>
      </div>

      {/* Secondary category strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4">
          <div className="text-xl sm:text-2xl font-bold tabular-nums text-blue-400">
            {counts["playing"] || 0}
          </div>
          <div className="text-xs text-white/40 mt-1.5 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-400" />
            Playing
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4">
          <div className="text-xl sm:text-2xl font-bold tabular-nums text-amber-400">
            {counts["want-to-play"] || 0}
          </div>
          <div className="text-xs text-white/40 mt-1.5 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-400" />
            Want to Play
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4">
          <div className="text-xl sm:text-2xl font-bold tabular-nums text-orange-400">
            {counts["on-hold"] || 0}
          </div>
          <div className="text-xs text-white/40 mt-1.5 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-orange-400" />
            On Hold
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4">
          <div className="text-xl sm:text-2xl font-bold text-white/80 truncate">
            {profile.favoriteGenre}
          </div>
          <div className="text-xs text-white/40 mt-1.5">Top Genre</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Masonry Grid ─── */

function GameCard({
  game,
  aspect,
  showFlag,
  onSelect,
}: {
  game: GameWithCat;
  aspect: string;
  showFlag: boolean;
  onSelect: (g: GameWithCat) => void;
}) {
  const coverUrl = igdbCover(game.coverImageId);
  return (
    <button
      onClick={() => onSelect(game)}
      className="group relative text-left w-full"
    >
      <div
        className={`relative ${aspect} overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all duration-300 group-hover:ring-white/25 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/40`}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <div className="size-full bg-white/5" />
        )}
        {showFlag && <CategoryFlag categoryId={game.categoryId} />}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-3 pt-10">
          <p className="text-xs font-semibold leading-tight line-clamp-2">
            {game.title}
          </p>
        </div>
      </div>
    </button>
  );
}

function useColumnCount() {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1024) setCols(6);
      else if (w >= 768) setCols(5);
      else if (w >= 640) setCols(4);
      else setCols(2);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

function MasonryGrid({
  games,
  showFlag,
  onSelect,
}: {
  games: GameWithCat[];
  showFlag: boolean;
  onSelect: (g: GameWithCat) => void;
}) {
  const colCount = useColumnCount();

  const columns = useMemo(() => {
    const cols: GameWithCat[][] = Array.from({ length: colCount }, () => []);
    games.forEach((g, i) => cols[i % colCount].push(g));
    return cols;
  }, [games, colCount]);

  return (
    <div className="flex gap-2.5 sm:gap-4">
      {columns.map((col, colIdx) => (
        <div
          key={colIdx}
          className="flex-1 flex flex-col gap-2.5 sm:gap-4 min-w-0"
        >
          {col.map((g, i) => {
            const globalIdx = i * colCount + colIdx;
            const aspect = ASPECT_RATIOS[globalIdx % ASPECT_RATIOS.length];
            return (
              <GameCard
                key={g.id}
                game={g}
                aspect={aspect}
                showFlag={showFlag}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── Profile View ─── */

export function ProfileView({
  profile,
  isOwner,
}: {
  profile: ProfileData;
  isOwner: boolean;
}) {
  const searchParams = useSearchParams();

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

  const syncUrl = useCallback((category: string, release: string) => {
    const params = new URLSearchParams(window.location.search);
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    if (category === "want-to-play" && release !== "all") {
      params.set("released", release);
    } else {
      params.delete("released");
    }
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname
    );
  }, []);

  const setActiveCategory = useCallback(
    (category: string) => {
      setActiveCategoryState(category);
      syncUrl(category, releaseFilter);
    },
    [releaseFilter, syncUrl]
  );

  const setReleaseFilter = useCallback(
    (release: "all" | "released" | "unreleased") => {
      setReleaseFilterState(release);
      syncUrl(activeCategory, release);
    },
    [activeCategory, syncUrl]
  );

  const [selectedGame, setSelectedGame] = useState<GameWithCat | null>(null);
  const router = useRouter();

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

  const filteredGames = useMemo(() => {
    if (activeCategory === "all") {
      return profile.categories
        .flatMap((cat) =>
          cat.games.map((g) => ({
            ...g,
            categoryId: cat.id,
            categoryLabel: cat.label,
          }))
        )
        .sort((a, b) => {
          const aPlaying = a.categoryId === "playing" ? 0 : 1;
          const bPlaying = b.categoryId === "playing" ? 0 : 1;
          return aPlaying - bPlaying;
        });
    }
    const cat = profile.categories.find((c) => c.id === activeCategory);
    let games =
      cat?.games.map((g) => ({
        ...g,
        categoryId: cat.id,
        categoryLabel: cat.label,
      })) ?? [];
    if (activeCategory === "want-to-play" && releaseFilter !== "all") {
      games = games.filter((g) =>
        releaseFilter === "released"
          ? isReleased(g.releaseDate)
          : !isReleased(g.releaseDate)
      );
    }
    return games;
  }, [activeCategory, releaseFilter, profile.categories]);

  const wantToPlay = profile.categories.find((c) => c.id === "want-to-play");
  const releasedCount =
    wantToPlay?.games.filter((g) => isReleased(g.releaseDate)).length ?? 0;

  return (
    <>
      <ProfileHeader profile={profile} counts={counts} />

      <div className="flex gap-2 mb-6 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 min-h-11 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            activeCategory === "all"
              ? "bg-white/12 text-white border-white/20"
              : "bg-transparent text-white/40 border-white/8 hover:text-white/60 hover:border-white/15"
          }`}
        >
          All
          <span className="ml-2 text-xs opacity-60">{profile.totalGames}</span>
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
        <MasonryGrid
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
        />
      )}
    </>
  );
}
