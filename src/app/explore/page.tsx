import type { Metadata } from "next";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { userGame, game } from "@/schema/game-schema";
import { desc, count, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { Avatar } from "@/src/components/avatar";
import { GameCard } from "@/src/components/game-card";

import { PublicNav } from "@/src/components/public-nav";

export const metadata: Metadata = {
  title: "Explore",
  description: "Popular games and user catalogs on NextLevel.",
};

export default async function ExplorePage() {
  const [usersWithGames, popularGames] = await Promise.all([
    db
      .select({
        name: user.name,
        username: user.username,
        image: user.image,
        bio: user.bio,
        gameCount: count(userGame.id),
      })
      .from(user)
      .leftJoin(userGame, eq(user.id, userGame.userId))
      .groupBy(user.id)
      .having(sql`count(${userGame.id}) > 0`)
      .orderBy(desc(count(userGame.id)))
      .limit(20),
    db
      .select({
        gameId: game.id,
        igdbId: game.igdbId,
        title: game.title,
        coverImageId: game.coverImageId,
        userCount: count(userGame.id),
      })
      .from(game)
      .innerJoin(userGame, eq(game.id, userGame.gameId))
      .groupBy(game.id)
      .orderBy(desc(count(userGame.id)))
      .limit(12),
  ]);

  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-10 space-y-12">
        <div>
          <h1 className="text-3xl font-bold">Explore</h1>
          <p className="text-white/40 text-sm mt-1">
            Popular games and user catalogs.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-4">Popular Games</h2>
          {popularGames.length === 0 ? (
            <div className="bg-white/3 rounded-2xl border border-white/8 p-12 text-center">
              <p className="text-white/30 text-sm">
                No games tracked yet. Be the first!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {popularGames.map((g) => (
                <GameCard
                  key={g.gameId}
                  href={`/game/${g.igdbId}`}
                  title={g.title}
                  coverImageId={g.coverImageId}
                  subtitle={`${g.userCount} user${g.userCount !== 1 ? "s" : ""}`}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          {usersWithGames.length === 0 ? (
            <div className="bg-white/3 rounded-2xl border border-white/8 p-12 text-center">
              <p className="text-white/30 text-sm">
                No users with game catalogs yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {usersWithGames
                .filter((u) => u.username)
                .map((u) => (
                  <Link
                    key={u.username}
                    href={`/u/${u.username}`}
                    className="bg-white/3 rounded-2xl border border-white/8 p-5 flex items-center gap-4 hover:bg-white/5 transition-colors"
                  >
                    <Avatar name={u.name} image={u.image} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{u.name}</p>
                      {u.username && (
                        <p className="text-xs text-white/30">@{u.username}</p>
                      )}
                      {u.bio && (
                        <p className="text-xs text-white/40 mt-0.5 line-clamp-1">
                          {u.bio}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-none">
                      <div className="text-sm font-bold text-primary">
                        {u.gameCount}
                      </div>
                      <div className="text-[10px] text-white/30">games</div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
