import Image from "next/image";
import { igdbImage, type IGDBImageSize } from "@/src/lib/igdb";

/**
 * IGDB image with a progressive placeholder: a tiny (~3KB) blurred version of
 * the same image sits underneath and shows until the real one has painted
 * over it. No JavaScript involved, so covers appear as soon as they download
 * rather than waiting for hydration.
 * Fills its parent, which must be `relative` and sized (e.g. aspect-3/4).
 */
export function CoverImage({
  imageId,
  size = "t_cover_big",
  placeholderSize = "t_cover_small",
  alt = "",
  priority = false,
  className = "object-cover",
}: {
  imageId: string | null | undefined;
  size?: IGDBImageSize;
  placeholderSize?: IGDBImageSize;
  alt?: string;
  priority?: boolean;
  className?: string;
}) {
  const src = igdbImage(imageId, size);
  const placeholder = igdbImage(imageId, placeholderSize);

  if (!src) return <div className="absolute inset-0 bg-white/5" />;

  return (
    <>
      {placeholder && (
        <Image
          src={placeholder}
          alt=""
          aria-hidden
          fill
          priority={priority}
          className={`${className} scale-110 blur-lg`}
          sizes="10vw"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes="(max-width: 640px) 33vw, 20vw"
      />
    </>
  );
}
