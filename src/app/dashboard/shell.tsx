"use client";

import { AuthNav } from "@/src/components/auth-nav";

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  username?: string;
}

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <AuthNav user={user} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
