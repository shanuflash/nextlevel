"use client";

import { useState } from "react";
import {
  setGameStatus,
  removeGameStatus,
} from "@/src/app/dashboard/games/actions";
import { CATEGORIES, CATEGORY_BADGE_COLORS } from "@/src/lib/constants";
import {
  CategoryMenu,
  anchorBelow,
  type MenuAnchor,
} from "@/src/components/category-menu";
import { removeWithUndo } from "@/src/lib/remove-with-undo";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Tick02Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";

interface GameAddButtonProps {
  igdbId: number;
  title: string;
  isLoggedIn: boolean;
  existingCategory: string | null;
}

export function GameAddButton({
  igdbId,
  title,
  isLoggedIn,
  existingCategory,
}: GameAddButtonProps) {
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const [category, setCategory] = useState<string | null>(existingCategory);
  const [pending, setPending] = useState(false);

  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/game/${igdbId}`)}`}
        className="inline-flex justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
      >
        Sign in to add
      </Link>
    );
  }

  async function handleSelect(next: string) {
    const prev = category;
    setCategory(next);
    setPending(true);
    try {
      await setGameStatus({ igdbId, category: next });
      const label = CATEGORIES.find((c) => c.id === next)?.label ?? next;
      toast.success(prev ? `Moved to ${label}` : `Added to ${label}`);
    } catch (e: unknown) {
      setCategory(prev);
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setPending(false);
    }
  }

  function handleRemove() {
    const prev = category;
    setCategory(null);
    removeWithUndo({
      title,
      remove: () => removeGameStatus(igdbId),
      onFailed: () => setCategory(prev),
      onRestored: () => setCategory(prev),
    });
  }

  const current = category ? CATEGORIES.find((c) => c.id === category) : null;
  const open = (el: HTMLElement) => setAnchor(anchorBelow(el, "start"));

  return (
    <>
      {current ? (
        <button
          onClick={(e) => open(e.currentTarget)}
          disabled={pending}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-60 ${
            CATEGORY_BADGE_COLORS[category!] ??
            "bg-white/10 text-white/60 border-white/20"
          }`}
        >
          <HugeiconsIcon icon={Tick02Icon} className="size-4" strokeWidth={2} />
          {current.label}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`size-4 transition-transform ${anchor ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </button>
      ) : (
        <button
          onClick={(e) => open(e.currentTarget)}
          disabled={pending}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={2} />
          Add to My Library
        </button>
      )}

      {anchor && (
        <CategoryMenu
          anchor={anchor}
          value={category}
          onSelect={handleSelect}
          onRemove={category ? handleRemove : undefined}
          onClose={() => setAnchor(null)}
        />
      )}
    </>
  );
}
