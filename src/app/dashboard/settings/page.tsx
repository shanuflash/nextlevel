import { getSession } from "@/src/lib/session";
import { db } from "@/src/lib/auth";
import { user, account } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!dbUser) return null;

  const accounts = await db
    .select({ providerId: account.providerId, password: account.password })
    .from(account)
    .where(eq(account.userId, session.user.id));

  const providers = accounts.map((a) => a.providerId);
  const hasPassword = accounts.some(
    (a) => a.providerId === "credential" && a.password
  );

  return (
    <SettingsClient
      user={{
        name: dbUser.name,
        username: dbUser.username ?? "",
        bio: dbUser.bio ?? "",
        email: dbUser.email,
        image: dbUser.image ?? undefined,
        providers,
        hasPassword,
      }}
    />
  );
}
