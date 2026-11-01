"use client";

import { signIn } from "@/src/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeIcon } from "@/src/components/icons";
import { OAuthButtons } from "@/src/components/oauth-buttons";
import { authHref, safeNextPath } from "@/src/lib/safe-next";

export function LoginForm({ nextParam }: { nextParam: string | null }) {
  const router = useRouter();
  const next = safeNextPath(nextParam);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const anyLoading = isLoading || isOAuthLoading;

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Usernames can't contain "@", so its presence means an email.
    const value = identifier.trim();
    const { error } = value.includes("@")
      ? await signIn.email({ email: value, password })
      : await signIn.username({ username: value, password });

    if (error) {
      setError(error.message || "Invalid email, username or password");
      setIsLoading(false);
    } else {
      router.push(next);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090d] text-white flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">
            Next<span className="text-primary">Level</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Track your games. Showcase your taste.
          </p>
        </div>

        <div className="bg-white/3 rounded-2xl sm:rounded-3xl border border-white/8 p-5 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold">Welcome back</h2>
            <p className="text-white/40 text-sm mt-1">
              Sign in to manage your game catalog
            </p>
          </div>

          <OAuthButtons
            disabled={isLoading}
            callbackURL={next}
            onError={setError}
            onLoadingChange={setIsOAuthLoading}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-divider px-3 text-white/30">
                or use your email or username
              </span>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm text-white/60">
                Email or username
              </label>
              <input
                id="identifier"
                name="username"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or username"
                required
                disabled={anyLoading}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-white/60">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={8}
                  disabled={anyLoading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-white/30 hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={anyLoading}
              className="w-full px-4 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-white/25">
            Forgot your password? If you&apos;ve linked Google or GitHub, sign
            in with it and set a new one in{" "}
            <span className="text-white/40">Settings</span>.
          </p>

          <p className="text-center text-sm text-white/40">
            Don&apos;t have an account?{" "}
            <Link
              href={authHref("/signup", nextParam)}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
