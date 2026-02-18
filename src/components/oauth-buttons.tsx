"use client";

import { signIn } from "@/src/lib/auth-client";
import { useState } from "react";
import { Github01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon } from "./icons";

interface OAuthButtonsProps {
  disabled?: boolean;
  onError?: (message: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function OAuthButtons({
  disabled,
  onError,
  onLoadingChange,
}: OAuthButtonsProps) {
  const [loading, setLoading] = useState({ google: false, github: false });

  async function handleSignIn(provider: "google" | "github") {
    onError?.("");
    setLoading({ google: provider === "google", github: provider === "github" });
    onLoadingChange?.(true);
    try {
      await signIn.social({ provider, callbackURL: "/dashboard" });
    } catch {
      const name = provider === "google" ? "Google" : "Github";
      onError?.(`${name} sign-in failed. Please try again.`);
      setLoading({ google: false, github: false });
      onLoadingChange?.(false);
    }
  }

  const anyLoading = loading.google || loading.github;

  return (
    <>
      <button
        type="button"
        onClick={() => handleSignIn("google")}
        disabled={disabled || anyLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        {loading.google ? "Signing in..." : "Continue with Google"}
      </button>
      <button
        type="button"
        onClick={() => handleSignIn("github")}
        disabled={disabled || anyLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HugeiconsIcon
          icon={Github01Icon}
          strokeWidth={2}
          className="size-5"
        />
        {loading.github ? "Signing in..." : "Continue with Github"}
      </button>
    </>
  );
}
