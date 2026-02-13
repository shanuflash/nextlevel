import Link from "next/link";
import { getSession } from "@/src/lib/session";
import { db } from "@/src/lib/auth";
import { user as userTable } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";
import { AuthNav } from "./auth-nav";

export async function PublicNav() {
  const session = await getSession();

  if (session?.user) {
    const rows = await db
      .select({
        username: userTable.username,
        image: userTable.image,
        name: userTable.name,
      })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);
    const dbUser = rows[0];

    if (dbUser) {
      return (
        <AuthNav
          user={{
            id: session.user.id,
            name: dbUser.name,
            image: dbUser.image ?? undefined,
            username: dbUser.username ?? undefined,
          }}
        />
      );
    }
  }

  return (
    <nav className="border-b border-white/6 bg-white/1">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Next<span className="text-primary">Level</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
