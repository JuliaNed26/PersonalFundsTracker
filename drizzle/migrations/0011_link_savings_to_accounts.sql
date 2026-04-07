ALTER TABLE `accounts` ADD `availableBalance` real NOT NULL DEFAULT 0;
--> statement-breakpoint
UPDATE `accounts` SET `availableBalance` = `balance`;
--> statement-breakpoint
CREATE TABLE `accountSavings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`accountId` integer NOT NULL,
	`savingGoalId` integer NOT NULL,
	`balance` real NOT NULL DEFAULT 0,
	FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`savingGoalId`) REFERENCES `savingGoals`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT `accountSavings_account_goal_unique` UNIQUE(`accountId`, `savingGoalId`)
);
--> statement-breakpoint
CREATE TABLE `savingTransactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`accountSavingId` integer NOT NULL,
	`sum` real NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`accountSavingId`) REFERENCES `accountSavings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `savingGoals` ADD `totalSaved` real NOT NULL DEFAULT 0;
