DROP INDEX "account_userId_idx";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "session_userId_idx";--> statement-breakpoint
DROP INDEX "user_username_unique";--> statement-breakpoint
DROP INDEX "user_display_username_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_username_idx";--> statement-breakpoint
DROP INDEX "verification_identifier_idx";--> statement-breakpoint
DROP INDEX "game_igdb_id_unique";--> statement-breakpoint
DROP INDEX "game_igdbId_idx";--> statement-breakpoint
DROP INDEX "userGame_userId_idx";--> statement-breakpoint
DROP INDEX "userGame_gameId_idx";--> statement-breakpoint
DROP INDEX "userGame_category_idx";--> statement-breakpoint
ALTER TABLE `game` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_display_username_unique` ON `user` (`display_username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_username_idx` ON `user` (`username`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_igdb_id_unique` ON `game` (`igdb_id`);--> statement-breakpoint
CREATE INDEX `game_igdbId_idx` ON `game` (`igdb_id`);--> statement-breakpoint
CREATE INDEX `userGame_userId_idx` ON `user_game` (`user_id`);--> statement-breakpoint
CREATE INDEX `userGame_gameId_idx` ON `user_game` (`game_id`);--> statement-breakpoint
CREATE INDEX `userGame_category_idx` ON `user_game` (`user_id`,`category`);