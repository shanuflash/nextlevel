import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { userGame, game } from "@/schema/game-schema";
import { and, desc, eq } from "drizzle-orm";
import { igdbCover } from "@/src/lib/igdb";

// Read-only endpoint: what a user is currently playing.
// Consumed server-side by shanu.dev's "now" strip; edge-cacheable.
export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("u");
  if (!username) {
    return NextResponse.json({ error: "Missing ?u=username" }, { status: 400 });
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.username, username),
  });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const playing = await db
    .select({
      title: game.title,
      slug: game.slug,
      coverImageId: game.coverImageId,
    })
    .from(userGame)
    .innerJoin(game, eq(userGame.gameId, game.id))
    .where(
      and(eq(userGame.userId, dbUser.id), eq(userGame.category, "playing")),
    )
    .orderBy(desc(userGame.updatedAt))
    .limit(3);

  return NextResponse.json(
    {
      username: dbUser.username,
      playing: playing.map((g) => ({
        title: g.title,
        slug: g.slug,
        cover: igdbCover(g.coverImageId, "t_cover_small"),
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
