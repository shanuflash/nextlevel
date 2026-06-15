"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { igdbImage } from "@/src/lib/igdb";

export function MediaGallery({ imageIds }: { imageIds: string[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? i : (i - 1 + imageIds.length) % imageIds.length)),
    [imageIds.length]
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? i : (i + 1) % imageIds.length)),
    [imageIds.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, prev, next]);

  if (imageIds.length === 0) return null;

  const VISIBLE = 6;
  const visible = imageIds.slice(0, VISIBLE);
  const remaining = imageIds.length - VISIBLE;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visible.map((id, i) => {
          const isLast = i === VISIBLE - 1 && remaining > 0;
          return (
            <button
              key={id}
              onClick={() => setActive(i)}
              className="group relative aspect-video overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/8 transition-all hover:ring-white/25"
            >
              <Image
                src={igdbImage(id, "t_screenshot_big")!}
                alt={`Screenshot ${i + 1}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              {isLast && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-[1px] transition-colors group-hover:bg-black/55">
                  <span className="text-lg font-semibold text-white">
                    +{remaining} more
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
            </button>

            {imageIds.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-2 sm:left-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Previous"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-2 sm:right-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Next"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
                </button>
              </>
            )}

            <motion.div
              key={active}
              className="relative w-full max-w-5xl aspect-video"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={igdbImage(imageIds[active], "t_screenshot_huge")!}
                alt={`Screenshot ${active + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50">
              {active + 1} / {imageIds.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
