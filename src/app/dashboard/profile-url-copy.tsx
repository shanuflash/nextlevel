"use client";

import { useState } from "react";

export function ProfileUrlCopy({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      const url = `${window.location.origin}/u/${username}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      onClick={copy}
      className="inline-flex size-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/50 transition-all hover:border-white/15 hover:text-white/70 sm:h-auto sm:w-auto sm:px-3.5 sm:py-2"
    >
      {copied ? (
        <>
          <svg
            className="size-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="hidden sm:inline">Copied!</span>
          <span className="sr-only sm:hidden">Profile link copied</span>
        </>
      ) : (
        <>
          <svg
            className="size-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span className="hidden sm:inline">/u/{username}</span>
          <span className="sr-only sm:hidden">Copy public profile link</span>
        </>
      )}
    </button>
  );
}
