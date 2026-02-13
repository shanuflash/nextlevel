ALTER TABLE `user` ADD `display_username` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_display_username_unique` ON `user` (`display_username`);