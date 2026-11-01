const FALLBACK = "/dashboard";

/**
 * Validates a `?next=` redirect target. Only same-origin relative paths are
 * allowed: must start with "/" but not "//" or "/\" (browsers treat both as
 * protocol-relative URLs to another host). Anything else falls back to
 * /dashboard, as do the auth pages themselves to avoid bouncing back to them.
 */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return FALLBACK;
  // Backslashes and control characters get normalized by browsers in ways
  // that can escape the origin, so reject them outright.
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return FALLBACK;

  try {
    const base = "http://n.invalid";
    const url = new URL(raw, base);
    if (url.origin !== base) return FALLBACK;
    if (url.pathname === "/login" || url.pathname === "/signup") {
      return FALLBACK;
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return FALLBACK;
  }
}

/** Builds an auth page link that carries a validated `next` along, if any. */
export function authHref(
  page: "/login" | "/signup",
  next: string | null | undefined
): string {
  const target = safeNextPath(next);
  return target === FALLBACK
    ? page
    : `${page}?next=${encodeURIComponent(target)}`;
}
