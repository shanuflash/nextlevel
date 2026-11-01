"use client";

/** Owner-only "pin to profile" switch shown inside the game sheet. */
export function FavoriteToggle({
  isFavorite,
  onToggle,
}: {
  isFavorite: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={isFavorite}
      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${
        isFavorite
          ? "border-primary/30 bg-primary/12 text-primary"
          : "border-white/10 bg-white/4 text-white/60 hover:text-white hover:bg-white/8"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
      </svg>
      {isFavorite ? "Pinned to your profile" : "Pin to profile favourites"}
    </button>
  );
}
