"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { addGame, updateGame, removeGame } from "./actions";
import { igdbCover, type IGDBGameMeta } from "@/src/lib/igdb";
import { CATEGORIES } from "@/src/lib/constants";

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

function AddGameDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IGDBGameMeta[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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
    if (q.length < 2) {
      setResults([]);
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
    }
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelected(null);
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
      onClose();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to add game");
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
              <div className="relative">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search for a game..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 placeholder:text-white/25"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                    Searching...
                  </div>
                )}
              </div>

              {results.length > 0 && (
                <div className="space-y-1">
                  {results.map((r) => (
                    <button
                      key={r.igdbId}
                      onClick={() => setSelected(r)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/5 flex-none">
                        {r.coverImageId ? (
                          <img
                            src={
                              igdbCover(r.coverImageId, "t_cover_small") ?? ""
                            }
                            alt={r.title}
                            className="size-full object-cover"
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
                    </button>
                  ))}
                </div>
              )}

              {query.length >= 2 && !isSearching && results.length === 0 && (
                <p className="text-center text-white/25 text-sm py-6">
                  No games found for &quot;{query}&quot;
                </p>
              )}

              {query.length < 2 && (
                <p className="text-center text-white/20 text-sm py-8">
                  Start typing to search IGDB...
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-start gap-4 bg-white/3 rounded-xl p-4 border border-white/8">
                <div className="w-16 h-22 rounded-lg overflow-hidden bg-white/5 flex-none">
                  {selected.coverImageId ? (
                    <img
                      src={
                        igdbCover(selected.coverImageId, "t_cover_big") ?? ""
                      }
                      alt={selected.title}
                      className="size-full object-cover"
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
                      {c.emoji} {c.label}
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
              className="px-5 py-2 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-500/90 transition-colors disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add to Catalog"}
            </button>
          </div>
        )}
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
  const coverUrl = igdbCover(game.coverImageId);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await updateGame(formData);
      onClose();
    } catch {
      alert("Failed to update game");
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemove() {
    if (!confirm(`Remove "${game.title}" from your catalog?`)) return;
    const fd = new FormData();
    fd.set("userGameId", game.id);
    await removeGame(fd);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5">
        <div className="flex items-center gap-3">
          {coverUrl && (
            <img
              src={coverUrl}
              alt={game.title}
              className="w-12 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{game.title}</h2>
            <p className="text-xs text-white/40">{game.genre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 text-lg"
          >
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="userGameId" value={game.id} />

          <div>
            <label className="text-xs text-white/40 block mb-1.5">
              Category
            </label>
            <select
              name="category"
              defaultValue={game.category}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
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

          <div className="flex justify-between pt-2">
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
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-500/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function GamesClient({ games }: { games: UserGameRow[] }) {
  const [isShowingAdd, setIsShowingAdd] = useState(false);
  const [editingGame, setEditingGame] = useState<UserGameRow | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

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
        <button
          onClick={() => setIsShowingAdd(true)}
          className="px-5 py-2.5 rounded-full text-sm font-medium bg-purple-500 text-white hover:bg-purple-500/90 transition-colors"
        >
          + Add Game
        </button>
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
              {cat.emoji} {cat.label} ({catCount})
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
              <div key={g.id} className="group relative">
                <Link
                  href={`/game/${g.igdbId}`}
                  className="block"
                >
                  <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/20 group-hover:-translate-y-0.5">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={g.title}
                        className="size-full object-cover"
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
                          {cat.emoji} {cat.label}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => setEditingGame(g)}
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-lg transition-opacity"
                >
                  ✏️ Edit
                </button>
              </div>
            );
          })}
        </div>
      )}

      {isShowingAdd && (
        <AddGameDialog onClose={() => setIsShowingAdd(false)} />
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
