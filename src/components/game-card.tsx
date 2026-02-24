import Image from "next/image";
import Link from "next/link";
import { igdbCover } from "@/src/lib/igdb";

interface GameCardProps {
  href: string;
  title: string;
  coverImageId: string | null;
  subtitle?: string;
  badge?: { text: string; className: string };
  sizes?: string;
  coverSize?: "t_cover_big" | "t_cover_big_2x";
}

export function GameCard({
  href,
  title,
  coverImageId,
  subtitle,
  badge,
  sizes = "(max-width: 640px) 33vw, 20vw",
  coverSize = "t_cover_big_2x",
}: GameCardProps) {
  const coverUrl = igdbCover(coverImageId, coverSize);

  return (
    <Link href={href} className="group relative">
      <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/25 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/40">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover"
            sizes={sizes}
          />
        ) : (
          <div className="size-full bg-white/5" />
        )}
        {badge && (
          <div
            className={`absolute top-2 right-2 backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${badge.className}`}
          >
            {badge.text}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3 pt-12">
          <p className="text-xs font-semibold leading-tight line-clamp-2">
            {title}
          </p>
          {subtitle && (
            <p className="text-[10px] mt-0.5 text-white/40">{subtitle}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
