"use client";

import { useState } from "react";
import {
  setGameStatus,
  removeGameStatus,
} from "@/src/app/dashboard/games/actions";
import { CATEGORIES, CATEGORY_BADGE_COLORS } from "@/src/lib/constants";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Tick02Icon,
  ArrowDown01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

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
  const [category, setCategory] = useState<string | null>(existingCategory);
  const [pending, setPending] = useState(false);

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex justify-center w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
      >
        Sign in to add
      </Link>
    );
  }

  async function handleSelect(next: string) {
    const prev = category;
    setCategory(next);
    setShowPicker(false);
    setPending(true);
    try {
      await setGameStatus({ igdbId, category: next });
      toast.success(prev ? "Status updated" : "Added to your library!");
    } catch (e: unknown) {
      setCategory(prev);
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setPending(false);
    }
  }

  async function handleRemove() {
    const prev = category;
    setCategory(null);
    setShowPicker(false);
    setPending(true);
    try {
      await removeGameStatus(igdbId);
      toast.success("Removed from your library");
    } catch (e: unknown) {
      setCategory(prev);
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setPending(false);
    }
  }

  const current = category ? CATEGORIES.find((c) => c.id === category) : null;

  return (
    <div className="relative block w-full sm:inline-block sm:w-auto">
      {current ? (
        <button
          onClick={() => setShowPicker((s) => !s)}
          disabled={pending}
          className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-60 ${
            CATEGORY_BADGE_COLORS[category!] ??
            "bg-white/10 text-white/60 border-white/20"
          }`}
        >
          <HugeiconsIcon icon={Tick02Icon} className="size-4" strokeWidth={2} />
          {current.label}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`size-4 transition-transform ${showPicker ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </button>
      ) : (
        <button
          onClick={() => setShowPicker((s) => !s)}
          disabled={pending}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={2} />
          Add to My Library
        </button>
      )}

      {showPicker && (
        <>
          {/* click-away */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-2 z-20 w-56 rounded-2xl border border-white/10 bg-[#14141a] p-1.5 shadow-2xl shadow-black/50">
            {CATEGORIES.map((cat) => {
              const isCurrent = cat.id === category;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/8 ${
                    isCurrent ? cat.color : "text-white/70"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${cat.bar}`}
                      aria-hidden
                    />
                    {cat.label}
                  </span>
                  {isCurrent && (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      className="size-4"
                      strokeWidth={2}
                    />
                  )}
                </button>
              );
            })}
            {category && (
              <>
                <div className="my-1 h-px bg-white/8" />
                <button
                  onClick={handleRemove}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                  Remove from library
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
