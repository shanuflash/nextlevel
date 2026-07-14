"use client";

import { useState } from "react";
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
    <div className="flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-white/8 bg-white/3">
      <div className="flex-1 px-5 py-4 border-b sm:border-b-0 sm:border-r border-white/8">
        <div className="text-2xl font-bold tabular-nums leading-none text-primary">
          {totalGames}
        </div>
        <div className="mt-2 text-[11px] uppercase tracking-wider text-white/40">
          Total Games
        </div>
      </div>
      {CATEGORIES.map((cat) => (
        <div
          key={cat.id}
          className="flex-1 px-5 py-4 border-b last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 border-white/8"
        >
          <div className={`text-2xl font-bold tabular-nums leading-none ${cat.color}`}>
            {categoryMap[cat.id] || 0}
          </div>
          <div className="mt-2 text-[11px] text-white/40 flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${DOT_CLASS[cat.id]}`} />
            {cat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
