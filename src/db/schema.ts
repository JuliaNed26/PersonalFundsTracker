import { sqliteTable, text, integer, real, SQLiteBoolean } from 'drizzle-orm/sqlite-core';

export const incomes = sqliteTable('incomes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  currency: integer('currency').notNull(),
  balance: real('balance').notNull().default(0),
});

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  balance: real('balance').notNull().default(0),
  currency: integer('currency').notNull(),
  includeToTotalBalance: integer('includeToTotalBalance', {mode: 'boolean'}).notNull().default(true),
});

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull().unique(),
  limit: real('limit'),
});

export const incomeTransactions = sqliteTable('incomeTransactions', {
  accountId: integer('accountId')
    .notNull()
    .references(() => accounts.id),
  incomeId: integer('incomeId')
    .notNull()
    .references(() => incomes.id),
  sum: real('sum').notNull(),
  date: text('date').notNull(),
});

export const accountTransactions = sqliteTable('accountTransactions', {
  sourceAccountId: integer('sourceAccountId')
    .notNull()
    .references(() => accounts.id),
  targetAccountId: integer('targetAccountId')
    .notNull()
    .references(() => accounts.id),
  sumSent: real('sumSent').notNull(),
  sumReceived: real('sumReceived').notNull(),
  date: text('date').notNull(),
});

export const expenseTransactions = sqliteTable('expenseTransactions', {
  accountId: integer('accountId')
    .notNull()
    .references(() => accounts.id),
  expenseId: integer('expenseId')
    .notNull()
    .references(() => expenses.id),
  sumSent: real('sumSent').notNull(),
  sumReceived: real('sumReceived').notNull(),
  date: text('date').notNull(),
});

export type Income = typeof incomes.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
