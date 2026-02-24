# NextLevel

A personal game tracking and catalog app. Search games via IGDB, organize them into categories, rate them, and share your catalog with a public profile.

**Live at [nextlevel.shanu.dev](https://nextlevel.shanu.dev)**

## Features

- Search and add games from the IGDB database
- Organize games into categories: Finished, Playing, Want to Play, On Hold, Dropped
- Rate games (1-10) and add personal notes
- Public profile pages at `/u/username` with shareable URLs
- Dynamic Open Graph image generation for the site and user profiles
- Dashboard with category stats, Most Anticipated, and Recently Released games
- Game detail pages with metadata, cover art, and community stats
- Explore page showing popular games and active users
- Profile settings: edit name, username, bio, and change password
- Google and GitHub OAuth with email/password authentication and account linking
- Route-level loading skeletons for instant navigation feedback
- Automated cron jobs for popularity scores and featured game rotation

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Database**: Turso (LibSQL) with Drizzle ORM
- **Auth**: better-auth (email/password + Google & GitHub OAuth)
- **Styling**: Tailwind CSS 4, Radix UI, shadcn/ui
- **UI**: Sonner (toasts), Hugeicons
- **OG Images**: @vercel/og (Edge runtime)
- **Game Data**: [IGDB API](https://www.igdb.com/api) (via Twitch OAuth)
- **Hosting**: Vercel

## Architecture

### Project Structure

```
src/
  app/
    page.tsx              Landing page
    layout.tsx            Root layout (metadata, fonts, analytics)
    opengraph-image.tsx   Root OG image (Edge runtime)
    [...all]/             better-auth catch-all route
    api/                  API routes (IGDB proxy, cron jobs)
    dashboard/            Protected dashboard (stats, game management, settings)
    explore/              Public explore page
    game/[igdbId]/        Game detail page
    login/                Sign in page
    signup/               Sign up page
    u/[username]/         Public profile page + OG image
  components/             Shared components (Avatar, nav, etc.)
  components/ui/          shadcn/Radix UI primitives
  lib/                    Auth config, IGDB helpers, session, OG DB client, constants
schema/                   Drizzle table definitions (auth + game schemas)
scripts/                  Admin CLI tools (stats, resync, backup, etc.)
```

### Data Model

**game** — cached IGDB metadata for each tracked game (title, cover, genres, platforms, release date, summary, popularity score, featured flags).

**user_game** — links users to games with a category (finished / playing / want-to-play / on-hold / dropped), rating (1-10), and notes.

**user**, **session**, **account**, **verification** — managed by better-auth.

### Background Jobs

Two Vercel cron jobs keep game data fresh:

- **Daily** — re-fetches popularity scores (rating count + hypes) from IGDB for all tracked games.
- **Weekly** — picks the top most-hyped upcoming and recently released games from IGDB and flags them as featured.

### Game Data

All game metadata comes from the [IGDB API](https://www.igdb.com/api). The app caches game data locally to avoid repeated API calls. Cover images are served directly from the IGDB CDN.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (recommended) or npm
- A [Turso](https://turso.tech/) database
- [Twitch Developer](https://dev.twitch.tv/console) credentials (for IGDB API access)
- OAuth credentials for [Google](https://console.cloud.google.com/) and/or [GitHub](https://github.com/settings/developers) (optional, for social login)

### Installation

```bash
git clone https://github.com/your-username/nextlevel.git
cd nextlevel
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# IGDB / Twitch (required for game search)
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret

# OAuth providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Cron job protection
CRON_SECRET=any-random-secret-string

# App URL (optional, used on landing page)
NEXT_PUBLIC_APP_URL=nextlevel.shanu.dev
```

### Database Setup

Push the Drizzle schema to your Turso database:

```bash
npx drizzle-kit push
```

Or run migrations:

```bash
npx drizzle-kit migrate
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
pnpm build
pnpm start
```
