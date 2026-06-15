import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayStoreIcon,
  AppleIcon,
  YoutubeIcon,
  TwitchIcon,
  DiscordIcon,
  RedditIcon,
  NewTwitterIcon,
  InstagramIcon,
  Facebook01Icon,
  NintendoSwitchIcon,
  Globe02Icon,
  LinkSquare02Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { IGDBStoreLink, StoreKind } from "@/src/lib/igdb";
import {
  SteamIcon,
  PlayStationIcon,
  XboxIcon,
  EpicGamesIcon,
} from "./brand-icons";

// Brand glyphs (inline SVG) for stores that the Hugeicons free set lacks.
const BRAND_ICON: Partial<
  Record<StoreKind, (props: { className?: string }) => React.ReactElement>
> = {
  steam: SteamIcon,
  playstation: PlayStationIcon,
  xbox: XboxIcon,
  epic: EpicGamesIcon,
};

const STORE_ICON: Record<StoreKind, IconSvgElement> = {
  steam: Globe02Icon, // overridden by brand glyph
  epic: Globe02Icon,
  gog: Globe02Icon,
  xbox: Globe02Icon, // overridden by brand glyph
  playstation: Globe02Icon, // overridden by brand glyph
  nintendo: NintendoSwitchIcon,
  official: Globe02Icon,
  youtube: YoutubeIcon,
  twitch: TwitchIcon,
  twitter: NewTwitterIcon,
  reddit: RedditIcon,
  discord: DiscordIcon,
  appstore: AppleIcon,
  googleplay: PlayStoreIcon,
  itch: Globe02Icon,
  wikipedia: Globe02Icon,
  fandom: Globe02Icon,
  instagram: InstagramIcon,
  facebook: Facebook01Icon,
  igdb: LinkSquare02Icon,
  link: Globe02Icon,
};

// Only these social/community links get the de-emphasized secondary row.
// Wikipedia / Fandom / generic links / the IGDB fallback are dropped as clutter
// (unless nothing else exists — see fallback handling below).
const SECONDARY_KINDS: StoreKind[] = [
  "youtube",
  "discord",
  "twitter",
  "reddit",
  "twitch",
  "instagram",
  "facebook",
];

// Only actual storefronts get the prominent labeled buttons. The official site
// and socials are secondary actions surfaced in a lighter row beneath.
const PRIMARY_KINDS: StoreKind[] = [
  "steam",
  "epic",
  "gog",
  "xbox",
  "playstation",
  "nintendo",
  "appstore",
  "googleplay",
  "itch",
];

export function StoreLinks({ links }: { links: IGDBStoreLink[] }) {
  if (links.length === 0) return null;

  let primary = links.filter((l) => PRIMARY_KINDS.includes(l.kind));
  const official = links.find((l) => l.kind === "official");
  const socials = links.filter((l) => SECONDARY_KINDS.includes(l.kind));

  // Ensure there's always at least one link surfaced (e.g. games with only an
  // IGDB or Wikipedia entry); promote the best available to the primary row.
  if (primary.length === 0 && !official && socials.length === 0) {
    const fallback = links.find((l) => l.kind === "igdb") ?? links[0];
    if (fallback) primary = [fallback];
  }

  const hasSecondary = Boolean(official) || socials.length > 0;

  return (
    <div className="space-y-4 sm:space-y-3">
      {primary.length > 0 && (
        // Mobile: icon-only glyphs in a centered row to avoid text-wrapping.
        // sm+: labeled pill buttons, left-aligned.
        <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-2">
          {primary.map((link) => {
            const Brand = BRAND_ICON[link.kind];
            const icon = Brand ? (
              <Brand className="size-4" />
            ) : (
              <HugeiconsIcon
                icon={STORE_ICON[link.kind]}
                className="size-4"
                strokeWidth={2}
              />
            );
            return (
              <a
                key={`${link.kind}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.label}
                aria-label={link.label}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/8 size-11 sm:size-auto sm:px-3.5 sm:py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/15 hover:border-white/20"
              >
                <span className="*:size-5 sm:*:size-4">{icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </a>
            );
          })}
        </div>
      )}

      {hasSecondary && (
        // Mobile: official site centered on its own line, socials centered beneath.
        // sm+: inline row with a divider.
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-x-4 sm:gap-y-2 sm:flex-wrap">
          {official && (
            <a
              href={official.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-white/45 underline-offset-4 transition-colors hover:text-white/80 hover:underline"
            >
              Official site
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                className="size-3.5"
                strokeWidth={2}
              />
            </a>
          )}

          {official && socials.length > 0 && (
            <span className="hidden sm:block h-3.5 w-px bg-white/12" aria-hidden />
          )}

          {socials.length > 0 && (
            <div className="flex items-center gap-3.5">
              {socials.map((link) => (
                <a
                  key={`${link.kind}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label}
                  aria-label={link.label}
                  className="text-white/40 transition-colors hover:text-white/85"
                >
                  <HugeiconsIcon
                    icon={STORE_ICON[link.kind]}
                    className="size-5"
                    strokeWidth={2}
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
