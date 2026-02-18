import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

// Game — cached IGDB metadata, saved once when a user first adds the game.
export const game = sqliteTable(
  "game",
  {
    id: text("id").primaryKey(),
    igdbId: integer("igdb_id").notNull().unique(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    coverImageId: text("cover_image_id"),
    genres: text("genres"),
    platforms: text("platforms"),
    releaseDate: text("release_date"),
    summary: text("summary"),
    popularity: integer("popularity").default(0).notNull(),
    isFeaturedAnticipated: integer("is_featured_anticipated", {
      mode: "boolean",
    })
      .default(false)
      .notNull(),
    isFeaturedReleased: integer("is_featured_released", { mode: "boolean" })
      .default(false)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date()),
  },
  (table) => [index("game_igdbId_idx").on(table.igdbId)],
);

// User's game — the join table linking users to games with their personal data
export const userGame = sqliteTable(
  "user_game",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    gameId: text("game_id")
      .notNull()
      .references(() => game.id),
    igdbId: integer("igdb_id"), // redundant copy for disaster recovery
    category: text("category", {
      enum: ["finished", "playing", "want-to-play", "on-hold", "dropped"],
    }).notNull(),
    rating: real("rating"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("userGame_userId_idx").on(table.userId),
    index("userGame_gameId_idx").on(table.gameId),
    index("userGame_category_idx").on(table.userId, table.category),
  ],
);

export const gameRelations = relations(game, ({ many }) => ({
  userGames: many(userGame),
}));

export const userGameRelations = relations(userGame, ({ one }) => ({
  user: one(user, {
    fields: [userGame.userId],
    references: [user.id],
  }),
  game: one(game, {
    fields: [userGame.gameId],
    references: [game.id],
  }),
}));
