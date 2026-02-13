import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/auth";
import { game } from "@/schema/game-schema";
import { eq } from "drizzle-orm";
import { getIGDBToken } from "@/src/lib/igdb";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Hobby max

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get all games from DB
    const allGames = await db
      .select({ id: game.id, igdbId: game.igdbId })
      .from(game);

    if (allGames.length === 0) {
      return NextResponse.json({ message: "No games to update", updated: 0 });
    }

    // 2. Batch-fetch popularity scores from IGDB
    const token = await getIGDBToken();
    const headers = {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    };

    const igdbIds = allGames.map((g) => g.igdbId);
    const scores = new Map<number, number>();

    // Chunk into batches of 500 (IGDB limit)
    const chunks: number[][] = [];
    for (let i = 0; i < igdbIds.length; i += 500) {
      chunks.push(igdbIds.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const ids = chunk.join(",");
      const res = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers,
        body: `fields total_rating_count, hypes;\nwhere id = (${ids});\nlimit 500;`,
      });

      if (!res.ok) {
        console.error(
          `[cron] IGDB chunk failed: ${res.status}`,
          await res.text(),
        );
        continue;
      }

      const raw: {
        id: number;
        total_rating_count?: number;
        hypes?: number;
      }[] = await res.json();

      for (const g of raw) {
        // Weight hypes 10x since they're rarer and represent active anticipation
        scores.set(
          g.id,
          (g.total_rating_count ?? 0) + (g.hypes ?? 0) * 10,
        );
      }
    }

    // 3. Update each game's popularity in the DB
    let updated = 0;
    for (const g of allGames) {
      const score = scores.get(g.igdbId);
      if (score !== undefined) {
        await db
          .update(game)
          .set({ popularity: score })
          .where(eq(game.id, g.id));
        updated++;
      }
    }

    console.log(
      `[cron] Updated popularity for ${updated}/${allGames.length} games`,
    );

    return NextResponse.json({
      message: `Updated ${updated} of ${allGames.length} games`,
      updated,
      total: allGames.length,
    });
  } catch (e) {
    console.error("[cron] update-popularity failed:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
