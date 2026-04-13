import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { db, type DbClient } from "../index";
import { accounts, expenseTransactions, expenses } from "../schema";
import ExpenseTransactionData from "../../models/data/ExpenseTransactionData";
import ExpenseTransactionListItem from "../../models/data/ExpenseTransactionListItem";
import { getCurrentMonthDateRange } from "../../services/DateService";
import { ExpenseTransactionEntity } from "../../models/entities/ExpenseTransactionEntity";
import { ExpenseTypeTotalSpendingEntity } from "../../models/entities/ExpenseTypeTotalSpendingEntity";


function getExecutor(executor: DbClient = db): DbClient {
    return executor;
}

export function addExpenseTransaction(
    transaction: ExpenseTransactionData
,
    executor: DbClient = db
): void {
    getExecutor(executor).insert(expenseTransactions).values({
        accountId: transaction.accountId,
        expenseId: transaction.expenseId,
        sumSent: transaction.sumSent,
        sumReceived: transaction.sumReceived,
        date: transaction.date,
        note: transaction.note,
    }).run();
}

export async function addExpenseTransactionAsync(
    transaction: ExpenseTransactionData
): Promise<void> {
    addExpenseTransaction(transaction);
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
    const rows = db
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
        .orderBy(desc(expenseTransactions.date))
        .all();

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
    const rows = db
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
        .orderBy(desc(expenseTransactions.date))
        .all();

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
    db.update(expenseTransactions)
        .set({ note })
        .where(buildExpenseTransactionIdentityCondition(transaction))
        .run();
}

export function deleteExpenseTransaction(
    transaction: ExpenseTransactionData
,
    executor: DbClient = db
): void {
    getExecutor(executor).delete(expenseTransactions)
        .where(buildExpenseTransactionIdentityCondition(transaction))
        .run();
}

export async function deleteExpenseTransactionAsync(
    transaction: ExpenseTransactionData
): Promise<void> {
    deleteExpenseTransaction(transaction);
}

export async function getExpenseBalancesByExpenseIdAsync(): Promise<Record<number, number>> {
    const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();

    const rows = db
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
        )
        .all();

    return rows.reduce((balances, row) => {
        balances[row.expenseId] = (balances[row.expenseId] ?? 0) + row.sumReceived;
        return balances;
    }, {} as Record<number, number>);
}

export async function getAllExpenseTransactionsForAnalyticsAsync(): Promise<ExpenseTransactionEntity[]> {
    const rows = db
        .select({
            expenseId: expenseTransactions.expenseId,
            expenseName: expenses.name,
            sumReceived: expenseTransactions.sumReceived,
            date: expenseTransactions.date,
        })
        .from(expenseTransactions)
        .innerJoin(expenses, eq(expenseTransactions.expenseId, expenses.id))
        .orderBy(desc(expenseTransactions.date))
        .all();

    return rows.map((row) => ({
        expenseId: row.expenseId,
        expenseName: row.expenseName,
        sumReceived: row.sumReceived,
        date: row.date,
    }));
}

export async function getExpenseTotalForDateRangeAsync(
    startDate: string,
    endDate: string
): Promise<number> {
    const rows = db
        .select({ sumReceived: expenseTransactions.sumReceived })
        .from(expenseTransactions)
        .where(
            and(
                gte(expenseTransactions.date, startDate),
                lte(expenseTransactions.date, endDate)
            )
        )
        .all();

    return rows.reduce((total, row) => total + row.sumReceived, 0);
}

export async function getExpenseTotalsByTypeForDateRangeAsync(
    startDate: string,
    endDate: string
): Promise<ExpenseTypeTotalSpendingEntity[]> {
    const rows = db
        .select({
            expenseId: expenseTransactions.expenseId,
            expenseName: expenses.name,
            sumReceived: expenseTransactions.sumReceived,
        })
        .from(expenseTransactions)
        .innerJoin(expenses, eq(expenseTransactions.expenseId, expenses.id))
        .where(
            and(
                gte(expenseTransactions.date, startDate),
                lte(expenseTransactions.date, endDate)
            )
        )
        .all();

    const map = new Map<number, ExpenseTypeTotalSpendingEntity>();
    for (const row of rows) {
        const existing = map.get(row.expenseId);
        if (existing) {
            existing.sumReceived += row.sumReceived;
        } else {
            map.set(row.expenseId, {
                expenseId: row.expenseId,
                expenseName: row.expenseName,
                sumReceived: row.sumReceived,
            });
        }
    }
    return Array.from(map.values());
}
