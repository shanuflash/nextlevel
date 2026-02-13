"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { igdbCover } from "@/src/lib/igdb";
import {
  CATEGORIES,
  CATEGORY_TAB_COLORS,
  CATEGORY_BADGE_COLORS,

} from "@/src/lib/constants";
import { updateGame, removeGame } from "@/src/app/dashboard/games/actions";
import { toast } from "sonner";

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
        <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={game.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
            />
          ) : (
            <div className="size-full flex items-center justify-center text-5xl text-white/10">
              🎮
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
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
                <input
                  name="rating"
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  defaultValue={game.rating ?? ""}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/20"
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
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            width={96}
            height={96}
            className="size-24 rounded-2xl bg-white/10 ring-2 ring-white/10"
          />
        ) : (
          <div className="size-24 rounded-2xl bg-primary/20 ring-2 ring-white/10 flex items-center justify-center text-3xl font-bold text-primary">
            {profile.displayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.displayName}
          </h1>
          <p className="text-white/40">@{profile.username}</p>
          {profile.bio && (
            <p className="text-white/50 mt-2 text-sm max-w-md">
              {profile.bio}
            </p>
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
      ? profile.categories.flatMap((cat) =>
          cat.games.map((g) => ({
            ...g,
            categoryId: cat.id,
            categoryLabel: cat.label,
          })),
        )
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
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                isActive
                  ? CATEGORY_TAB_COLORS[cat.id] ??
                    "bg-white/15 text-white border-white/20"
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
          <div className="text-3xl mb-3">🎮</div>
          <p className="text-white/40 text-sm">No games in this catalog yet.</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredGames.map((g, i) => {
            const coverUrl = igdbCover(g.coverImageId);
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGame(g)}
                className="break-inside-avoid group cursor-pointer block w-full text-left"
              >
                <div
                  className={`relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/6 transition-all duration-300 group-hover:ring-white/20 group-hover:shadow-2xl group-hover:shadow-primary/8 ${ASPECT_RATIOS[i % ASPECT_RATIOS.length]}`}
                >
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={g.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-3xl text-white/10 bg-white/5">
                      🎮
                    </div>
                  )}
                  {activeCategory === "all" && (
                    <div
                      className={`absolute top-2.5 left-2.5 text-[10px] font-medium px-2 py-0.5 rounded-lg border backdrop-blur-sm ${
                        CATEGORY_BADGE_COLORS[g.categoryId] ??
                        "bg-white/10 text-white/60 border-white/20"
                      }`}
                    >
                      {g.categoryLabel}
                    </div>
                  )}
                  {g.rating && (
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      ★ {g.rating}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-4 pt-12">
                    <p className="text-sm font-semibold leading-tight">
                      {g.title}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
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
