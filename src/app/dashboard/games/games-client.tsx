"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { addGame, updateGame, removeGame, bulkAddGames } from "./actions";
import { igdbCover, type IGDBGameMeta } from "@/src/lib/igdb";
import { CATEGORIES } from "@/src/lib/constants";
import { toast } from "sonner";

export interface UserGameRow {
  id: string;
  category: string;
  rating: number | null;
  gameId: string;
  igdbId: number;
  title: string;
  slug: string;
  coverImageId: string | null;
  genre: string | null;
}

function AddGameDialog({
  onClose,
  existingIgdbIds,
}: {
  onClose: () => void;
  existingIgdbIds: Set<number>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IGDBGameMeta[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState<IGDBGameMeta | null>(null);
  const [category, setCategory] = useState("finished");
  const [rating, setRating] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchIGDB = useCallback(async (q: string) => {
    const isId = /^\d+$/.test(q.trim());
    if (!isId && q.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/igdb?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
    } catch {
      /* noop */
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelected(null);
    setHasSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchIGDB(value), 350);
  }

  async function handleAdd() {
    if (!selected) return;
    setIsAdding(true);
    try {
      await addGame({
        igdbId: selected.igdbId,
        category,
        rating: rating ? parseFloat(rating) : undefined,
      });
      toast.success(`Added "${selected.title}" to your catalog`);
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add game");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-semibold">Add Game</h2>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!selected ? (
            <>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search by name or IGDB ID..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/25"
              />

              <div className="min-h-[200px]">
                {isSearching && (
                  <div className="flex items-center justify-center py-10">
                    <div className="text-sm text-white/25">Searching...</div>
                  </div>
                )}

                {!isSearching && results.length > 0 && (
                  <div className="space-y-1">
                    {results.map((r) => {
                      const alreadyAdded = existingIgdbIds.has(r.igdbId);
                      return (
                        <button
                          key={r.igdbId}
                          onClick={() => !alreadyAdded && setSelected(r)}
                          disabled={alreadyAdded}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left ${
                            alreadyAdded
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/5 flex-none relative">
                            {r.coverImageId ? (
                              <Image
                                src={igdbCover(r.coverImageId, "t_cover_small") ?? ""}
                                alt={r.title}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-white/10 text-xs">
                                🎮
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {r.title}
                            </p>
                            <p className="text-[11px] text-white/30 truncate">
                              {[
                                r.releaseDate?.slice(0, 4),
                                ...r.genres.slice(0, 2),
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                          {alreadyAdded && (
                            <span className="text-[11px] text-emerald-400/70 flex-none">
                              In Library
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!isSearching && hasSearched && results.length === 0 && (
                  <p className="text-center text-white/25 text-sm py-10">
                    No games found for &quot;{query}&quot;
                  </p>
                )}

                {!isSearching && !hasSearched && (
                  <p className="text-center text-white/20 text-sm py-10">
                    Search by game name or paste an IGDB ID...
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-4 bg-white/3 rounded-xl p-4 border border-white/8">
                <div className="w-16 h-22 rounded-lg overflow-hidden bg-white/5 flex-none relative">
                  {selected.coverImageId ? (
                    <Image
                      src={igdbCover(selected.coverImageId, "t_cover_big") ?? ""}
                      alt={selected.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-2xl text-white/10">
                      🎮
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{selected.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {[
                      selected.releaseDate?.slice(0, 4),
                      ...selected.genres.slice(0, 3),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {selected.platforms.length > 0 && (
                    <p className="text-[11px] text-white/25 mt-1">
                      {selected.platforms.join(", ")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-white/30 hover:text-white/60 flex-none"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="text-xs text-white/40 block mb-1.5">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                        category === c.id
                          ? c.bg + " " + c.color
                          : "border-white/8 text-white/40 hover:text-white/60"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 block mb-1.5">
                  Rating (1-10)
                </label>
                <input
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  placeholder="Optional"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/20"
                />
              </div>
            </>
          )}
        </div>

        {selected && (
          <div className="p-6 pt-0 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add to Catalog"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface QueuedGame {
  igdbId: number;
  title: string;
  coverImageId: string | null;
  genres: string[];
  releaseDate: string | null;
  category: string;
  rating: string;
}

function BulkAddDialog({
  onClose,
  existingIgdbIds,
}: {
  onClose: () => void;
  existingIgdbIds: Set<number>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IGDBGameMeta[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [queue, setQueue] = useState<QueuedGame[]>([]);
  const [defaultCategory, setDefaultCategory] = useState("finished");
  const [isAdding, setIsAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchIGDB = useCallback(async (q: string) => {
    const isId = /^\d+$/.test(q.trim());
    if (!isId && q.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/igdb?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
    } catch {
      /* noop */
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    setHasSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchIGDB(value), 350);
  }

  function addToQueue(game: IGDBGameMeta) {
    if (queue.some((q) => q.igdbId === game.igdbId)) return;
    setQueue((prev) => [
      ...prev,
      {
        igdbId: game.igdbId,
        title: game.title,
        coverImageId: game.coverImageId,
        genres: game.genres,
        releaseDate: game.releaseDate,
        category: defaultCategory,
        rating: "",
      },
    ]);
  }

  function removeFromQueue(igdbId: number) {
    setQueue((prev) => prev.filter((q) => q.igdbId !== igdbId));
  }

  async function handleBulkAdd() {
    if (queue.length === 0) return;
    setIsAdding(true);
    try {
      const items = queue.map((q) => ({
        igdbId: q.igdbId,
        category: q.category,
        rating: q.rating ? parseFloat(q.rating) : undefined,
      }));
      const results = await bulkAddGames(items);
      const added = results.filter((r) => r.ok).length;
      const skipped = results.filter((r) => !r.ok).length;
      if (added > 0)
        toast.success(
          `Added ${added} game${added !== 1 ? "s" : ""} to your catalog`
        );
      if (skipped > 0)
        toast.warning(
          `${skipped} game${skipped !== 1 ? "s" : ""} skipped (already in catalog)`
        );
      onClose();
    } catch {
      toast.error("Failed to add games");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="text-lg font-semibold">Bulk Add Games</h2>
            <p className="text-xs text-white/30 mt-0.5">
              Search and queue multiple games, then add them all at once.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Queue chips (top) */}
          {queue.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-white/30 mr-0.5">
                {queue.length} queued:
              </span>
              {queue.map((q) => {
                const cat = CATEGORIES.find((c) => c.id === q.category);
                return (
                  <span
                    key={q.igdbId}
                    className={`inline-flex items-center gap-1 border rounded-full pl-2 pr-1 py-0.5 text-[11px] ${
                      cat
                        ? cat.bg + " " + cat.color
                        : "bg-white/5 border-white/10 text-white/60"
                    }`}
                  >
                    <span className="truncate max-w-[120px]">{q.title}</span>
                    <button
                      onClick={() => removeFromQueue(q.igdbId)}
                      className="size-4 rounded-full hover:bg-white/10 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
              <button
                onClick={() => setQueue([])}
                className="text-[10px] text-white/20 hover:text-white/50 transition-colors ml-1"
              >
                Clear
              </button>
            </div>
          )}

          {/* Default category selector */}
          <div>
            <label className="text-xs text-white/40 block mb-1.5">
              Default category for new games
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setDefaultCategory(c.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    defaultCategory === c.id
                      ? c.bg + " " + c.color
                      : "border-white/8 text-white/40 hover:text-white/60"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by name or IGDB ID..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/25"
          />

          {/* Search results */}
          <div className="min-h-[120px]">
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-white/25">Searching...</div>
              </div>
            )}

            {!isSearching && results.length > 0 && (
              <div className="space-y-1">
                {results.map((r) => {
                  const inQueue = queue.some((q) => q.igdbId === r.igdbId);
                  const alreadyAdded = existingIgdbIds.has(r.igdbId);
                  const isDisabled = inQueue || alreadyAdded;
                  return (
                    <button
                      key={r.igdbId}
                      onClick={() => !isDisabled && addToQueue(r)}
                      disabled={isDisabled}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left ${
                        isDisabled
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/5 flex-none relative">
                        {r.coverImageId ? (
                          <Image
                            src={igdbCover(r.coverImageId, "t_cover_small") ?? ""}
                            alt={r.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-white/10 text-xs">
                            🎮
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-white/30 truncate">
                          {[r.releaseDate?.slice(0, 4), ...r.genres.slice(0, 2)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <div className="flex-none text-xs">
                        {alreadyAdded ? (
                          <span className="text-emerald-400/70">
                            In Library
                          </span>
                        ) : inQueue ? (
                          <span className="text-primary">Queued</span>
                        ) : (
                          <span className="text-white/20">+ Add</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!isSearching && hasSearched && results.length === 0 && (
              <p className="text-center text-white/25 text-sm py-8">
                No games found for &quot;{query}&quot;
              </p>
            )}

            {!isSearching && !hasSearched && (
              <p className="text-center text-white/20 text-sm py-8">
                Search by game name or paste an IGDB ID...
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBulkAdd}
            disabled={isAdding || queue.length === 0}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isAdding
              ? "Adding..."
              : `Add ${queue.length} Game${queue.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditGameDialog({
  game,
  onClose,
}: {
  game: UserGameRow;
  onClose: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategory, setEditCategory] = useState(game.category);
  const coverUrl = igdbCover(game.coverImageId, "t_cover_big");
  const cat = CATEGORIES.find((c) => c.id === game.category);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await updateGame(formData);
      toast.success(`Updated "${game.title}"`);
      onClose();
    } catch {
      toast.error("Failed to update game");
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemove() {
    const fd = new FormData();
    fd.set("userGameId", game.id);
    try {
      await removeGame(fd);
      toast.success(`Removed "${game.title}" from your catalog`);
      onClose();
    } catch {
      toast.error("Failed to remove game");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Cover image header */}
        <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={game.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
            />
          ) : (
            <div className="size-full flex items-center justify-center text-5xl text-white/10">
              🎮
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 size-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 -mt-8 relative space-y-4">
          {/* Title & meta */}
          <div>
            <h2 className="text-xl font-bold leading-tight">{game.title}</h2>
            {game.genre && (
              <p className="text-xs text-white/40 mt-1">{game.genre}</p>
            )}
          </div>

          {/* Current status */}
          {!isEditing && (
            <div className="flex items-center gap-3">
              {cat && (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${cat.bg} ${cat.color}`}
                >
                  {cat.label}
                </span>
              )}
              {game.rating && (
                <span className="text-xs font-bold text-amber-400">
                  ★ {game.rating}/10
                </span>
              )}
            </div>
          )}

          {/* Edit form */}
          {isEditing && (
            <form action={handleSubmit} className="space-y-4">
              <input type="hidden" name="userGameId" value={game.id} />
              <input type="hidden" name="category" value={editCategory} />

              <div>
                <label className="text-xs text-white/40 block mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditCategory(c.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                        editCategory === c.id
                          ? c.bg + " " + c.color
                          : "border-white/8 text-white/40 hover:text-white/60"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 block mb-1.5">
                  Rating (1-10)
                </label>
                <input
                  name="rating"
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  defaultValue={game.rating ?? ""}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="flex justify-between pt-1">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Remove
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Action buttons */}
          {!isEditing && (
            <div className="flex gap-2 pt-1">
              <Link
                href={`/game/${game.igdbId}`}
                className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/8 transition-colors"
              >
                View Game Page
              </Link>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/15 border border-primary/25 text-primary hover:bg-primary/25 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GamesClient({ games }: { games: UserGameRow[] }) {
  const [isShowingAdd, setIsShowingAdd] = useState(false);
  const [isShowingBulkAdd, setIsShowingBulkAdd] = useState(false);
  const [editingGame, setEditingGame] = useState<UserGameRow | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const existingIgdbIds = new Set(games.map((g) => g.igdbId));

  const filtered =
    activeCategory === "all"
      ? games
      : games.filter((g) => g.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Games</h1>
          <p className="text-white/40 text-sm mt-1">
            {games.length} game{games.length !== 1 ? "s" : ""} in your catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShowingBulkAdd(true)}
            className="px-4 py-2.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Bulk Add
          </button>
          <button
            onClick={() => setIsShowingAdd(true)}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            + Add Game
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            activeCategory === "all"
              ? "bg-white/12 text-white border-white/20"
              : "text-white/40 border-white/8 hover:text-white/60"
          }`}
        >
          All ({games.length})
        </button>
        {CATEGORIES.map((cat) => {
          const catCount = games.filter((g) => g.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeCategory === cat.id
                  ? cat.bg + " " + cat.color
                  : "text-white/40 border-white/8 hover:text-white/60"
              }`}
            >
              {cat.label} ({catCount})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/3 rounded-2xl border border-white/8">
          <div className="text-3xl mb-3">🎮</div>
          <p className="text-white/40 text-sm">
            {activeCategory === "all"
              ? "No games yet. Add your first game above!"
              : "No games in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((g) => {
            const cat = CATEGORIES.find((c) => c.id === g.category);
            const coverUrl = igdbCover(g.coverImageId);
            return (
              <button
                key={g.id}
                onClick={() => setEditingGame(g)}
                className="group relative text-left"
              >
                <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/20 group-hover:-translate-y-0.5">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={g.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-3xl text-white/10">
                      🎮
                    </div>
                  )}
                  {g.rating && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      ★ {g.rating}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-3 pt-10">
                    <p className="text-xs font-semibold leading-tight line-clamp-2">
                      {g.title}
                    </p>
                    {cat && (
                      <p className={`text-[10px] mt-0.5 ${cat.color}`}>
                        {cat.label}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isShowingAdd && (
        <AddGameDialog
          onClose={() => setIsShowingAdd(false)}
          existingIgdbIds={existingIgdbIds}
        />
      )}
      {isShowingBulkAdd && (
        <BulkAddDialog
          onClose={() => setIsShowingBulkAdd(false)}
          existingIgdbIds={existingIgdbIds}
        />
      )}
      {editingGame && (
        <EditGameDialog
          game={editingGame}
          onClose={() => setEditingGame(null)}
        />
      )}
    </div>
  );
}
