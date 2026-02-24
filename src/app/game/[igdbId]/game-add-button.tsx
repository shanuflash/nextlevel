"use client";

import { useState } from "react";
import { addGame } from "@/src/app/dashboard/games/actions";
import { CATEGORIES, CATEGORY_BADGE_COLORS } from "@/src/lib/constants";
import { toast } from "sonner";
import Link from "next/link";

interface GameAddButtonProps {
  igdbId: number;
  isLoggedIn: boolean;
  existingCategory: string | null;
}

export function GameAddButton({
  igdbId,
  isLoggedIn,
  existingCategory,
}: GameAddButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedCategory, setAddedCategory] = useState<string | null>(null);

  const currentCategory = addedCategory ?? existingCategory;

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
      >
        Sign in to add
      </Link>
    );
  }

  if (currentCategory) {
    const cat = CATEGORIES.find((c) => c.id === currentCategory);
    return (
      <span
        className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border ${
          CATEGORY_BADGE_COLORS[currentCategory] ??
          "bg-white/10 text-white/60 border-white/20"
        }`}
      >
        {cat?.label ?? currentCategory}
      </span>
    );
  }

  async function handleAdd(category: string) {
    setIsAdding(true);
    try {
      await addGame({ igdbId, category });
      setAddedCategory(category);
      setShowPicker(false);
      toast.success("Added to your library!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add game");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="relative">
      {!showPicker ? (
        <button
          onClick={() => setShowPicker(true)}
          className="inline-flex px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          + Add to My Library
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleAdd(cat.id)}
              disabled={isAdding}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${cat.bg} ${cat.color} hover:opacity-80 disabled:opacity-50`}
            >
              {isAdding ? "..." : cat.label}
            </button>
          ))}
          <button
            onClick={() => setShowPicker(false)}
            className="px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
