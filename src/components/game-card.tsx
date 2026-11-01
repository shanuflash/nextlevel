import Link from "next/link";
import { CoverImage } from "@/src/components/cover-image";

interface GameCardProps {
  href: string;
  title: string;
  coverImageId: string | null;
  subtitle?: string;
  /** Colors the subtitle and keeps it visible on mobile (used for status). */
  subtitleClassName?: string;
  badge?: { text: string; className: string };
  coverSize?: "t_cover_big" | "t_cover_big_2x";
}

export function GameCard({
  href,
  title,
  coverImageId,
  subtitle,
  subtitleClassName,
  badge,
  coverSize = "t_cover_big",
}: GameCardProps) {
  return (
    <Link href={href} className="group relative">
      <div className="relative aspect-3/4 overflow-hidden rounded-xl sm:rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/25 sm:group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/40">
        <CoverImage imageId={coverImageId} size={coverSize} alt={title} />
        {badge && (
          <div
            className={`absolute top-2 right-2 backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${badge.className}`}
          >
            {badge.text}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/55 to-transparent p-2 sm:p-3 pt-9 sm:pt-12">
          <p className="text-[10px] sm:text-xs font-semibold leading-tight line-clamp-2">
            {title}
          </p>
          {subtitle && (
            <p
              className={`text-[10px] mt-0.5 ${
                subtitleClassName ?? "hidden text-white/40 sm:block"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
