"use client";

import { authClient, signUp, useSession } from "@/src/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { EyeIcon } from "@/src/components/icons";
import { OAuthButtons } from "@/src/components/oauth-buttons";

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
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
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

  const anyLoading = isLoading || isOAuthLoading;

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
                  <EyeIcon open={showPassword} />
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

          <OAuthButtons
            disabled={isLoading}
            onError={setError}
            onLoadingChange={setIsOAuthLoading}
          />

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
