"use client";

import {
  Children,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

/*
 * Reveal-on-scroll that never hides content the server rendered.
 *
 * The server HTML carries a plain CSS entrance animation (`.reveal` /
 * `.reveal-item` in globals.css), so above-the-fold content fades in on first
 * paint with no JavaScript at all. Once hydrated, elements that are still
 * below the viewport are switched to a hidden state and revealed by an
 * IntersectionObserver when scrolled into view. Without JS, without
 * IntersectionObserver, or with reduced motion, everything simply stays
 * visible.
 */

type RevealState = "hidden" | "shown" | undefined;

function useReveal(ref: RefObject<HTMLElement | null>): RevealState {
  const [state, setState] = useState<RevealState>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState((s) => (s === "hidden" ? "shown" : s));
          observer.disconnect();
        } else if (
          first &&
          entry.boundingClientRect.top >= window.innerHeight
        ) {
          // Only hide what the visitor can't see yet; anything in or above
          // the viewport keeps its first-paint entrance.
          setState("hidden");
        }
        first = false;
      },
      { rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return state;
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 24,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useReveal(ref);

  const style: Record<string, string> = {};
  if (delay) style["--reveal-delay"] = `${delay}s`;
  if (y !== 24) style["--reveal-y"] = `${y}px`;

  return (
    <div
      ref={ref}
      className={className ? `reveal ${className}` : "reveal"}
      data-reveal={state}
      style={style as CSSProperties}
    >
      {children}
    </div>
  );
}

const StaggerIndex = createContext(0);

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useReveal(ref);

  return (
    <div
      ref={ref}
      className={className ? `reveal-group ${className}` : "reveal-group"}
      data-reveal={state}
      style={{ "--reveal-stagger": `${stagger}s` } as CSSProperties}
    >
      {Children.map(children, (child, i) => (
        <StaggerIndex.Provider value={i}>{child}</StaggerIndex.Provider>
      ))}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const index = useContext(StaggerIndex);

  return (
    <div
      className={className ? `reveal-item ${className}` : "reveal-item"}
      style={index ? ({ "--reveal-i": index } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
