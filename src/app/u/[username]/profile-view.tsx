"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { igdbCover } from "@/src/lib/igdb";
import { Avatar } from "@/src/components/avatar";
import {
  CATEGORIES,
  CATEGORY_TAB_COLORS,
  CATEGORY_BADGE_COLORS,
} from "@/src/lib/constants";
import { updateGame, removeGame } from "@/src/app/dashboard/games/actions";
import { toast } from "sonner";
import { RatingSlider } from "@/src/components/rating-slider";

interface GameItem {
  id: string;
  category: string;
  rating: number | null;
  igdbId: number;
  title: string;
  slug: string;
  coverImageId: string | null;
  genre: string | null;
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

// Cycling aspect ratios for visual variety in the masonry layout
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

/* ─── Game Detail / Edit Modal ─── */

function GameModal({
  game,
  isOwner,
  onClose,
}: {
  game: GameItem & { categoryId: string; categoryLabel: string };
  isOwner: boolean;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [editCategory, setEditCategory] = useState(game.category);
  const [editRating, setEditRating] = useState<number | null>(game.rating);
  const coverUrl = igdbCover(game.coverImageId, "t_cover_big");
  const cat = CATEGORIES.find((c) => c.id === game.category);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await updateGame(formData);
      toast.success(`Updated "${game.title}"`);
      onClose();
    } catch {
      toast.error("Failed to update game");
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemove() {
    const fd = new FormData();
    fd.set("userGameId", game.id);
    try {
      await removeGame(fd);
      toast.success(`Removed "${game.title}" from your catalog`);
      onClose();
    } catch {
      toast.error("Failed to remove game");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Cover image header */}
        <div className="relative aspect-video overflow-hidden bg-white/5">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={game.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
            />
          ) : (
            <div className="size-full bg-white/5" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-[#12121a] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 size-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 -mt-8 relative space-y-4">
          {/* Title & meta */}
          <div>
            <h2 className="text-xl font-bold leading-tight">{game.title}</h2>
            {game.genre && (
              <p className="text-xs text-white/40 mt-1">{game.genre}</p>
            )}
          </div>

          {/* Current status */}
          {!isEditing && (
            <div className="flex items-center gap-3">
              {cat && (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${
                    CATEGORY_BADGE_COLORS[game.categoryId] ??
                    "bg-white/10 text-white/60 border-white/20"
                  }`}
                >
                  {game.categoryLabel}
                </span>
              )}
              {game.rating && (
                <span className="text-xs font-bold text-amber-400">
                  ★ {game.rating}/10
                </span>
              )}
            </div>
          )}

          {/* Edit form (owner only) */}
          {isOwner && isEditing && (
            <form action={handleSubmit} className="space-y-4">
              <input type="hidden" name="userGameId" value={game.id} />
              <input type="hidden" name="category" value={editCategory} />

              <div>
                <label className="text-xs text-white/40 block mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditCategory(c.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                        editCategory === c.id
                          ? c.bg + " " + c.color
                          : "border-white/8 text-white/40 hover:text-white/60"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 block mb-1.5">
                  Rating (1-10)
                </label>
                <RatingSlider
                  value={editRating}
                  onChange={setEditRating}
                  name="rating"
                />
              </div>

              <div className="flex justify-between pt-1">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Remove
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Action buttons */}
          {!isEditing && (
            <div className="flex gap-2 pt-1">
              <Link
                href={`/game/${game.igdbId}`}
                className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/8 transition-colors"
              >
                View Game Page
              </Link>
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/15 border border-primary/25 text-primary hover:bg-primary/25 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Bento Header ─── */

function BentoHeader({ profile }: { profile: ProfileData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      <div className="md:col-span-2 bg-white/3 rounded-3xl border border-white/8 p-8 flex items-center gap-6">
        <Avatar
          name={profile.displayName}
          image={profile.avatarUrl}
          size="lg"
          showRing
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.displayName}
          </h1>
          <p className="text-white/40">@{profile.username}</p>
          {profile.bio && (
            <p className="text-white/50 mt-2 text-sm max-w-md">{profile.bio}</p>
          )}
        </div>
      </div>
      <div className="bg-white/3 rounded-3xl border border-white/8 p-8 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl font-bold text-primary">
              {profile.totalGames}
            </div>
            <div className="text-xs text-white/40 mt-1">Total Games</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400">
              {profile.finishedCount}
            </div>
            <div className="text-xs text-white/40 mt-1">Completed</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-white/80">
              {profile.favoriteGenre}
            </div>
            <div className="text-xs text-white/40 mt-1">Top Genre</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-white/80">
              {profile.joinedDate}
            </div>
            <div className="text-xs text-white/40 mt-1">Member Since</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Masonry Grid ─── */

function MasonryGrid({
  games,
  activeCategory,
  onSelect,
}: {
  games: (GameItem & { categoryId: string; categoryLabel: string })[];
  activeCategory: string;
  onSelect: (
    g: GameItem & { categoryId: string; categoryLabel: string }
  ) => void;
}) {
  // Distribute items round-robin into columns to preserve sort order
  // (CSS columns fills top-to-bottom per column, breaking sort order)
  const colCount = { base: 2, sm: 3, md: 4, lg: 5 };
  const columns: (typeof games)[] = Array.from(
    { length: colCount.lg },
    () => []
  );
  games.forEach((g, i) => columns[i % colCount.lg].push(g));

  return (
    <div className="flex gap-4">
      {columns.map((col, colIdx) => (
        <div
          key={colIdx}
          className={`flex-1 flex flex-col gap-4 min-w-0 ${
            colIdx >= colCount.base
              ? colIdx >= colCount.sm
                ? colIdx >= colCount.md
                  ? "hidden lg:flex"
                  : "hidden md:flex"
                : "hidden sm:flex"
              : ""
          }`}
        >
          {col.map((g, i) => {
            // Use the global index for consistent aspect ratio assignment
            const globalIdx = i * colCount.lg + colIdx;
            const aspect = ASPECT_RATIOS[globalIdx % ASPECT_RATIOS.length];
            const coverUrl = igdbCover(g.coverImageId);
            const cat = CATEGORIES.find((c) => c.id === g.categoryId);
            return (
              <button
                key={g.id}
                onClick={() => onSelect(g)}
                className="group relative text-left w-full"
              >
                <div
                  className={`relative ${aspect} overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/6 transition-all duration-300 group-hover:ring-white/20 group-hover:shadow-2xl group-hover:shadow-primary/8 group-hover:-translate-y-0.5`}
                >
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={g.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  ) : (
                    <div className="size-full bg-white/5" />
                  )}
                  {g.rating && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      ★ {g.rating}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-3 pt-10">
                    <p className="text-xs font-semibold leading-tight line-clamp-2">
                      {g.title}
                    </p>
                    {activeCategory === "all" && cat && (
                      <p className={`text-[10px] mt-0.5 ${cat.color}`}>
                        {cat.label}
                      </p>
                    )}
                  </div>
                </div>
              </button>
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
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [selectedGame, setSelectedGame] = useState<
    (GameItem & { categoryId: string; categoryLabel: string }) | null
  >(null);

  const filteredGames =
    activeCategory === "all"
      ? profile.categories
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
          })
      : (profile.categories
          .find((c) => c.id === activeCategory)
          ?.games.map((g) => ({
            ...g,
            categoryId: activeCategory,
            categoryLabel:
              profile.categories.find((c) => c.id === activeCategory)?.label ??
              "",
          })) ?? []);

  return (
    <>
      <BentoHeader profile={profile} />

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
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
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
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

      {filteredGames.length === 0 ? (
        <div className="text-center py-16 bg-white/3 rounded-2xl border border-white/8">
          <p className="text-white/40 text-sm">No games in this catalog yet.</p>
        </div>
      ) : (
        <MasonryGrid
          games={filteredGames}
          activeCategory={activeCategory}
          onSelect={setSelectedGame}
        />
      )}

      {selectedGame && (
        <GameModal
          game={selectedGame}
          isOwner={isOwner}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </>
  );
}
