import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { db } from "../index";
import { accounts, expenseTransactions, expenses } from "../schema";
import ExpenseTransactionData from "../../models/data/ExpenseTransactionData";
import ExpenseTransactionListItem from "../../models/data/ExpenseTransactionListItem";
import { getCurrentMonthDateRange } from "../../services/DateService";

export interface ExpenseTransactionTrendRow {
    expenseId: number;
    expenseName: string;
    sumReceived: number;
    date: string;
}

export async function addExpenseTransactionAsync(
    transaction: ExpenseTransactionData
): Promise<void> {
    await db.insert(expenseTransactions).values({
        accountId: transaction.accountId,
        expenseId: transaction.expenseId,
        sumSent: transaction.sumSent,
        sumReceived: transaction.sumReceived,
        date: transaction.date,
        note: transaction.note,
    });
}

function buildExpenseTransactionIdentityCondition(transaction: ExpenseTransactionData) {
    const conditions = [
        eq(expenseTransactions.accountId, transaction.accountId),
        eq(expenseTransactions.expenseId, transaction.expenseId),
        eq(expenseTransactions.sumSent, transaction.sumSent),
        eq(expenseTransactions.sumReceived, transaction.sumReceived),
        eq(expenseTransactions.date, transaction.date),
    ];

    if (transaction.note === undefined || transaction.note === null) {
        conditions.push(isNull(expenseTransactions.note));
    } else {
        conditions.push(eq(expenseTransactions.note, transaction.note));
    }

    return and(...conditions);
}

export async function getExpenseTransactionsByAccountIdAsync(
    accountId: number
): Promise<ExpenseTransactionListItem[]> {
    const rows = await db
        .select({
            accountId: expenseTransactions.accountId,
            expenseId: expenseTransactions.expenseId,
            sumSent: expenseTransactions.sumSent,
            sumReceived: expenseTransactions.sumReceived,
            date: expenseTransactions.date,
            note: expenseTransactions.note,
            accountName: accounts.name,
            expenseName: expenses.name,
            accountCurrency: accounts.currency,
        })
        .from(expenseTransactions)
        .innerJoin(accounts, eq(expenseTransactions.accountId, accounts.id))
        .innerJoin(expenses, eq(expenseTransactions.expenseId, expenses.id))
        .where(eq(expenseTransactions.accountId, accountId))
        .orderBy(desc(expenseTransactions.date));

    return rows.map((row) => ({
        accountId: row.accountId,
        expenseId: row.expenseId,
        sumSent: row.sumSent,
        sumReceived: row.sumReceived,
        date: row.date,
        note: row.note ?? undefined,
        accountName: row.accountName,
        expenseName: row.expenseName,
        accountCurrency: row.accountCurrency,
    }));
}

export async function getExpenseTransactionsByExpenseIdAsync(
    expenseId: number
): Promise<ExpenseTransactionListItem[]> {
    const rows = await db
        .select({
            accountId: expenseTransactions.accountId,
            expenseId: expenseTransactions.expenseId,
            sumSent: expenseTransactions.sumSent,
            sumReceived: expenseTransactions.sumReceived,
            date: expenseTransactions.date,
            note: expenseTransactions.note,
            accountName: accounts.name,
            expenseName: expenses.name,
            accountCurrency: accounts.currency,
        })
        .from(expenseTransactions)
        .innerJoin(accounts, eq(expenseTransactions.accountId, accounts.id))
        .innerJoin(expenses, eq(expenseTransactions.expenseId, expenses.id))
        .where(eq(expenseTransactions.expenseId, expenseId))
        .orderBy(desc(expenseTransactions.date));

    return rows.map((row) => ({
        accountId: row.accountId,
        expenseId: row.expenseId,
        sumSent: row.sumSent,
        sumReceived: row.sumReceived,
        date: row.date,
        note: row.note ?? undefined,
        accountName: row.accountName,
        expenseName: row.expenseName,
        accountCurrency: row.accountCurrency,
    }));
}

export async function updateExpenseTransactionNoteAsync(
    transaction: ExpenseTransactionData,
    note?: string
): Promise<void> {
    await db.update(expenseTransactions)
        .set({ note })
        .where(buildExpenseTransactionIdentityCondition(transaction));
}

export async function deleteExpenseTransactionAsync(
    transaction: ExpenseTransactionData
): Promise<void> {
    await db.delete(expenseTransactions)
        .where(buildExpenseTransactionIdentityCondition(transaction));
}

export async function getExpenseBalancesByExpenseIdAsync(): Promise<Record<number, number>> {
    const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();

    const rows = await db
        .select({
            expenseId: expenseTransactions.expenseId,
            sumReceived: expenseTransactions.sumReceived,
        })
        .from(expenseTransactions)
        .where(
            and(
                gte(expenseTransactions.date, startOfMonth),
                lte(expenseTransactions.date, endOfMonth)
            )
        );

    return rows.reduce((balances, row) => {
        balances[row.expenseId] = (balances[row.expenseId] ?? 0) + row.sumReceived;
        return balances;
    }, {} as Record<number, number>);
}

export async function getAllExpenseTransactionsForAnalyticsAsync(): Promise<ExpenseTransactionTrendRow[]> {
    const rows = await db
        .select({
            expenseId: expenseTransactions.expenseId,
            expenseName: expenses.name,
            sumReceived: expenseTransactions.sumReceived,
            date: expenseTransactions.date,
        })
        .from(expenseTransactions)
        .innerJoin(expenses, eq(expenseTransactions.expenseId, expenses.id))
        .orderBy(desc(expenseTransactions.date));

    return rows.map((row) => ({
        expenseId: row.expenseId,
        expenseName: row.expenseName,
        sumReceived: row.sumReceived,
        date: row.date,
    }));
}
