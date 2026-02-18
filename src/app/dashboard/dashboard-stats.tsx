"use client";

import { useState } from "react";
import { CATEGORIES } from "@/src/lib/constants";
import { QuickAddGrid } from "./quick-add-grid";

interface PopularGame {
  igdbId: number;
  title: string;
  coverImageId: string | null;
  genres: string | null;
}

interface DashboardStatsProps {
  totalGames: number;
  categoryMap: Record<string, number>;
  popularGames: PopularGame[];
}

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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="relative bg-white/3 rounded-2xl border border-white/8 p-5 overflow-hidden">
        <div className="text-2xl font-bold text-primary">{totalGames}</div>
        <div className="text-xs text-white/40 mt-1">Total Games</div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary to-primary/80" />
      </div>
      {CATEGORIES.map((cat) => {
        const bars: Record<string, string> = {
          finished: "from-emerald-500 to-emerald-400",
          playing: "from-blue-500 to-blue-400",
          "want-to-play": "from-amber-500 to-amber-400",
          "on-hold": "from-orange-500 to-orange-400",
          dropped: "from-red-500 to-red-400",
        };
        return (
          <div
            key={cat.id}
            className="relative bg-white/3 rounded-2xl border border-white/8 p-5 overflow-hidden"
          >
            <div className={`text-2xl font-bold ${cat.color}`}>
              {categoryMap[cat.id] || 0}
            </div>
            <div className="text-xs text-white/40 mt-1">{cat.label}</div>
            <div
              className={`absolute inset-x-0 bottom-0 h-1 bg-linear-to-r ${bars[cat.id]}`}
            />
          </div>
        );
      })}
    </div>
  );
}
