"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { igdbCover } from "@/src/lib/igdb";
import { useGameSearch, describeResult } from "@/src/lib/use-game-search";

const OPEN_EVENT = "nextlevel:open-search";

/** Open the search palette from anywhere. */
export function openGameSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/**
 * Buttons that open the palette. "nav" is the compact top-bar pill, "icon" the
 * mobile top-bar circle, "bar" a full-width search field look-alike.
 */
export function SearchTrigger({
  variant,
  label = "Search games",
}: {
  variant: "nav" | "icon" | "bar";
  label?: string;
}) {
  if (variant === "icon") {
    return (
      <button
        onClick={openGameSearch}
        aria-label={label}
        className="flex items-center justify-center size-11 rounded-full bg-white/5 ring-1 ring-white/10 text-white/60 hover:text-white"
      >
        <SearchIcon className="size-5" />
      </button>
    );
  }
  if (variant === "nav") {
    return (
      <button
        onClick={openGameSearch}
        className="flex items-center gap-2 h-9 pl-3 pr-2 rounded-full bg-white/5 ring-1 ring-white/10 text-xs text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors"
      >
        <SearchIcon className="size-3.5" />
        <span>{label}</span>
        <kbd className="ml-2 rounded-md bg-white/8 px-1.5 py-0.5 font-sans text-[10px] text-white/40">
          ⌘K
        </kbd>
      </button>
    );
  }
  return (
    <button
      onClick={openGameSearch}
      className="flex w-full items-center gap-3 h-12 px-4 rounded-2xl bg-white/4 border border-white/10 text-sm text-white/35 hover:border-white/20 hover:text-white/55 transition-colors text-left"
    >
      <SearchIcon className="size-4.5 flex-none" />
      <span className="flex-1 truncate">{label}</span>
      <kbd className="hidden sm:inline rounded-md bg-white/8 px-1.5 py-0.5 font-sans text-[10px] text-white/40">
        ⌘K
      </kbd>
    </button>
  );
}

/**
 * The search palette, mounted once in the root layout. Opens on ⌘K / Ctrl+K,
 * on "/" outside text fields, or via openGameSearch(). Results go to the game
 * page, which is where adding happens.
 */
export function SearchPaletteHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !typing)
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return open ? <SearchPalette onClose={() => setOpen(false)} /> : null;
}

function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { query, setQuery, results, isSearching, searchedFor } =
    useGameSearch(250);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(igdbId: number) {
    onClose();
    router.push(`/game/${igdbId}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].igdbId);
    }
  }

  return (
    <div
      className="fixed inset-0 z-70 flex items-start justify-center bg-black/60 backdrop-blur-sm px-3 pt-[10dvh] sm:pt-[14dvh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search games"
        onKeyDown={onKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-surface-elevated text-white shadow-2xl shadow-black/60"
      >
        <div className="flex items-center gap-3 border-b border-white/8 px-4">
          <SearchIcon className="size-4.5 flex-none text-white/35" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search 200,000+ games"
            aria-label="Search games"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="game-search-results"
            aria-activedescendant={
              results[active]
                ? `game-search-${results[active].igdbId}`
                : undefined
            }
            className="h-14 flex-1 bg-transparent text-base focus:outline-none placeholder:text-white/25"
          />
          {isSearching ? (
            <span
              className="size-4 flex-none rounded-full border-2 border-white/15 border-t-white/60 animate-spin"
              aria-label="Searching"
            />
          ) : (
            <kbd className="hidden sm:inline rounded-md bg-white/8 px-1.5 py-0.5 font-sans text-[10px] text-white/40">
              Esc
            </kbd>
          )}
        </div>

        <div className="max-h-[min(60dvh,28rem)] overflow-y-auto p-2">
          {results.length > 0 ? (
            <ul
              id="game-search-results"
              role="listbox"
              ref={listRef}
              className={`space-y-0.5 transition-opacity ${isSearching ? "opacity-50" : ""}`}
            >
              {results.map((r, i) => (
                <li
                  key={r.igdbId}
                  id={`game-search-${r.igdbId}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(r.igdbId)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl p-2 ${
                    i === active ? "bg-white/8" : ""
                  }`}
                >
                  <div className="relative h-14 w-10 flex-none overflow-hidden rounded-lg bg-white/5">
                    {r.coverImageId && (
                      <Image
                        src={igdbCover(r.coverImageId, "t_cover_small") ?? ""}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="truncate text-[11px] text-white/35">
                      {describeResult(r)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-white/25">
              {isSearching
                ? "Searching…"
                : searchedFor
                  ? `No games found for "${searchedFor}"`
                  : "Type a game name. Enter opens it."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
