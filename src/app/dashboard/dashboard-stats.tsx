"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/src/lib/constants";
import { QuickAddGrid } from "./quick-add-grid";
import type { PopularGame } from "@/src/lib/types";

interface DashboardStatsProps {
  totalGames: number;
  categoryMap: Record<string, number>;
  popularGames: PopularGame[];
}

const DOT_CLASS: Record<string, string> = {
  finished: "bg-emerald-400",
  playing: "bg-blue-400",
  "want-to-play": "bg-amber-400",
  "on-hold": "bg-orange-400",
  dropped: "bg-red-400",
};

export function DashboardStats({
  totalGames,
  categoryMap,
  popularGames,
}: DashboardStatsProps) {
  const [startedEmpty] = useState(() => totalGames === 0);

  if (startedEmpty) {
    return <QuickAddGrid games={popularGames} />;
  }

  return (
    // One strip at every size; on phones it scrolls sideways instead of
    // stacking into a 2x3 wall that pushes everything else off screen.
    <div className="flex overflow-x-auto rounded-2xl border border-white/8 bg-white/3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href="/dashboard/games"
        className="flex-none border-r border-white/8 px-4 py-3.5 transition-colors hover:bg-white/6 sm:flex-1 sm:px-5 sm:py-4"
      >
        <div className="text-2xl font-bold tabular-nums leading-none text-primary">
          {totalGames}
        </div>
        <div className="mt-2 text-[11px] uppercase tracking-wider text-white/40 whitespace-nowrap">
          Total Games
        </div>
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.id}
          href={`/dashboard/games?status=${cat.id}`}
          className="flex-none border-r border-white/8 px-4 py-3.5 last:border-r-0 transition-colors hover:bg-white/6 sm:flex-1 sm:px-5 sm:py-4"
        >
          <div
            className={`text-2xl font-bold tabular-nums leading-none ${cat.color}`}
          >
            {categoryMap[cat.id] || 0}
          </div>
          <div className="mt-2 text-[11px] text-white/40 flex items-center gap-1.5 whitespace-nowrap">
            <span className={`size-2 rounded-full ${DOT_CLASS[cat.id]}`} />
            {cat.label}
          </div>
        </Link>
      ))}
    </div>
  );
}
