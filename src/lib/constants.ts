export interface CategoryDef {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  bar: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "finished",
    label: "Finished",
    emoji: "✅",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/25",
    bar: "bg-emerald-500",
  },
  {
    id: "playing",
    label: "Playing",
    emoji: "🎮",
    color: "text-blue-400",
    bg: "bg-blue-500/15 border-blue-500/25",
    bar: "bg-blue-500",
  },
  {
    id: "want-to-play",
    label: "Want to Play",
    emoji: "📋",
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/25",
    bar: "bg-amber-500",
  },
  {
    id: "on-hold",
    label: "On Hold",
    emoji: "⏸️",
    color: "text-orange-400",
    bg: "bg-orange-500/15 border-orange-500/25",
    bar: "bg-orange-500",
  },
  {
    id: "dropped",
    label: "Dropped",
    emoji: "🚫",
    color: "text-red-400",
    bg: "bg-red-500/15 border-red-500/25",
    bar: "bg-red-500",
  },
];

export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  finished: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  playing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "want-to-play": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "on-hold": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  dropped: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const CATEGORY_TAB_COLORS: Record<string, string> = {
  finished: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  playing: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "want-to-play": "bg-amber-500/15 text-amber-400 border-amber-500/25",
  "on-hold": "bg-orange-500/15 text-orange-400 border-orange-500/25",
  dropped: "bg-red-500/15 text-red-400 border-red-500/25",
};

export type GameCategory =
  | "finished"
  | "playing"
  | "want-to-play"
  | "on-hold"
  | "dropped";
