import { getSession } from "@/src/lib/session";
import { db } from "@/src/lib/auth";
import { userGame } from "@/schema/game-schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { CATEGORIES } from "@/src/lib/constants";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const userId = session.user.id;

  const categoryCounts = await db
    .select({
      category: userGame.category,
      count: count(),
    })
    .from(userGame)
    .where(eq(userGame.userId, userId))
    .groupBy(userGame.category);

  const totalGames = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  const categoryMap: Record<string, number> = {};
  for (const c of categoryCounts) {
    categoryMap[c.category] = c.count;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Here&apos;s an overview of your game catalog.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white/3 rounded-2xl border border-white/8 p-5">
          <div className="text-2xl font-bold text-purple-400">{totalGames}</div>
          <div className="text-xs text-white/40 mt-1">Total Games</div>
        </div>
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="bg-white/3 rounded-2xl border border-white/8 p-5"
          >
            <div className={`text-2xl font-bold ${cat.color}`}>
              {categoryMap[cat.id] || 0}
            </div>
            <div className="text-xs text-white/40 mt-1">
              {cat.emoji} {cat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/games"
          className="bg-white/3 rounded-2xl border border-white/8 p-6 hover:bg-white/5 transition-colors group"
        >
          <div className="text-lg font-semibold group-hover:text-purple-400 transition-colors">
            Manage Games
          </div>
          <p className="text-white/40 text-sm mt-1">
            Add, edit, or remove games from your catalog.
          </p>
        </Link>
        <Link
          href="/dashboard/settings"
          className="bg-white/3 rounded-2xl border border-white/8 p-6 hover:bg-white/5 transition-colors group"
        >
          <div className="text-lg font-semibold group-hover:text-purple-400 transition-colors">
            Profile Settings
          </div>
          <p className="text-white/40 text-sm mt-1">
            Edit your username, bio, and profile details.
          </p>
        </Link>
      </div>

      {totalGames === 0 && (
        <div className="text-center py-16 bg-white/3 rounded-2xl border border-white/8">
          <div className="text-4xl mb-4">🎮</div>
          <h2 className="text-lg font-semibold">No games yet</h2>
          <p className="text-white/40 text-sm mt-1 mb-6">
            Start building your catalog by adding your first game.
          </p>
          <Link
            href="/dashboard/games"
            className="inline-flex px-5 py-2.5 rounded-full text-sm font-medium bg-purple-500 text-white hover:bg-purple-500/90 transition-colors"
          >
            Add Your First Game
          </Link>
        </div>
      )}
    </div>
  );
}
