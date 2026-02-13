import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { userGame, game } from "@/schema/game-schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PublicNav } from "@/src/components/public-nav";
import { ProfileView } from "./profile-view";
import { getSession } from "@/src/lib/session";

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
    .where(eq(userGame.userId, dbUser.id));

  const categoryDefs = [
    { id: "finished", label: "Finished", emoji: "✅" },
    { id: "playing", label: "Playing", emoji: "🎮" },
    { id: "want-to-play", label: "Want to Play", emoji: "📋" },
    { id: "on-hold", label: "On Hold", emoji: "⏸️" },
    { id: "dropped", label: "Dropped", emoji: "🚫" },
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
    avatarUrl:
      dbUser.image ||
      `https://api.dicebear.com/9.x/adventurer/svg?seed=${dbUser.username || dbUser.id}`,
    totalGames: userGames.length,
    favoriteGenre: topGenre,
    joinedDate: joined,
    finishedCount: userGames.filter((g) => g.category === "finished").length,
    categories,
  };

  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <ProfileView profile={profileData} isOwner={isOwner} />
      </div>
    </div>
  );
}
