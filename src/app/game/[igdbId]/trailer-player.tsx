"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { youtubeThumb, type IGDBVideo } from "@/src/lib/igdb";

export function TrailerPlayer({ videos }: { videos: IGDBVideo[] }) {
  const [active, setActive] = useState<IGDBVideo | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  if (videos.length === 0) return null;

  const VISIBLE = 3;
  const visible = showAll ? videos : videos.slice(0, VISIBLE);
  const remaining = videos.length - VISIBLE;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visible.map((video, i) => {
          const isOverflow = !showAll && i === VISIBLE - 1 && remaining > 0;
          return (
            <button
              key={video.videoId}
              onClick={() => (isOverflow ? setShowAll(true) : setActive(video))}
              className="group relative aspect-video overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/8 transition-all hover:ring-white/25"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtubeThumb(video.videoId)}
                alt={video.name ?? "Trailer"}
                className="size-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              {isOverflow ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-[1px] transition-colors group-hover:bg-black/55">
                  <span className="text-lg font-semibold text-white">
                    +{remaining} more
                  </span>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg transition-transform group-hover:scale-110">
                      <HugeiconsIcon
                        icon={PlayIcon}
                        className="size-5 translate-x-0.5"
                      />
                    </div>
                  </div>
                  {video.name && (
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent p-2.5 pt-8">
                      <p className="text-[11px] font-medium text-white/90 line-clamp-1 text-left">
                        {video.name}
                      </p>
                    </div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
            </button>
            <motion.div
              className="relative w-full max-w-5xl aspect-video"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                className="size-full rounded-xl"
                src={`https://www.youtube-nocookie.com/embed/${active.videoId}?autoplay=1&rel=0`}
                title={active.name ?? "Trailer"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
