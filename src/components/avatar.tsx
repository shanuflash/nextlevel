import Image from "next/image";

const AVATAR_COLORS = [
  { bg: "bg-rose-500/20", text: "text-rose-400" },
  { bg: "bg-amber-500/20", text: "text-amber-400" },
  { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  { bg: "bg-blue-500/20", text: "text-blue-400" },
  { bg: "bg-violet-500/20", text: "text-violet-400" },
  { bg: "bg-fuchsia-500/20", text: "text-fuchsia-400" },
  { bg: "bg-pink-500/20", text: "text-pink-400" },
  { bg: "bg-orange-500/20", text: "text-orange-400" },
  { bg: "bg-teal-500/20", text: "text-teal-400" },
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getColor(name: string) {
  return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];
}

const SIZE_MAP = {
  xs: {
    wrapper: "size-7",
    rounded: "rounded-full",
    text: "text-xs font-medium",
    ring: "ring-1 ring-white/10",
    imgSize: 28,
  },
  sm: {
    wrapper: "size-8",
    rounded: "rounded-lg",
    text: "text-xs font-bold",
    ring: "ring-1 ring-white/10",
    imgSize: 32,
  },
  md: {
    wrapper: "size-12",
    rounded: "rounded-xl",
    text: "text-lg font-bold",
    ring: "ring-1 ring-white/10",
    imgSize: 48,
  },
  lg: {
    wrapper: "size-24",
    rounded: "rounded-2xl",
    text: "text-3xl font-bold",
    ring: "ring-2 ring-white/10",
    imgSize: 96,
  },
} as const;

type AvatarSize = keyof typeof SIZE_MAP;

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: AvatarSize;
  showRing?: boolean;
}

export function Avatar({
  name,
  image,
  size = "md",
  showRing = false,
}: AvatarProps) {
  const s = SIZE_MAP[size];
  const color = getColor(name);
  const letter = name[0]?.toUpperCase() ?? "?";

  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={s.imgSize}
        height={s.imgSize}
        className={`${s.wrapper} ${s.rounded} ${s.ring}`}
      />
    );
  }

  return (
    <div
      className={`${s.wrapper} ${s.rounded} ${color.bg} flex items-center justify-center ${s.text} ${color.text} ${showRing ? s.ring : ""}`}
    >
      {letter}
    </div>
  );
}
