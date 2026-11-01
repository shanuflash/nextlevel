import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { userGame, game } from "@/schema/game-schema";
import { desc, count, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { Avatar } from "@/src/components/avatar";
import { GameCard } from "@/src/components/game-card";
import { PublicNav } from "@/src/components/public-nav";
import { SearchTrigger } from "@/src/components/game-search";
import { CoverImage } from "@/src/components/cover-image";
import { findGenre, findPlatform } from "@/src/lib/igdb-browse";
import {
  BrowseChips,
  ComingSoon,
  FilteredGames,
  GridSkeleton,
  NewReleases,
  RowSkeleton,
  SectionHeader,
  TopRated,
} from "./browse";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Discover new releases, upcoming games, all-time greats and gamers worth following.",
};

const COVERS_PER_TASTEMAKER = 6;

// Library stats shown under each tastemaker, in this order; the first two
// non-zero ones are used.
const STAT_LABELS = [
  ["finished", "finished"],
  ["playing", "playing"],
  ["want-to-play", "want to play"],
  ["on-hold", "on hold"],
] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const param = (v: string | string[] | undefined) =>
  typeof v === "string" ? v : undefined;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  // Unknown slugs are ignored, so a bad link just shows the default page.
  const genre = findGenre(param(params.genre));
  const platform = findPlatform(param(params.platform));
  const filtered = Boolean(genre || platform);

  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Explore</h1>
          <p className="text-white/40 text-sm mt-1">
            Find your next game by genre, platform, or the gamers you follow.
          </p>
          <div className="mt-5 max-w-xl">
            <SearchTrigger variant="bar" label="Search any game by name" />
          </div>
        </div>

        <BrowseChips genre={genre} platform={platform} />

        {filtered ? (
          // Keyed so switching chips shows the skeleton, not stale results.
          <Suspense
            key={`${genre?.slug}-${platform?.slug}`}
            fallback={<GridSkeleton />}
          >
            <FilteredGames genre={genre} platform={platform} />
          </Suspense>
        ) : (
          <>
            <Suspense fallback={<RowSkeleton />}>
              <NewReleases />
            </Suspense>
            <Suspense fallback={<RowSkeleton />}>
              <ComingSoon />
            </Suspense>
            <Suspense fallback={<RowSkeleton />}>
              <TopRated />
            </Suspense>
            <Community />
          </>
        )}
      </div>
    </div>
  );
}

/** Tastemakers and the most-tracked games, both from NextLevel's own data. */
async function Community() {
  const [topUsers, discoverGames] = await Promise.all([
    // Curators, ranked by library size.
    db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        bio: user.bio,
        gameCount: count(userGame.id),
      })
      .from(user)
      .innerJoin(userGame, eq(user.id, userGame.userId))
      .where(eq(user.isPrivate, false))
      .groupBy(user.id)
      .orderBy(desc(count(userGame.id)))
      .limit(8),
    // Most-tracked games to recommend. No count labels — keeps scale hidden.
    db
      .select({
        igdbId: game.igdbId,
        title: game.title,
        coverImageId: game.coverImageId,
        genres: game.genres,
      })
      .from(game)
      .innerJoin(userGame, eq(game.id, userGame.gameId))
      .groupBy(game.id)
      .orderBy(desc(count(userGame.id)))
      .limit(12),
  ]);

  // Top 4 curators (fetch a small buffer, then drop any without a public username).
  const tastemakers = topUsers.filter((u) => u.username).slice(0, 4);

  // Recent covers and per-category counts for each curator, one query each
  // across all of them (avoids N+1).
  const userIds = tastemakers.map((u) => u.id);
  const [libRows, statRows] = userIds.length
    ? await Promise.all([
        db
          .select({ userId: userGame.userId, coverImageId: game.coverImageId })
          .from(userGame)
          .innerJoin(game, eq(userGame.gameId, game.id))
          .where(inArray(userGame.userId, userIds))
          .orderBy(desc(userGame.updatedAt)),
        db
          .select({
            userId: userGame.userId,
            category: userGame.category,
            n: count(userGame.id),
          })
          .from(userGame)
          .where(inArray(userGame.userId, userIds))
          .groupBy(userGame.userId, userGame.category),
      ])
    : [[], []];

  // Covers: keep the first N with art, newest first.
  const coversByUser = new Map<string, string[]>();
  for (const row of libRows) {
    if (!row.coverImageId) continue;
    const list = coversByUser.get(row.userId) ?? [];
    if (list.length < COVERS_PER_TASTEMAKER) {
      list.push(row.coverImageId);
      coversByUser.set(row.userId, list);
    }
  }

  // "71 finished · 4 playing"
  const countsByUser = new Map<string, Map<string, number>>();
  for (const row of statRows) {
    const m = countsByUser.get(row.userId) ?? new Map<string, number>();
    m.set(row.category, row.n);
    countsByUser.set(row.userId, m);
  }
  function statLine(userId: string): string | null {
    const m = countsByUser.get(userId);
    if (!m) return null;
    const parts = STAT_LABELS.filter(([key]) => m.get(key))
      .slice(0, 2)
      .map(([key, label]) => `${m.get(key)} ${label}`);
    return parts.length ? parts.join(" · ") : null;
  }

  return (
    <>
      {/* Tastemakers */}
      {tastemakers.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Tastemakers" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {tastemakers.map((u) => {
              const covers = coversByUser.get(u.id) ?? [];
              const stats = statLine(u.id);
              return (
                <Link
                  key={u.username}
                  href={`/u/${u.username}`}
                  className="group overflow-hidden rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 p-4 pb-3">
                    <Avatar name={u.name} image={u.image} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold truncate">{u.name}</p>
                      <p className="text-xs text-white/40 truncate">
                        @{u.username}
                        {stats && (
                          <span className="text-white/25"> · {stats}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right flex-none">
                      <div className="text-base font-bold text-primary tabular-nums leading-none">
                        {u.gameCount}
                      </div>
                      <div className="text-[10px] text-white/30 mt-0.5">
                        games
                      </div>
                    </div>
                  </div>
                  {u.bio && (
                    <p className="px-4 pb-3 text-xs text-white/55 line-clamp-2 leading-relaxed">
                      {u.bio}
                    </p>
                  )}
                  {covers.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 px-3.5 pb-3.5 [&>*:nth-child(n+5)]:hidden sm:[&>*:nth-child(n+5)]:block">
                      {covers.map((c, i) => (
                        <div
                          key={i}
                          className="relative aspect-3/4 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/8"
                        >
                          <CoverImage
                            imageId={c}
                            size="t_cover_small"
                            placeholderSize="t_thumb"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Popular on NextLevel */}
      {discoverGames.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Popular on NextLevel" />
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {discoverGames.map((g) => (
              <GameCard
                key={g.igdbId}
                href={`/game/${g.igdbId}`}
                title={g.title}
                coverImageId={g.coverImageId}
                subtitle={g.genres?.split(", ")[0]}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
