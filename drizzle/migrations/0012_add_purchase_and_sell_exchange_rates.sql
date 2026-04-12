ALTER TABLE `exchangeRates` ADD `purchaseRate` real NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `exchangeRates` ADD `sellRate` real NOT NULL DEFAULT 0;
--> statement-breakpoint
DELETE FROM `exchangeRates`
WHERE `base` <> 0 AND `quote` <> 0;
--> statement-breakpoint
UPDATE `exchangeRates`
SET `purchaseRate` = `rate`,
    `sellRate` = `rate`
WHERE `purchaseRate` = 0 AND `sellRate` = 0;
