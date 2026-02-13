# NextLevel

A game tracking and catalog app. Search games via IGDB, organize them into categories, rate them, and share your catalog with a public profile.

Built with Next.js (App Router), Turso (LibSQL), Drizzle ORM, and better-auth.

## Features

- Search and add games from the IGDB database
- Organize games into categories: Finished, Playing, Want to Play, On Hold, Dropped
- Rate games (1-10) and add personal notes
- Public profile pages at `/u/username` with shareable URLs
- Dashboard with category stats, Most Anticipated, and Recently Released games
- Game detail pages with metadata, cover art, and community stats
- Explore page showing popular games and active users
- Google OAuth and email/password authentication
- Automated cron jobs for popularity scores and featured game rotation

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Database**: Turso (LibSQL) with Drizzle ORM
- **Auth**: better-auth (email/password + Google OAuth)
- **Styling**: Tailwind CSS 4
- **Game Data**: IGDB API (via Twitch OAuth)
- **Hosting**: Vercel

## Setup

### Prerequisites

- Node.js 20+
- A Turso database
- Twitch developer credentials (for IGDB API access)
- Google OAuth credentials (optional, for Google sign-in)

### Environment Variables

Create a `.env` file in the project root:

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

BETTER_AUTH_SECRET=a-random-32-char-string

CRON_SECRET=a-random-secret-for-cron-auth
```

`TURSO_API_TOKEN` is only needed if you want to use the `backup` admin command.

### Install and Run

```bash
yarn install
yarn dev
```

### Database

Push the schema to your Turso database:

```bash
npx drizzle-kit push
```

Or run migrations:

```bash
npx drizzle-kit migrate
```

## Project Structure

```
nextlevel/
  schema/             Drizzle table definitions (auth + game schemas)
  migrations/         SQL migration files
  scripts/            Admin CLI tools
  src/
    app/
      api/            API routes (auth handler, IGDB proxy, cron jobs)
      dashboard/      Protected dashboard (stats, game management, settings)
      explore/        Public explore page
      game/[igdbId]/  Game detail page
      login/          Sign in page
      signup/         Sign up page
      u/[username]/   Public profile page
    components/       Shared UI components
    lib/              Auth config, IGDB helpers, session, constants
```

## Cron Jobs

Two scheduled jobs run on Vercel:

| Job | Schedule | What it does |
|-----|----------|--------------|
| `update-popularity` | Daily at 06:00 UTC | Fetches `total_rating_count` and `hypes` from IGDB for all tracked games, updates the `popularity` column |
| `update-featured` | Mondays at 06:00 UTC | Picks the top 5 most hyped upcoming games and top 5 recently released games from IGDB, sets their featured flags in the database |

Both endpoints require `Authorization: Bearer <CRON_SECRET>`.

## Admin Script

A CLI tool for database maintenance. Run with:

```bash
npx tsx scripts/admin.ts <command>
```

| Command | Description |
|---------|-------------|
| `stats` | Show database overview (user/game counts, categories, top games by popularity) |
| `resync-metadata` | Re-fetch all game metadata from IGDB (title, cover, genres, platforms, etc.) |
| `update-popularity` | Update popularity scores for all games |
| `update-featured` | Refresh Most Anticipated and Recently Released flags from IGDB |
| `find-orphans` | Find `user_game` rows pointing to missing games |
| `recover-games` | Restore missing game rows from a Turso point-in-time fork (requires `TURSO_API_TOKEN`) |
| `backup` | Fork the database to a timestamped backup via Turso API (requires `TURSO_API_TOKEN`) |

## Database Schema

**game** -- cached IGDB metadata for each tracked game:
- `igdbId`, `title`, `slug`, `coverImageId`, `genres`, `platforms`, `releaseDate`, `summary`
- `popularity` (computed score from IGDB rating count + hypes)
- `isFeaturedAnticipated`, `isFeaturedReleased` (flags set by the weekly cron)

**user_game** -- links users to games:
- `userId`, `gameId`, `category` (finished/playing/want-to-play/on-hold/dropped)
- `rating` (1-10), `notes`, timestamps

**user**, **session**, **account**, **verification** -- managed by better-auth.

## Game Data

All game metadata comes from [IGDB](https://www.igdb.com). The app caches game data locally in the `game` table to avoid repeated API calls. Cover images are served directly from the IGDB CDN.
