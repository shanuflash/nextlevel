"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/src/lib/auth-client";
import { Avatar } from "@/src/components/avatar";
import { SearchTrigger } from "@/src/components/game-search";
import { useEffect, useState } from "react";

interface AuthNavUser {
  name: string;
  image?: string;
  username?: string;
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/dashboard/games", label: "Games", icon: "games" },
  { href: "/explore", label: "Explore", icon: "explore" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

function isNavItemActive(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

function MobileNavIcon({ icon }: { icon: string }) {
  if (icon === "home") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-9Z"
        />
        <path strokeLinecap="round" d="M9 21v-6h6v6" />
      </svg>
    );
  }
  if (icon === "games") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8h9a5.5 5.5 0 0 1 5.3 7l-.7 2.4a2.6 2.6 0 0 1-4.3 1.2L14.9 17H9.1l-1.9 1.6a2.6 2.6 0 0 1-4.3-1.2L2.2 15a5.5 5.5 0 0 1 5.3-7Z"
        />
        <path
          strokeLinecap="round"
          d="M7 11v4M5 13h4M16.5 12h.01M18.5 14h.01"
        />
      </svg>
    );
  }
  if (icon === "explore") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="9" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m15.8 8.2-2.1 5.5-5.5 2.1 2.1-5.5 5.5-2.1Z"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"
      />
    </svg>
  );
}

export function AuthNav({ user }: { user: AuthNavUser }) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const closeProfile = () => setProfileOpen(false);

  useEffect(() => {
    if (!profileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [profileOpen]);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-white/6 bg-[#09090d]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center gap-6">
          <Link
            href="/dashboard"
            onClick={closeProfile}
            className="text-lg font-bold mr-4"
          >
            Next<span className="text-primary">Level</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-white/8 text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop right section */}
          <div className="hidden md:flex items-center gap-3">
            <SearchTrigger variant="nav" />
            {user.username ? (
              <Link
                href={`/u/${user.username}`}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                View Profile
              </Link>
            ) : (
              <Link
                href="/dashboard/settings"
                className="text-xs text-amber-400/60 hover:text-amber-400 transition-colors"
              >
                Set Username
              </Link>
            )}
            <div className="flex items-center gap-2">
              <Avatar name={user.name} image={user.image} size="xs" />
              <button
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/";
                      },
                    },
                  })
                }
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile profile access; primary navigation lives in the thumb dock. */}
          <div className="flex-1 md:hidden" />
          <div className="md:hidden">
            <SearchTrigger variant="icon" />
          </div>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="md:hidden flex items-center justify-center size-11 -mr-1 rounded-full bg-white/5 ring-1 ring-white/10"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            <Avatar name={user.name} image={user.image} size="xs" />
          </button>
        </div>
      </nav>

      {profileOpen && (
        <>
          {/* Click-away layer; Escape closes for keyboard users. */}
          <div
            className="fixed inset-0 z-30 md:hidden"
            aria-hidden="true"
            onClick={closeProfile}
          />
          <div className="fixed right-3 top-16 z-40 w-64 rounded-2xl border border-white/10 bg-[#15151d]/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-xl md:hidden">
            <div className="flex items-center gap-3 p-2">
              <Avatar name={user.name} image={user.image} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-white/35">
                  {user.username ? `@${user.username}` : "Profile not public"}
                </p>
              </div>
            </div>
            <div className="my-2 h-px bg-white/8" />
            {user.username ? (
              <Link
                href={`/u/${user.username}`}
                onClick={() => setProfileOpen(false)}
                className="flex min-h-11 items-center rounded-xl px-3 text-sm text-white/70 active:bg-white/8"
              >
                View public profile
              </Link>
            ) : (
              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="flex min-h-11 items-center rounded-xl px-3 text-sm text-amber-300/80 active:bg-white/8"
              >
                Set up public profile
              </Link>
            )}
            <button
              onClick={() =>
                signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = "/";
                    },
                  },
                })
              }
              className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-red-300/70 active:bg-red-500/10"
            >
              Sign Out
            </button>
          </div>
        </>
      )}

      <nav
        data-auth-mobile-nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#101015]/92 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-2">
          {navItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeProfile}
                className={`relative flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-white/40 active:text-white/70"}`}
              >
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
                )}
                <span className="size-5" aria-hidden="true">
                  <MobileNavIcon icon={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
