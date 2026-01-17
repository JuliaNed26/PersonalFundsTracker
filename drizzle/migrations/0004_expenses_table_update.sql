ALTER TABLE `expenses` RENAME TO `expenseTypes`;--> statement-breakpoint
ALTER TABLE `expenseTypes` RENAME COLUMN "type" TO "name";--> statement-breakpoint
DROP INDEX `expenses_type_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `expenseTypes_name_unique` ON `expenseTypes` (`name`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_expenseTransactions` (
	`accountId` integer NOT NULL,
	`expenseId` integer NOT NULL,
	`sumSent` real NOT NULL,
	`sumReceived` real NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`expenseId`) REFERENCES `expenseTypes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_expenseTransactions`("accountId", "expenseId", "sumSent", "sumReceived", "date") SELECT "accountId", "expenseId", "sumSent", "sumReceived", "date" FROM `expenseTransactions`;--> statement-breakpoint
DROP TABLE `expenseTransactions`;--> statement-breakpoint
ALTER TABLE `__new_expenseTransactions` RENAME TO `expenseTransactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;