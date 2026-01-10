CREATE TABLE `exchangeRates` (
	`base` integer NOT NULL,
	`quote` integer NOT NULL,
	`rate` real NOT NULL,
	PRIMARY KEY(`base`, `quote`)
);
