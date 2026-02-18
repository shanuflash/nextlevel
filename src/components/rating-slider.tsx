"use client";

import { useRef, useCallback } from "react";

function getColor(value: number): string {
  if (value <= 3) return "bg-red-500";
  if (value <= 5) return "bg-orange-500";
  if (value <= 7) return "bg-amber-400";
  return "bg-emerald-500";
}

function getGlowColor(value: number): string {
  if (value <= 3) return "shadow-red-500/30";
  if (value <= 5) return "shadow-orange-500/30";
  if (value <= 7) return "shadow-amber-400/30";
  return "shadow-emerald-500/30";
}

function getTextColor(value: number): string {
  if (value <= 3) return "text-red-400";
  if (value <= 5) return "text-orange-400";
  if (value <= 7) return "text-amber-400";
  return "text-emerald-400";
}

interface RatingSliderProps {
  value: number | null;
  onChange: (value: number | null) => void;
  name?: string;
}

export function RatingSlider({ value, onChange, name }: RatingSliderProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const computeValue = useCallback((clientX: number) => {
    const bar = barRef.current;
    if (!bar) return null;
    const rect = bar.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const raw = (x / rect.width) * 10;
    return Math.max(0.5, Math.round(raw * 2) / 2);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      draggingRef.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const v = computeValue(e.clientX);
      if (v !== null) onChange(v);
    },
    [computeValue, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const v = computeValue(e.clientX);
      if (v !== null) onChange(v);
    },
    [computeValue, onChange]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const segments = 20;
  const filled = value ? Math.round(value * 2) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div
          ref={barRef}
          className="flex-1 flex gap-[2px] h-7 cursor-pointer select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {Array.from({ length: segments }, (_, i) => {
            const segValue = (i + 1) / 2;
            const isFilled = i < filled;
            const isFirst = i === 0;
            const isLast = i === segments - 1;

            return (
              <div
                key={i}
                className={`flex-1 transition-all duration-75 ${
                  isFirst ? "rounded-l-lg" : ""
                } ${isLast ? "rounded-r-lg" : ""} ${
                  isFilled
                    ? `${getColor(segValue)} shadow-sm ${getGlowColor(segValue)}`
                    : "bg-white/6"
                }`}
              />
            );
          })}
        </div>

        <div className="w-12 text-right flex-none">
          {value ? (
            <span
              className={`text-sm font-bold tabular-nums ${getTextColor(value)}`}
            >
              {value % 1 === 0 ? value : value.toFixed(1)}
            </span>
          ) : (
            <span className="text-sm text-white/20">&mdash;</span>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[10px] text-white/25 hover:text-white/50 transition-colors flex-none"
          >
            Clear
          </button>
        )}
      </div>

      {name && <input type="hidden" name={name} value={value ?? ""} />}
    </div>
  );
}
