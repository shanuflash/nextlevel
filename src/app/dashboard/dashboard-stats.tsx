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
    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-0 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-white/8 sm:bg-white/3">
      <Link
        href="/dashboard/games"
        className="min-w-0 rounded-xl border border-white/8 bg-white/3 px-4 py-3.5 transition-colors hover:bg-white/6 sm:flex-1 sm:rounded-none sm:border-0 sm:border-r sm:bg-transparent sm:px-5 sm:py-4"
      >
        <div className="text-2xl font-bold tabular-nums leading-none text-primary">
          {totalGames}
        </div>
        <div className="mt-2 text-[11px] uppercase tracking-wider text-white/40">
          Total Games
        </div>
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.id}
          href={`/dashboard/games?status=${cat.id}`}
          className="min-w-0 rounded-xl border border-white/8 bg-white/3 px-4 py-3.5 transition-colors hover:bg-white/6 sm:flex-1 sm:rounded-none sm:border-0 sm:border-r sm:last:border-r-0 sm:bg-transparent sm:px-5 sm:py-4"
        >
          <div
            className={`text-2xl font-bold tabular-nums leading-none ${cat.color}`}
          >
            {categoryMap[cat.id] || 0}
          </div>
          <div className="mt-2 text-[11px] text-white/40 flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${DOT_CLASS[cat.id]}`} />
            {cat.label}
          </div>
        </Link>
      ))}
    </div>
  );
}
