CREATE TABLE `game` (
	`id` text PRIMARY KEY NOT NULL,
	`igdb_id` integer NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`cover_image_id` text,
	`genres` text,
	`platforms` text,
	`release_date` text,
	`summary` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_igdb_id_unique` ON `game` (`igdb_id`);--> statement-breakpoint
CREATE INDEX `game_igdbId_idx` ON `game` (`igdb_id`);--> statement-breakpoint
CREATE TABLE `user_game` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`game_id` text NOT NULL,
	`category` text NOT NULL,
	`rating` real,
	`notes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `userGame_userId_idx` ON `user_game` (`user_id`);--> statement-breakpoint
CREATE INDEX `userGame_gameId_idx` ON `user_game` (`game_id`);--> statement-breakpoint
CREATE INDEX `userGame_category_idx` ON `user_game` (`user_id`,`category`);--> statement-breakpoint
ALTER TABLE `user` ADD `username` text;--> statement-breakpoint
ALTER TABLE `user` ADD `bio` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE INDEX `user_username_idx` ON `user` (`username`);