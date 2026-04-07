import { db, type DbClient } from '../index';
import IncomeTransactionEntity from "../../models/entities/IncomeTransactionEntity";
import IncomeTransactionListItem from "../../models/data/IncomeTransactionListItem";
import { accounts, incomeTransactions, incomes } from '../schema';
import { and, desc, eq, isNull } from 'drizzle-orm';

function getExecutor(executor: DbClient = db): DbClient {
    return executor;
}

export function addIncomeTransaction(
    incomeTransaction: IncomeTransactionEntity,
    executor: DbClient = db
) {
    const row = getExecutor(executor).insert(incomeTransactions).values({
        incomeId: incomeTransaction.incomeId,
        accountId: incomeTransaction.accountId,
        sum: incomeTransaction.sum,
        currency: incomeTransaction.currency,
        sumAddedToAccount: incomeTransaction.sumAddedToAccount,
        date: incomeTransaction.date,
        note: incomeTransaction.note
    }).returning().get();
    return row as IncomeTransactionEntity;
}

function buildTransactionIdentityCondition(transaction: IncomeTransactionEntity) {
    const conditions = [
        eq(incomeTransactions.incomeId, transaction.incomeId),
        eq(incomeTransactions.accountId, transaction.accountId),
        eq(incomeTransactions.sum, transaction.sum),
        eq(incomeTransactions.currency, transaction.currency),
        transaction.sumAddedToAccount === undefined || transaction.sumAddedToAccount === null
            ? isNull(incomeTransactions.sumAddedToAccount)
            : eq(incomeTransactions.sumAddedToAccount, transaction.sumAddedToAccount),
        eq(incomeTransactions.date, transaction.date),
    ];

    if (transaction.note === undefined || transaction.note === null) {
        conditions.push(isNull(incomeTransactions.note));
    } else {
        conditions.push(eq(incomeTransactions.note, transaction.note));
    }

    return and(...conditions);
}

export async function getIncomeTransactionsByAccountIdAsync(accountId: number): Promise<IncomeTransactionListItem[]> {
    const rows = db
        .select({
            accountId: incomeTransactions.accountId,
            incomeId: incomeTransactions.incomeId,
            sum: incomeTransactions.sum,
            currency: incomeTransactions.currency,
            sumAddedToAccount: incomeTransactions.sumAddedToAccount,
            date: incomeTransactions.date,
            note: incomeTransactions.note,
            incomeName: incomes.name,
            accountName: accounts.name,
            accountCurrency: accounts.currency,
        })
        .from(incomeTransactions)
        .innerJoin(incomes, eq(incomeTransactions.incomeId, incomes.id))
        .innerJoin(accounts, eq(incomeTransactions.accountId, accounts.id))
        .where(eq(incomeTransactions.accountId, accountId))
        .orderBy(desc(incomeTransactions.date))
        .all();

    return rows.map((row) => ({
        accountId: row.accountId,
        incomeId: row.incomeId,
        sum: row.sum,
        currency: row.currency,
        sumAddedToAccount: row.sumAddedToAccount ?? undefined,
        date: row.date,
        note: row.note ?? undefined,
        incomeName: row.incomeName,
        accountName: row.accountName,
        accountCurrency: row.accountCurrency,
    }));
}

export async function getIncomeTransactionsByIncomeIdAsync(incomeId: number): Promise<IncomeTransactionListItem[]> {
    const rows = db
        .select({
            accountId: incomeTransactions.accountId,
            incomeId: incomeTransactions.incomeId,
            sum: incomeTransactions.sum,
            currency: incomeTransactions.currency,
            sumAddedToAccount: incomeTransactions.sumAddedToAccount,
            date: incomeTransactions.date,
            note: incomeTransactions.note,
            incomeName: incomes.name,
            accountName: accounts.name,
            accountCurrency: accounts.currency,
        })
        .from(incomeTransactions)
        .innerJoin(incomes, eq(incomeTransactions.incomeId, incomes.id))
        .innerJoin(accounts, eq(incomeTransactions.accountId, accounts.id))
        .where(eq(incomeTransactions.incomeId, incomeId))
        .orderBy(desc(incomeTransactions.date))
        .all();

    return rows.map((row) => ({
        accountId: row.accountId,
        incomeId: row.incomeId,
        sum: row.sum,
        currency: row.currency,
        sumAddedToAccount: row.sumAddedToAccount ?? undefined,
        date: row.date,
        note: row.note ?? undefined,
        incomeName: row.incomeName,
        accountName: row.accountName,
        accountCurrency: row.accountCurrency,
    }));
}

export async function updateIncomeTransactionNoteAsync(
    transaction: IncomeTransactionEntity,
    note?: string
): Promise<void> {
    db.update(incomeTransactions)
        .set({ note })
        .where(buildTransactionIdentityCondition(transaction))
        .run();
}

export function deleteIncomeTransaction(
    transaction: IncomeTransactionEntity,
    executor: DbClient = db
): void {
    getExecutor(executor).delete(incomeTransactions).where(buildTransactionIdentityCondition(transaction)).run();
}

export async function deleteIncomeTransactionAsync(transaction: IncomeTransactionEntity): Promise<void> {
    deleteIncomeTransaction(transaction);
}
