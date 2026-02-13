"use client";

import { useState } from "react";
import Link from "next/link";
import { igdbCover } from "@/src/lib/igdb";
import { CATEGORY_TAB_COLORS, CATEGORY_BADGE_COLORS } from "@/src/lib/constants";

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
  emoji: string;
  games: GameItem[];
}

interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
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

function BentoHeader({ profile }: { profile: ProfileData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      <div className="md:col-span-2 bg-white/3 rounded-3xl border border-white/8 p-8 flex items-center gap-6">
        <img
          src={profile.avatarUrl}
          alt={profile.displayName}
          className="size-24 rounded-2xl bg-white/10 ring-2 ring-white/10"
        />
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
            <div className="text-3xl font-bold text-purple-400">
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

export function ProfileView({ profile }: { profile: ProfileData }) {
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const filteredGames =
    activeCategory === "all"
      ? profile.categories.flatMap((cat) =>
          cat.games.map((g) => ({
            ...g,
            categoryId: cat.id,
            categoryLabel: cat.label,
            categoryEmoji: cat.emoji,
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
            categoryEmoji:
              profile.categories.find((c) => c.id === activeCategory)?.emoji ??
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
              {cat.emoji} {cat.label}
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
              <Link
                key={g.id}
                href={`/game/${g.igdbId}`}
                className="break-inside-avoid group cursor-pointer block"
              >
                <div
                  className={`relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/6 transition-all duration-300 group-hover:ring-white/20 group-hover:shadow-2xl group-hover:shadow-purple-500/8 ${ASPECT_RATIOS[i % ASPECT_RATIOS.length]}`}
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={g.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                      {g.categoryEmoji} {g.categoryLabel}
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
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
