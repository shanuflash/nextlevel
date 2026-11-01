"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { CATEGORIES } from "@/src/lib/constants";

// Where the menu opens: a point (right-click) or below an element (button).
export type MenuAnchor = {
  x: number;
  y: number;
  flipAbove?: number;
  /** Element the menu hangs off; scrolling one of its containers closes it. */
  el?: HTMLElement;
};

const MENU_WIDTH = 224;
const GUTTER = 8;

/** Anchor a menu under `el`, aligned to its start/center/end edge. */
export function anchorBelow(
  el: HTMLElement,
  align: "start" | "center" | "end" = "start"
): MenuAnchor {
  const r = el.getBoundingClientRect();
  const x =
    align === "end"
      ? r.right - MENU_WIDTH
      : align === "center"
        ? r.left + r.width / 2 - MENU_WIDTH / 2
        : r.left;
  // If there's no room below, open above the element instead.
  return { x, y: r.bottom + 6, flipAbove: r.top - 6, el };
}

/**
 * The one category picker used everywhere a game gets a status: the game
 * page, card quick menus, dashboard quick-add and the add-games dialog.
 * Rendered in a portal so card overflow and grid stacking never clip it.
 */
export function CategoryMenu({
  anchor,
  value,
  title,
  onSelect,
  onRemove,
  removeLabel = "Remove from library",
  onClose,
}: {
  anchor: MenuAnchor;
  value?: string | null;
  title?: string;
  onSelect: (category: string) => void;
  onRemove?: () => void;
  removeLabel?: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = el.offsetHeight;
    const left = Math.min(
      Math.max(anchor.x, GUTTER),
      window.innerWidth - MENU_WIDTH - GUTTER
    );
    let top = anchor.y;
    if (top + h > window.innerHeight - GUTTER) {
      top =
        anchor.flipAbove !== undefined
          ? anchor.flipAbove - h
          : window.innerHeight - GUTTER - h;
    }
    // Measured before paint, so it never flashes at the unclamped spot.
    el.style.left = `${left}px`;
    el.style.top = `${Math.max(top, GUTTER)}px`;
    el.style.visibility = "visible";
  }, [anchor]);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const anchorEl = anchor.el;
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const close = () => onCloseRef.current();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    // Fixed positioning would drift from its anchor, so close when the page
    // or a container holding the anchor scrolls (not unrelated carousels).
    const onScroll = (e: Event) => {
      const t = e.target;
      if (
        t === document ||
        (anchorEl && t instanceof Node && t.contains(anchorEl))
      ) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [anchorEl]);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-60"
        aria-hidden="true"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        ref={ref}
        role="menu"
        style={{
          left: anchor.x,
          top: anchor.y,
          width: MENU_WIDTH,
          visibility: "hidden",
        }}
        className="fixed z-61 rounded-2xl border border-white/10 bg-[#14141a] p-1.5 shadow-2xl shadow-black/50"
      >
        {title && (
          <p className="truncate px-3 pt-1.5 pb-1 text-[11px] font-medium text-white/35">
            {title}
          </p>
        )}
        {CATEGORIES.map((cat) => {
          const isCurrent = cat.id === value;
          return (
            <button
              key={cat.id}
              role="menuitemradio"
              aria-checked={isCurrent}
              onClick={() => {
                onClose();
                if (!isCurrent) onSelect(cat.id);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/8 focus-visible:bg-white/8 focus-visible:outline-none ${
                isCurrent ? cat.color : "text-white/70"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${cat.bar}`}
                  aria-hidden
                />
                {cat.label}
              </span>
              {isCurrent && (
                <HugeiconsIcon
                  icon={Tick02Icon}
                  className="size-4"
                  strokeWidth={2}
                />
              )}
            </button>
          );
        })}
        {onRemove && (
          <>
            <div className="my-1 h-px bg-white/8" />
            <button
              role="menuitem"
              onClick={() => {
                onClose();
                onRemove();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 focus-visible:bg-red-500/10 focus-visible:outline-none"
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                className="size-4"
                strokeWidth={2}
              />
              {removeLabel}
            </button>
          </>
        )}
      </div>
    </>,
    document.body
  );
}
