"use client";

import Image from "next/image";
import { igdbImage, type IGDBImageSize } from "@/src/lib/igdb";

// Cached images can finish loading before hydration, when onLoad has no
// listener yet, so the ref also checks `complete`. A data attribute (not
// state) drives the fade so a missed event can never leave it hidden.
function markLoaded(img: HTMLImageElement | null) {
  if (img?.complete && img.naturalWidth > 0) img.dataset.loaded = "";
}

/**
 * IGDB image with a progressive placeholder: a tiny (~3KB) version of the
 * same image shows blurred straight away, and the real one fades in over it.
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
        ref={markLoaded}
        src={src}
        alt={alt}
        fill
        priority={priority}
        onLoad={(e) => {
          e.currentTarget.dataset.loaded = "";
        }}
        className={`${className} opacity-0 transition-opacity duration-300 data-loaded:opacity-100`}
        sizes="(max-width: 640px) 33vw, 20vw"
      />
    </>
  );
}
