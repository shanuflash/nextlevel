"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

/**
 * A titled, horizontally scrolling row. Touch users swipe; on larger screens
 * arrow buttons in the header page through it for mouse users.
 */
export function ScrollRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  const page = (dir: 1 | -1) =>
    ref.current?.scrollBy({
      left: dir * ref.current.clientWidth * 0.85,
      behavior: "smooth",
    });

  const arrow =
    "flex size-7 items-center justify-center rounded-full border border-white/10 bg-white/3 text-white/60 transition-colors hover:bg-white/8 hover:text-white disabled:pointer-events-none disabled:opacity-30";

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
          {title}
        </h2>
        <div className="flex-1 h-px bg-white/8" />
        <div className="hidden sm:flex gap-1.5">
          <button
            type="button"
            aria-label={`Scroll ${title} back`}
            onClick={() => page(-1)}
            disabled={atStart}
            className={arrow}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Scroll ${title} forward`}
            onClick={() => page(1)}
            disabled={atEnd}
            className={arrow}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        onScroll={update}
        className="-mx-4 px-4 sm:mx-0 sm:px-0 scroll-px-4 sm:scroll-px-0 flex gap-2 sm:gap-3 overflow-x-auto snap-x pt-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
}
