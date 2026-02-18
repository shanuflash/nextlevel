"use client";

import { useState } from "react";
import { updateProfile, setNewPassword as setPasswordAction } from "./actions";
import { Avatar } from "@/src/components/avatar";
import { authClient } from "@/src/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GoogleIcon, EyeIcon } from "@/src/components/icons";

type Provider = "google" | "github";

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
  const hasGithub = user.providers.includes("github");

  async function handleLink(provider: Provider) {
    setIsLinking(true);
    try {
      await authClient.linkSocial({
        provider,
        callbackURL: "/dashboard/settings",
      });
    } catch {
      const name = provider === "google" ? "Google" : "Github";
      toast.error(`Failed to link ${name} account`);
      setIsLinking(false);
    }
  }

  async function handleUnlink(provider: Provider) {
    const hasPassword = user.hasPassword;
    if (!hasPassword) {
      const name = provider === "google" ? "Google" : "Github";
      toast.error(
        `Set a password first before unlinking ${name} — otherwise you'll be locked out!`
      );
      return;
    }

    setIsUnlinking(true);
    try {
      const { error } = await authClient.unlinkAccount({ providerId: provider });
      if (error) throw new Error(error.message);
      const name = provider === "google" ? "Google" : "Github";
      toast.success(`${name} account unlinked`);
      router.refresh();
    } catch (e: unknown) {
      const name = provider === "google" ? "Google" : "Github";
      toast.error(
        e instanceof Error ? e.message : `Failed to unlink ${name} account`
      );
    } finally {
      setIsUnlinking(false);
    }
  }

  function ProviderRow({
    provider,
    icon,
    isConnected,
  }: {
    provider: Provider;
    icon: React.ReactNode;
    isConnected: boolean;
  }) {
    const name = provider === "google" ? "Google" : "GitHub";
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-[11px] text-white/30">
              {isConnected ? "Connected" : "Not connected"}
            </p>
            {isConnected && (
              <p className="text-[11px] text-white/20">{user.email}</p>
            )}
          </div>
        </div>
        {isConnected ? (
          <button
            onClick={() => handleUnlink(provider)}
            disabled={isUnlinking}
            className="text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {isUnlinking ? "Unlinking..." : "Unlink"}
          </button>
        ) : (
          <button
            onClick={() => handleLink(provider)}
            disabled={isLinking}
            className="text-xs text-primary/70 hover:text-primary transition-colors disabled:opacity-50"
          >
            {isLinking ? "Linking..." : "Link"}
          </button>
        )}
      </div>
    );
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
          <ProviderRow
            provider="google"
            isConnected={hasGoogle}
            icon={<GoogleIcon className="size-4" />}
          />
          <ProviderRow
            provider="github"
            isConnected={hasGithub}
            icon={
              <svg className="size-4" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            }
          />
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
