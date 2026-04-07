import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../../drizzle/migrations/migrations';

const expoDb = SQLite.openDatabaseSync('personal_funds_tracker.db');
export const db = drizzle(expoDb, { schema });

const SAVINGS_LINKING_MIGRATION_CREATED_AT = 1772400000000;

export type DbExecutor = typeof db;
export type DbTransaction = Parameters<DbExecutor["transaction"]>[0] extends (tx: infer T) => unknown ? T : never;
export type DbClient = DbExecutor | DbTransaction;

function ensureMigrationsTableExists(): void {
  expoDb.runSync(`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at numeric
    )
  `);
}

function tableExists(tableName: string): boolean {
  const row = expoDb.getFirstSync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    tableName
  );

  return row !== null;
}

function columnExists(tableName: string, columnName: string): boolean {
  const rows = expoDb.getAllSync<{ name: string }>(`PRAGMA table_info("${tableName}")`);
  return rows.some((row) => row.name === columnName);
}

function hasSavingsLinkingMigrationRecord(): boolean {
  const row = expoDb.getFirstSync<{ created_at: number }>(
    `SELECT created_at FROM "__drizzle_migrations" WHERE created_at = ? LIMIT 1`,
    SAVINGS_LINKING_MIGRATION_CREATED_AT
  );

  return row !== null;
}

function repairPartialSavingsLinkingMigration(): void {
  ensureMigrationsTableExists();

  if (hasSavingsLinkingMigrationRecord()) {
    return;
  }

  const hasAvailableBalance = columnExists("accounts", "availableBalance");
  const hasTotalSaved = columnExists("savingGoals", "totalSaved");
  const hasAccountSavings = tableExists("accountSavings");
  const hasSavingTransactions = tableExists("savingTransactions");

  const migrationTouchedSchema =
    hasAvailableBalance || hasTotalSaved || hasAccountSavings || hasSavingTransactions;

  if (!migrationTouchedSchema) {
    return;
  }

  expoDb.withTransactionSync(() => {
    if (!hasAvailableBalance) {
      expoDb.runSync(`ALTER TABLE "accounts" ADD "availableBalance" real NOT NULL DEFAULT 0`);
    }

    if (!hasAccountSavings) {
      expoDb.runSync(`
        CREATE TABLE IF NOT EXISTS "accountSavings" (
          "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          "accountId" integer NOT NULL,
          "savingGoalId" integer NOT NULL,
          "balance" real NOT NULL DEFAULT 0,
          FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON UPDATE no action ON DELETE no action,
          FOREIGN KEY ("savingGoalId") REFERENCES "savingGoals"("id") ON UPDATE no action ON DELETE no action,
          CONSTRAINT "accountSavings_account_goal_unique" UNIQUE("accountId", "savingGoalId")
        )
      `);
    }

    if (!hasSavingTransactions) {
      expoDb.runSync(`
        CREATE TABLE IF NOT EXISTS "savingTransactions" (
          "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          "accountSavingId" integer NOT NULL,
          "sum" real NOT NULL,
          "date" text NOT NULL,
          FOREIGN KEY ("accountSavingId") REFERENCES "accountSavings"("id") ON UPDATE no action ON DELETE no action
        )
      `);
    }

    if (!hasTotalSaved) {
      expoDb.runSync(`ALTER TABLE "savingGoals" ADD "totalSaved" real NOT NULL DEFAULT 0`);
    }

    expoDb.runSync(`
      UPDATE "accounts"
      SET "availableBalance" = "balance" - COALESCE(
        (
          SELECT SUM("balance")
          FROM "accountSavings"
          WHERE "accountSavings"."accountId" = "accounts"."id"
        ),
        0
      )
    `);

    expoDb.runSync(`
      UPDATE "savingGoals"
      SET "totalSaved" = COALESCE(
        (
          SELECT SUM("balance")
          FROM "accountSavings"
          WHERE "accountSavings"."savingGoalId" = "savingGoals"."id"
        ),
        0
      )
    `);

    expoDb.runSync(
      `INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES (?, ?)`,
      "",
      SAVINGS_LINKING_MIGRATION_CREATED_AT
    );
  });
}

export async function runMigrations() {
  repairPartialSavingsLinkingMigration();
  await migrate(db, migrations);
}
