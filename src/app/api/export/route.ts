import { NextResponse } from "next/server";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { userGame, game } from "@/schema/game-schema";
import { asc, eq } from "drizzle-orm";
import { getSession } from "@/src/lib/session";

// Downloads the signed-in user's profile + catalog as a JSON file.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const [profile, catalog] = await Promise.all([
    db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        name: true,
        username: true,
        bio: true,
        email: true,
        createdAt: true,
      },
    }),
    db
      .select({
        title: game.title,
        igdbId: game.igdbId,
        category: userGame.category,
        startedAt: userGame.startedAt,
        finishedAt: userGame.finishedAt,
        createdAt: userGame.createdAt,
        notes: userGame.notes,
      })
      .from(userGame)
      .innerJoin(game, eq(userGame.gameId, game.id))
      .where(eq(userGame.userId, userId))
      .orderBy(asc(userGame.createdAt)),
  ]);

  if (!profile) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const body = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      profile,
      catalog,
    },
    null,
    2
  );

  // Usernames are already [a-z0-9_.], but keep the header safe regardless.
  const slug = (profile.username || "export").replace(/[^a-z0-9_.-]/gi, "");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="nextlevel-${slug}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
