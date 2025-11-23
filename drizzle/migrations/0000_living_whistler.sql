CREATE TABLE `accountTransactions` (
	`sourceAccountId` integer NOT NULL,
	`targetAccountId` integer NOT NULL,
	`sumSent` real NOT NULL,
	`sumReceived` real NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`sourceAccountId`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`targetAccountId`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`currency` integer NOT NULL,
	`includeToTotalBalance` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_name_unique` ON `accounts` (`name`);--> statement-breakpoint
CREATE TABLE `expenseTransactions` (
	`accountId` integer NOT NULL,
	`expenseId` integer NOT NULL,
	`sumSent` real NOT NULL,
	`sumReceived` real NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`expenseId`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`limit` real
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expenses_type_unique` ON `expenses` (`type`);--> statement-breakpoint
CREATE TABLE `incomeTransactions` (
	`accountId` integer NOT NULL,
	`incomeId` integer NOT NULL,
	`sum` real NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`incomeId`) REFERENCES `incomes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `incomes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`currency` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `incomes_name_unique` ON `incomes` (`name`);