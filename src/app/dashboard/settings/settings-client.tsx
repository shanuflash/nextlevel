"use client";

import { useState } from "react";
import Image from "next/image";
import { updateProfile } from "./actions";


interface UserData {
  name: string;
  username: string;
  bio: string;
  email: string;
  image?: string;
}

interface FormMessage {
  type: "success" | "error";
  text: string;
}

export function SettingsClient({ user }: { user: UserData }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setMessage(null);
    try {
      await updateProfile(formData);
      setMessage({ type: "success", text: "Profile updated!" });
    } catch (e: unknown) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to update",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-white/40 text-sm mt-1">
          Manage your profile and account.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="bg-white/3 rounded-2xl border border-white/8 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Profile
          </h2>

          <div className="flex items-center gap-4">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={64}
                height={64}
                className="size-16 rounded-2xl ring-2 ring-white/10"
              />
            ) : (
              <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {user.name[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-white/30">{user.email}</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">
              Display Name
            </label>
            <input
              name="name"
              defaultValue={user.name}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/20"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">
              Username
            </label>
            <div className="flex items-center gap-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/20">
              <span className="pl-3 text-sm text-white/30">
                nextlevel.app/u/
              </span>
              <input
                name="username"
                defaultValue={user.username}
                pattern="^[a-z0-9_-]{3,30}$"
                className="flex-1 bg-transparent px-1 py-2.5 text-sm focus:outline-none"
                placeholder="yourname"
              />
            </div>
            <p className="text-[11px] text-white/25 mt-1">
              3-30 characters. Lowercase letters, numbers, hyphens, underscores.
            </p>
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">Bio</label>
            <textarea
              name="bio"
              defaultValue={user.bio}
              rows={3}
              maxLength={200}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/20 resize-none"
              placeholder="Tell people about your gaming taste..."
            />
          </div>
        </div>

        {message && (
          <div
            className={`px-4 py-3 rounded-xl text-sm ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="bg-white/3 rounded-2xl border border-white/8 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Account
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs text-white/40">{user.email}</p>
          </div>
          <span className="text-xs text-white/20 bg-white/5 px-2.5 py-1 rounded-lg border border-white/8">
            Google
          </span>
        </div>
      </div>
    </div>
  );
}
