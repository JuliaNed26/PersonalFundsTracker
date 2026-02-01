import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer, real, SQLiteBoolean, primaryKey } from 'drizzle-orm/sqlite-core';

export const incomes = sqliteTable('incomes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  currency: integer('currency').notNull()
});

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  balance: real('balance').notNull().default(0),
  currency: integer('currency').notNull(),
  includeToTotalBalance: integer('includeToTotalBalance', {mode: 'boolean'}).notNull().default(true),
});

export const expenses = sqliteTable('expenseTypes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
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
  currency: integer('currency').notNull(),
  date: text('date').notNull(),
  note: text('note')
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

export const exchangeRates = sqliteTable(
  'exchangeRates',
  {
    base: integer('base').notNull(),
    quote: integer('quote').notNull(),
    rate: real('rate').notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.base, table.quote] })
  })
);

export const incomesRelations = relations(incomes, ({ many }) => ({
  transactions: many(incomeTransactions)
}));

export const incomeTransactionsRelations = relations(incomeTransactions, ({ one }) => ({
  income: one(incomes, {
    fields: [incomeTransactions.incomeId],
    references: [incomes.id]
  })
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
  incomeTransactions: many(incomeTransactions)
}));

export const accountTransactionsRelations = relations(accountTransactions, ({ one }) => ({
  account: one(accounts, {
    fields: [accountTransactions.sourceAccountId],
    references: [accounts.id]
  })
}));

export type Income = typeof incomes.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
