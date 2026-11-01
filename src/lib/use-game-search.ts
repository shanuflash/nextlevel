"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IGDBSearchResult } from "@/src/lib/igdb";

function isSearchable(q: string) {
  return /^\d+$/.test(q) || q.length >= 2;
}

/**
 * Debounced IGDB search shared by the add-games dialog and the search
 * palette. `isSearching` is true from the first keystroke (not just while the
 * request is in flight) so callers can show a loading state immediately.
 */
export function useGameSearch(delay = 300) {
  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<IGDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedFor, setSearchedFor] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const abortRef = useRef<AbortController>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    },
    []
  );

  const run = useCallback(async (q: string) => {
    abortRef.current?.abort();
    if (!isSearchable(q)) {
      setIsSearching(false);
      setResults([]);
      setSearchedFor(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`/api/igdb?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setResults([]);
    }
    setSearchedFor(q);
    setIsSearching(false);
  }, []);

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value);
      const trimmed = value.trim();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (isSearchable(trimmed)) setIsSearching(true);
      debounceRef.current = setTimeout(() => run(trimmed), delay);
    },
    [delay, run]
  );

  return { query, setQuery, results, isSearching, searchedFor };
}

/** "2023 · Remake of Resident Evil 4 · PS5, PC +2" */
export function describeResult(r: IGDBSearchResult): string {
  const kind = r.kind
    ? r.parentTitle
      ? `${r.kind} of ${r.parentTitle}`
      : r.kind
    : null;
  const platforms =
    r.platforms.length > 3
      ? `${r.platforms.slice(0, 3).join(", ")} +${r.platforms.length - 3}`
      : r.platforms.join(", ");
  return [r.releaseDate?.slice(0, 4), kind, platforms]
    .filter(Boolean)
    .join(" · ");
}
