"use client";

import { authClient, signUp, signIn, useSession } from "@/src/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

const USERNAME_RE = /^[a-z0-9_.]+$/;
const MIN_LEN = 3;
const MAX_LEN = 30;

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function validateUsername(v: string): string | null {
  if (v.length < MIN_LEN) return `At least ${MIN_LEN} characters`;
  if (v.length > MAX_LEN) return `Max ${MAX_LEN} characters`;
  if (!USERNAME_RE.test(v)) return "Only lowercase letters, numbers, underscores, dots";
  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameHint, setUsernameHint] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const anyLoading = isLoading || isGoogleLoading;

  useEffect(() => {
    if (session && !sessionLoading) {
      router.replace("/dashboard");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const checkUsername = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const trimmed = value.toLowerCase().trim();

    if (!trimmed) {
      setUsernameStatus("idle");
      setUsernameHint("");
      return;
    }

    const validationError = validateUsername(trimmed);
    if (validationError) {
      setUsernameStatus("invalid");
      setUsernameHint(validationError);
      return;
    }

    setUsernameStatus("checking");
    setUsernameHint("");

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const { data } = await authClient.isUsernameAvailable({
          username: trimmed,
          fetchOptions: { signal: controller.signal },
        });

        if (controller.signal.aborted) return;

        if (data?.available) {
          setUsernameStatus("available");
          setUsernameHint("Username is available");
        } else {
          setUsernameStatus("taken");
          setUsernameHint("Username is already taken");
        }
      } catch {
        if (!controller.signal.aborted) {
          setUsernameStatus("idle");
          setUsernameHint("");
        }
      }
    }, 400);
  }, []);

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setUsername(value);
    checkUsername(value);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (usernameStatus === "taken") {
      setError("That username is already taken");
      return;
    }

    setIsLoading(true);

    const { error } = await signUp.email({
      name,
      username,
      email,
      password,
    });

    if (error) {
      setError(error.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  }

  const canSubmit = !anyLoading && usernameStatus !== "taken" && usernameStatus !== "checking" && usernameStatus !== "invalid";

  if (sessionLoading) return null;
  if (session) return null;

  return (
    <div className="min-h-screen bg-[#09090d] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            Next<span className="text-primary">Level</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Track your games. Showcase your taste.
          </p>
        </div>

        <div className="bg-white/3 rounded-3xl border border-white/8 p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Create your account</h2>
            <p className="text-white/40 text-sm mt-1">
              Start building your game catalog
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm text-white/60">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={anyLoading}
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-white/60">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="johndoe"
                  required
                  minLength={MIN_LEN}
                  maxLength={MAX_LEN}
                  disabled={anyLoading}
                  autoComplete="username"
                  className={`w-full px-4 py-3 pr-10 rounded-xl bg-white/5 border text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                    usernameStatus === "available"
                      ? "border-emerald-500/40 focus:ring-emerald-500/30 focus:border-emerald-500/40"
                      : usernameStatus === "taken" || usernameStatus === "invalid"
                        ? "border-red-500/40 focus:ring-red-500/30 focus:border-red-500/40"
                        : "border-white/10 focus:ring-primary/50 focus:border-primary/50"
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === "checking" && (
                    <svg className="size-4 text-white/30 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {usernameStatus === "available" && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 text-emerald-400">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  )}
                  {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 text-red-400">
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              {usernameHint ? (
                <p className={`text-xs ${
                  usernameStatus === "available" ? "text-emerald-400/70" :
                  usernameStatus === "taken" || usernameStatus === "invalid" ? "text-red-400/70" :
                  "text-white/25"
                }`}>
                  {usernameHint}
                </p>
              ) : (
                <p className="text-xs text-white/25">
                  Lowercase letters, numbers, underscores, dots
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-white/60">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                disabled={anyLoading}
                autoComplete="email"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  disabled={anyLoading}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z" clipRule="evenodd" />
                      <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 4.09 5.12L6.38 7.41a4 4 0 0 0 4.368 6.52Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full px-4 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0f0f13] px-3 text-white/30">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={anyLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
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
