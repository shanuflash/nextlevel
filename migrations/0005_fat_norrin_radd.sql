PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_game` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`game_id` text NOT NULL,
	`igdb_id` integer,
	`category` text NOT NULL,
	`rating` real,
	`notes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_game`("id", "user_id", "game_id", "igdb_id", "category", "rating", "notes", "created_at", "updated_at") SELECT "id", "user_id", "game_id", "igdb_id", "category", "rating", "notes", "created_at", "updated_at" FROM `user_game`;--> statement-breakpoint
DROP TABLE `user_game`;--> statement-breakpoint
ALTER TABLE `__new_user_game` RENAME TO `user_game`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `userGame_userId_idx` ON `user_game` (`user_id`);--> statement-breakpoint
CREATE INDEX `userGame_gameId_idx` ON `user_game` (`game_id`);--> statement-breakpoint
CREATE INDEX `userGame_category_idx` ON `user_game` (`user_id`,`category`);