"use client";

import { useState } from "react";
import { GameCard } from "@/src/components/game-card";
import {
  CategoryMenu,
  anchorBelow,
  type MenuAnchor,
} from "@/src/components/category-menu";
import { CATEGORIES } from "@/src/lib/constants";
import { setGameStatus } from "./games/actions";
import { toast } from "sonner";

/**
 * GameCard for discovery rows (anticipated, recently released) that shows
 * whether the game is already in your library and lets you add or move it
 * without leaving the dashboard.
 */
export function LibraryGameCard({
  igdbId,
  title,
  coverImageId,
  subtitle,
  badge,
  initialCategory,
}: {
  igdbId: number;
  title: string;
  coverImageId: string | null;
  subtitle?: string;
  badge?: { text: string; className: string };
  initialCategory: string | undefined;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const cat = CATEGORIES.find((c) => c.id === category);

  async function select(next: string) {
    const prev = category;
    setCategory(next);
    try {
      await setGameStatus({ igdbId, category: next });
      const label = CATEGORIES.find((c) => c.id === next)?.label;
      toast.success(
        prev ? `Moved "${title}" to ${label}` : `Added "${title}" to ${label}`
      );
    } catch (e) {
      setCategory(prev);
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  return (
    <div className="relative">
      <GameCard
        href={`/game/${igdbId}`}
        title={title}
        coverImageId={coverImageId}
        subtitle={subtitle}
        badge={badge}
      />
      <button
        onClick={(e) => setAnchor(anchorBelow(e.currentTarget, "start"))}
        aria-haspopup="menu"
        aria-label={
          cat ? `${title}: ${cat.label}. Change status` : `Add ${title}`
        }
        className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold backdrop-blur-sm transition-colors ${
          cat
            ? "bg-black/70 text-white"
            : "bg-black/60 text-white/80 hover:bg-primary/80 hover:text-white"
        }`}
      >
        {cat ? (
          <>
            <span className={`size-2 rounded-full ${cat.bar}`} aria-hidden />
            {/* Label only where there's room next to the date badge. */}
            <span className="hidden sm:inline">{cat.label}</span>
          </>
        ) : (
          "+ Add"
        )}
      </button>
      {anchor && (
        <CategoryMenu
          anchor={anchor}
          title={title}
          value={category}
          onSelect={select}
          onClose={() => setAnchor(null)}
        />
      )}
    </div>
  );
}
