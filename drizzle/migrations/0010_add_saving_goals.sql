CREATE TABLE `savingGoals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`normalizedName` text NOT NULL,
	`currency` integer NOT NULL,
	`monthGoal` real NOT NULL,
	`totalGoal` real NOT NULL,
	CONSTRAINT `savingGoals_normalizedName_currency_unique` UNIQUE(`normalizedName`, `currency`)
);
