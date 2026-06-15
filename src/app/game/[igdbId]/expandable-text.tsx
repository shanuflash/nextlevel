"use client";

import { useState } from "react";

export function ExpandableText({
  text,
  clampLines = 5,
}: {
  text: string;
  clampLines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  // Heuristic: only offer toggle for longer passages
  const isLong = text.length > 360;

  return (
    <div>
      <p
        className="text-white/60 text-sm leading-relaxed whitespace-pre-line"
        style={
          !expanded && isLong
            ? {
                display: "-webkit-box",
                WebkitLineClamp: clampLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
