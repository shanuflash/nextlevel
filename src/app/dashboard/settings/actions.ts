"use server";

import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { getSession } from "@/src/lib/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;

  if (!name) throw new Error("Name is required");

  if (username && !/^[a-z0-9_-]{3,30}$/.test(username)) {
    throw new Error(
      "Username must be 3-30 characters, lowercase letters, numbers, hyphens, or underscores only.",
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
      bio: bio || null,
    })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
