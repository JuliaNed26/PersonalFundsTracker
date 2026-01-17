PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`currency` integer NOT NULL,
	`includeToTotalBalance` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_accounts`("id", "name", "balance", "currency", "includeToTotalBalance") SELECT "id", "name", "balance", "currency", "includeToTotalBalance" FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_name_unique` ON `accounts` (`name`);