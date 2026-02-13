"use client";

import { useState } from "react";
import Image from "next/image";
import { updateProfile, setNewPassword } from "./actions";
import { authClient } from "@/src/lib/auth-client";

interface UserData {
  name: string;
  username: string;
  bio: string;
  email: string;
  image?: string;
  providers: string[];
  hasPassword: boolean;
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

      <PasswordSection hasPassword={user.hasPassword} />

      <div className="bg-white/3 rounded-2xl border border-white/8 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Account
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs text-white/40">{user.email}</p>
          </div>
          <div className="flex gap-2">
            {user.providers.map((p) => (
              <span
                key={p}
                className="text-xs text-white/20 bg-white/5 px-2.5 py-1 rounded-lg border border-white/8 capitalize"
              >
                {p === "credential" ? "Password" : p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordSection({ hasPassword }: { hasPassword: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords don't match" });
      return;
    }

    setIsPending(true);

    try {
      if (hasPassword) {
        const { error } = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        });
        if (error) throw new Error(error.message || "Failed to change password");
      } else {
        await setNewPassword(newPassword);
      }

      setMessage({
        type: "success",
        text: hasPassword ? "Password changed!" : "Password set! You can now sign in with your username and password.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Something went wrong",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handlePasswordSubmit}>
      <div className="bg-white/3 rounded-2xl border border-white/8 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Password
          </h2>
          {!hasPassword && (
            <p className="text-xs text-white/30 mt-1">
              Set a password to sign in with your username and password.
            </p>
          )}
        </div>

        {hasPassword && (
          <div>
            <label className="text-xs text-white/40 block mb-1.5">
              Current password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isPending}
                placeholder="Current password"
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-white/20 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <EyeIcon open={showCurrent} />
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs text-white/40 block mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              disabled={isPending}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-white/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <EyeIcon open={showNew} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 block mb-1.5">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            disabled={isPending}
            placeholder="Repeat new password"
            autoComplete="new-password"
            className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50 ${
              confirmPassword && confirmPassword !== newPassword
                ? "border-red-500/40 focus:border-red-500/40"
                : "border-white/10 focus:border-white/20"
            }`}
          />
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="text-xs text-red-400/70 mt-1">Passwords don&apos;t match</p>
          )}
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
            disabled={isPending || (!!confirmPassword && confirmPassword !== newPassword)}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-white/8 border border-white/10 text-white hover:bg-white/12 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending
              ? "Saving..."
              : hasPassword
                ? "Change Password"
                : "Set Password"}
          </button>
        </div>
      </div>
    </form>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z" clipRule="evenodd" />
        <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 4.09 5.12L6.38 7.41a4 4 0 0 0 4.368 6.52Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}
