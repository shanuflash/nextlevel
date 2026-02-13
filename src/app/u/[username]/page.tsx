import type { Metadata } from "next";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { userGame, game } from "@/schema/game-schema";
import { eq, desc, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PublicNav } from "@/src/components/public-nav";
import { ProfileView } from "./profile-view";
import { getSession } from "@/src/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  const dbUser = await db.query.user.findFirst({
    where: eq(user.username, username),
  });

  if (!dbUser) return { title: "User Not Found" };

  const [gameCount] = await db
    .select({ count: count() })
    .from(userGame)
    .where(eq(userGame.userId, dbUser.id));

  const total = gameCount?.count ?? 0;
  const title = `@${dbUser.username}'s catalog`;
  const description = dbUser.bio || `${total} games tracked on NextLevel.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const dbUser = await db.query.user.findFirst({
    where: eq(user.username, username),
  });

  if (!dbUser) notFound();

  const session = await getSession();
  const isOwner = session?.user?.id === dbUser.id;

  const userGames = await db
    .select({
      id: userGame.id,
      category: userGame.category,
      rating: userGame.rating,
      igdbId: game.igdbId,
      title: game.title,
      slug: game.slug,
      coverImageId: game.coverImageId,
      genre: game.genres,
    })
    .from(userGame)
    .innerJoin(game, eq(userGame.gameId, game.id))
    .where(eq(userGame.userId, dbUser.id))
    .orderBy(desc(game.popularity));

  const categoryDefs = [
    { id: "finished", label: "Finished" },
    { id: "playing", label: "Playing" },
    { id: "want-to-play", label: "Want to Play" },
    { id: "on-hold", label: "On Hold" },
    { id: "dropped", label: "Dropped" },
  ];

  const categories = categoryDefs
    .map((cat) => ({
      ...cat,
      games: userGames.filter((g) => g.category === cat.id),
    }))
    .filter((cat) => cat.games.length > 0);

  const joined = dbUser.createdAt
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
      }).format(new Date(dbUser.createdAt))
    : "Unknown";

  const genreCounts: Record<string, number> = {};
  for (const g of userGames) {
    if (g.genre) {
      for (const genre of g.genre.split(", ")) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    }
  }
  const topGenre =
    Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const profileData = {
    displayName: dbUser.name,
    username: dbUser.username || dbUser.id,
    bio: dbUser.bio || "",
    avatarUrl: dbUser.image || null,
    totalGames: userGames.length,
    favoriteGenre: topGenre,
    joinedDate: joined,
    finishedCount: userGames.filter((g) => g.category === "finished").length,
    categories,
  };

  return (
    <div className="min-h-screen bg-[#09090d] text-white flex flex-col">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-10 w-full flex-1">
        <ProfileView profile={profileData} isOwner={isOwner} />
      </div>

      <footer className="border-t border-white/6 mt-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-white/20">
            NextLevel — Your Gaming Catalog
          </span>
          <a
            href="https://www.igdb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Powered by IGDB
          </a>
        </div>
      </footer>
    </div>
  );
}
