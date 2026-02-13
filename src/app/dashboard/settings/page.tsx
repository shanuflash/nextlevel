import { getSession } from "@/src/lib/session";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!dbUser) return null;

  return (
    <SettingsClient
      user={{
        name: dbUser.name,
        username: dbUser.username ?? "",
        bio: dbUser.bio ?? "",
        email: dbUser.email,
        image: dbUser.image ?? undefined,
      }}
    />
  );
}
