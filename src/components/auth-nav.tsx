"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/src/lib/auth-client";
import { Avatar } from "@/src/components/avatar";
import { useState } from "react";

interface AuthNavUser {
  name: string;
  image?: string;
  username?: string;
}

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/games", label: "Games" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/explore", label: "Explore" },
];

export function AuthNav({ user }: { user: AuthNavUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-white/6 bg-white/1">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-6">
        <Link href="/" className="text-lg font-bold tracking-tight mr-4">
          Next<span className="text-primary">Level</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
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

        {/* Mobile: spacer + hamburger */}
        <div className="flex-1 md:hidden" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center size-10 -mr-2 rounded-lg text-white/50 hover:text-white/80 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/6 bg-white/1 px-6 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-white/8 text-white"
                    : "text-white/40 active:text-white/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="border-t border-white/6 pt-3 mt-2 flex items-center gap-3">
            <Avatar name={user.name} image={user.image} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              {user.username && (
                <Link
                  href={`/u/${user.username}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-xs text-white/30"
                >
                  View Profile
                </Link>
              )}
              {!user.username && (
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs text-amber-400/60"
                >
                  Set Username
                </Link>
              )}
            </div>
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
              className="px-3 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
