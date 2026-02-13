"use client";

import { useState } from "react";

export function ProfileUrlCopy({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <input
        readOnly
        value={url}
        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50 w-full sm:w-56 truncate focus:outline-none"
      />
      <button
        onClick={handleCopy}
        className="flex-none px-3 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
