"use server";

import { db, auth } from "@/src/lib/auth";
import { user, account, session as sessionTable } from "@/schema/auth-schema";
import { userGame } from "@/schema/game-schema";
import { getSession } from "@/src/lib/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  const rawUsername = (formData.get("username") as string)?.trim();
  const username = rawUsername
    ? rawUsername.toLowerCase().replace(/[^a-z0-9_.]/g, "")
    : "";
  const bio = formData.get("bio") as string;

  if (!name) throw new Error("Name is required");
  if (name.length > 50) throw new Error("Name must be 50 characters or less");
  if (bio && bio.length > 200)
    throw new Error("Bio must be 200 characters or less");

  if (username && !/^[a-z0-9_.]{3,30}$/.test(username)) {
    throw new Error(
      "Username must be 3-30 characters, lowercase letters, numbers, underscores, or dots only."
    );
  }

  if (username) {
    const existing = await db.query.user.findFirst({
      where: eq(user.username, username),
    });
    if (existing && existing.id !== session.user.id) {
      throw new Error("Username is already taken");
    }
  }

  await db
    .update(user)
    .set({
      name,
      username: username || null,
      displayUsername: username || null,
      bio: bio || null,
    })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/explore");
  if (username) revalidatePath(`/u/${username}`);
}

// Saved on its own (not via the profile form) so the switch takes effect the
// moment it's flipped.
export async function setProfilePrivacy(isPrivate: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const [updated] = await db
    .update(user)
    .set({ isPrivate })
    .where(eq(user.id, session.user.id))
    .returning({ username: user.username });

  revalidatePath("/dashboard/settings");
  revalidatePath("/explore");
  if (updated?.username) revalidatePath(`/u/${updated.username}`);
}

// Permanently deletes the signed-in user and everything they own. Only ever
// targets the current session's user; `confirmation` must match their
// username (or "delete" when they have none) as a guard against misclicks.
export async function deleteAccount(confirmation: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const userId = session.user.id;
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { username: true },
  });
  if (!dbUser) throw new Error("Account not found");

  const expected = dbUser.username || "delete";
  if (confirmation.trim().toLowerCase() !== expected) {
    throw new Error(`Type "${expected}" to confirm`);
  }

  // Sign out first so the session cookie is cleared on this response.
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {
    // The rows are removed below either way.
  }

  // Explicit deletes rather than relying on FK cascades (SQLite enforcement
  // depends on a connection pragma). Batched so it's all-or-nothing.
  await db.batch([
    db.delete(userGame).where(eq(userGame.userId, userId)),
    db.delete(sessionTable).where(eq(sessionTable.userId, userId)),
    db.delete(account).where(eq(account.userId, userId)),
    db.delete(user).where(eq(user.id, userId)),
  ]);

  revalidatePath("/explore");
  if (dbUser.username) revalidatePath(`/u/${dbUser.username}`);
}

export async function setNewPassword(newPassword: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  await auth.api.setPassword({
    body: { newPassword },
    headers: await headers(),
  });

  revalidatePath("/dashboard/settings");
}
