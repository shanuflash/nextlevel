"use client";

import { useState } from "react";
import { updateProfile, setNewPassword as setPasswordAction } from "./actions";
import { Avatar } from "@/src/components/avatar";
import { authClient } from "@/src/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

function Message({ message }: { message: FormMessage }) {
  return (
    <div
      className={`px-4 py-3 rounded-xl text-sm ${
        message.type === "success"
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      }`}
    >
      {message.text}
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-4"
      >
        <path
          fillRule="evenodd"
          d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z"
          clipRule="evenodd"
        />
        <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 4.09 5.12L6.38 7.41a4 4 0 0 0 4.368 6.52Z" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-4"
    >
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SettingsClient({ user }: { user: UserData }) {
  return (
    <div className="max-w-xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-white/40 text-sm mt-1">
          Manage your profile and account.
        </p>
      </div>

      <ProfileSection user={user} />
      <SecuritySection user={user} />
    </div>
  );
}

/* ─── Profile ─── */

function ProfileSection({ user }: { user: UserData }) {
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
    <section>
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
        Profile
      </h2>

      <form action={handleSubmit}>
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] divide-y divide-white/[0.06]">
          <div className="p-5 flex items-center gap-4">
            <Avatar name={user.name} image={user.image} size="md" showRing />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-white/30 truncate">{user.email}</p>
            </div>
          </div>

          {/* Display Name */}
          <div className="p-5">
            <label className="text-xs text-white/40 block mb-2">
              Display Name
            </label>
            <input
              name="name"
              defaultValue={user.name}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors"
            />
          </div>

          {/* Username */}
          <div className="p-5">
            <label className="text-xs text-white/40 block mb-2">Username</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary/40 transition-colors">
              <span className="pl-3.5 text-sm text-white/25 select-none shrink-0">
                /u/
              </span>
              <input
                name="username"
                defaultValue={user.username}
                pattern="^[a-z0-9_.-]{3,30}$"
                className="flex-1 bg-transparent px-1 py-2.5 text-sm focus:outline-none min-w-0"
                placeholder="yourname"
              />
            </div>
            <p className="text-[11px] text-white/20 mt-1.5">
              3-30 characters. Lowercase letters, numbers, hyphens, underscores.
            </p>
            {user.username && (
              <p className="text-[11px] text-white/30 mt-1">
                Public profile:{" "}
                <a
                  href={`/u/${user.username}`}
                  className="text-primary/70 hover:text-primary transition-colors"
                >
                  /u/{user.username}
                </a>
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="p-5">
            <label className="text-xs text-white/40 block mb-2">Bio</label>
            <textarea
              name="bio"
              defaultValue={user.bio}
              rows={3}
              maxLength={200}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors resize-none"
              placeholder="Tell people about your gaming taste..."
            />
          </div>

          {/* Save */}
          <div className="p-5 flex items-center justify-between gap-4">
            {message ? <Message message={message} /> : <div />}
            <button
              type="submit"
              disabled={isPending}
              className="shrink-0 px-5 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

/* ─── Security ─── */

function SecuritySection({ user }: { user: UserData }) {
  const router = useRouter();
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const hasGoogle = user.providers.includes("google");
  const canUnlinkGoogle = hasGoogle && user.hasPassword;

  const hasGithub = user.providers.includes("github");
  const canUnlinkGithub = hasGithub && user.hasPassword;

  async function handleLinkGoogle() {
    setIsLinking(true);
    try {
      await authClient.linkSocial({
        provider: "google",
        callbackURL: "/dashboard/settings",
      });
    } catch {
      toast.error("Failed to link Google account");
      setIsLinking(false);
    }
  }

  async function handleLinkGithub() {
    setIsLinking(true);
    try {
      await authClient.linkSocial({
        provider: "github",
        callbackURL: "/dashboard/settings",
      });
    } catch {
      toast.error("Failed to link Github account");
      setIsLinking(false);
    }
  }

  async function handleUnlinkGoogle() {
    if (!canUnlinkGoogle) {
      toast.error(
        "Set a password first before unlinking Google — otherwise you'll be locked out!"
      );
      return;
    }

    setIsUnlinking(true);
    try {
      const { error } = await authClient.unlinkAccount({
        providerId: "google",
      });
      if (error) throw new Error(error.message);
      toast.success("Google account unlinked");
      router.refresh();
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : "Failed to unlink Google account"
      );
    } finally {
      setIsUnlinking(false);
    }
  }

  async function handleUnlinkGithub() {
    if (!canUnlinkGithub) {
      toast.error(
        "Set a password first before unlinking Github — otherwise you'll be locked out!"
      );
      return;
    }

    setIsUnlinking(true);
    try {
      const { error } = await authClient.unlinkAccount({
        providerId: "github",
      });
      if (error) throw new Error(error.message);
      toast.success("Github account unlinked");
      router.refresh();
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : "Failed to unlink Github account"
      );
    } finally {
      setIsUnlinking(false);
    }
  }

  return (
    <section>
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
        Security
      </h2>

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] divide-y divide-white/[0.06]">
        {/* Email */}
        <div className="p-5">
          <p className="text-xs text-white/40 mb-0.5">Email</p>
          <p className="text-sm">{user.email}</p>
        </div>

        {/* Connected accounts */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-white/40">Connected accounts</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Google</p>
                <p className="text-[11px] text-white/30">
                  {hasGoogle ? "Connected" : "Not connected"}
                </p>
                {hasGoogle && (
                  <p className="text-[11px] text-white/20">{user.email}</p>
                )}
              </div>
            </div>
            {hasGoogle ? (
              <button
                onClick={handleUnlinkGoogle}
                disabled={isUnlinking}
                className="text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {isUnlinking ? "Unlinking..." : "Unlink"}
              </button>
            ) : (
              <button
                onClick={handleLinkGoogle}
                disabled={isLinking}
                className="text-xs text-primary/70 hover:text-primary transition-colors disabled:opacity-50"
              >
                {isLinking ? "Linking..." : "Link"}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">GitHub</p>
                <p className="text-[11px] text-white/30">
                  {hasGithub ? "Connected" : "Not connected"}
                </p>
                {hasGithub && (
                  <p className="text-[11px] text-white/20">{user.email}</p>
                )}
              </div>
            </div>
            {hasGithub ? (
              <button
                onClick={handleUnlinkGithub}
                disabled={isUnlinking}
                className="text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {isUnlinking ? "Unlinking..." : "Unlink"}
              </button>
            ) : (
              <button
                onClick={handleLinkGithub}
                disabled={isLinking}
                className="text-xs text-primary/70 hover:text-primary transition-colors disabled:opacity-50"
              >
                {isLinking ? "Linking..." : "Link"}
              </button>
            )}
          </div>
        </div>

        {/* Password */}
        <PasswordFields hasPassword={user.hasPassword} />
      </div>
    </section>
  );
}

function PasswordFields({ hasPassword }: { hasPassword: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const mismatch = !!confirmPassword && confirmPassword !== newPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }
    if (mismatch) {
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
        if (error)
          throw new Error(error.message || "Failed to change password");
      } else {
        await setPasswordAction(newPassword);
      }

      setMessage({
        type: "success",
        text: hasPassword
          ? "Password changed!"
          : "Password set! You can now sign in with your username.",
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
    <form onSubmit={handleSubmit}>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 mb-0.5">Password</p>
            <p className="text-sm">
              {hasPassword
                ? "Change your password"
                : "Set a password to enable username login"}
            </p>
          </div>
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors disabled:opacity-50"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors disabled:opacity-50"
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
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={isPending}
              placeholder="Repeat password"
              autoComplete="new-password"
              className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-colors disabled:opacity-50 ${
                mismatch
                  ? "border-red-500/40 focus:ring-1 focus:ring-red-500/30"
                  : "border-white/10 focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
              }`}
            />
            {mismatch && (
              <p className="text-[11px] text-red-400/70 mt-1">
                Doesn&apos;t match
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          {message ? <Message message={message} /> : <div />}
          <button
            type="submit"
            disabled={isPending || mismatch}
            className="shrink-0 px-5 py-2 rounded-xl text-sm font-medium bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/[0.1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending
              ? "Saving..."
              : hasPassword
                ? "Update Password"
                : "Set Password"}
          </button>
        </div>
      </div>
    </form>
  );
}
