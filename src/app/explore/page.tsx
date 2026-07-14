import type { Metadata } from "next";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { userGame, game } from "@/schema/game-schema";
import { desc, count, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/src/components/avatar";
import { GameCard } from "@/src/components/game-card";
import { igdbCover } from "@/src/lib/igdb";
import { PublicNav } from "@/src/components/public-nav";

export const metadata: Metadata = {
  title: "Explore",
  description: "Discover new games through gamers worth following.",
};

const COVERS_PER_TASTEMAKER = 6;

export default async function ExplorePage() {
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

  // One grouped query for each curator's cover art + genres (avoids N+1).
  const userIds = tastemakers.map((u) => u.id);
  const libRows = userIds.length
    ? await db
        .select({
          userId: userGame.userId,
          coverImageId: game.coverImageId,
          genres: game.genres,
          updatedAt: userGame.updatedAt,
        })
        .from(userGame)
        .innerJoin(game, eq(userGame.gameId, game.id))
        .where(inArray(userGame.userId, userIds))
        .orderBy(desc(userGame.updatedAt))
    : [];

  const coversByUser = new Map<string, string[]>();
  const genreTallyByUser = new Map<string, Map<string, number>>();
  for (const row of libRows) {
    // Covers: keep the first N with art, newest first.
    if (row.coverImageId) {
      const list = coversByUser.get(row.userId) ?? [];
      if (list.length < COVERS_PER_TASTEMAKER) {
        list.push(row.coverImageId);
        coversByUser.set(row.userId, list);
      }
    }
    // Genre tally → tagline.
    if (row.genres) {
      const tally = genreTallyByUser.get(row.userId) ?? new Map();
      for (const g of row.genres.split(", ")) {
        tally.set(g, (tally.get(g) ?? 0) + 1);
      }
      genreTallyByUser.set(row.userId, tally);
    }
  }

  function topGenre(userId: string): string | null {
    const tally = genreTallyByUser.get(userId);
    if (!tally) return null;
    let best: string | null = null;
    let bestN = 0;
    for (const [g, n] of tally) {
      if (n > bestN) {
        bestN = n;
        best = g;
      }
    }
    return best;
  }

  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Explore</h1>
          <p className="text-white/40 text-sm mt-1">
            Find your next game through gamers worth following.
          </p>
        </div>

        {/* Tastemakers */}
        {tastemakers.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                Tastemakers
              </h2>
              <div className="flex-1 h-px bg-white/8" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {tastemakers.map((u) => {
                const covers = coversByUser.get(u.id) ?? [];
                const genre = topGenre(u.id);
                return (
                  <Link
                    key={u.username}
                    href={`/u/${u.username}`}
                    className="group overflow-hidden rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 p-4 pb-3">
                      <Avatar name={u.name} image={u.image} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-white/40 truncate">
                          @{u.username}
                          {genre && (
                            <span className="text-white/25"> · {genre}</span>
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
                      <div className="grid grid-cols-6 gap-1.5 px-3.5 pb-3.5">
                        {covers.map((c, i) => {
                          const url = igdbCover(c, "t_cover_big");
                          return (
                            <div
                              key={i}
                              className="relative aspect-3/4 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/8"
                            >
                              {url ? (
                                <Image
                                  src={url}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="70px"
                                />
                              ) : (
                                <div className="size-full bg-white/5" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Worth adding */}
        {discoverGames.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                Worth Adding
              </h2>
              <div className="flex-1 h-px bg-white/8" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {discoverGames.map((g) => (
                <GameCard
                  key={g.igdbId}
                  href={`/game/${g.igdbId}`}
                  title={g.title}
                  coverImageId={g.coverImageId}
                  subtitle={g.genres?.split(", ")[0]}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
              ))}
            </div>
          </section>
        )}

        {tastemakers.length === 0 && discoverGames.length === 0 && (
          <div className="mt-8 bg-white/3 rounded-2xl border border-white/8 p-12 text-center">
            <p className="text-white/30 text-sm">
              Nothing tracked yet. Be the first to build a catalog!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
