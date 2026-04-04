import { db } from '../index';
import IncomeTransactionEntity from "../../models/entities/IncomeTransactionEntity";
import IncomeTransactionListItem from "../../models/data/IncomeTransactionListItem";
import { accounts, incomeTransactions, incomes } from '../schema';
import { and, desc, eq, isNull } from 'drizzle-orm';

export async function addIncomeTransaction(incomeTransaction: IncomeTransactionEntity) {
    const added = await db.insert(incomeTransactions).values({
        incomeId: incomeTransaction.incomeId,
        accountId: incomeTransaction.accountId,
        sum: incomeTransaction.sum,
        currency: incomeTransaction.currency,
        sumAddedToAccount: incomeTransaction.sumAddedToAccount,
        date: incomeTransaction.date,
        note: incomeTransaction.note
    }).returning();

    const row = Array.isArray(added) ? added[0] : added;
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
    const rows = await db
        .select({
            accountId: incomeTransactions.accountId,
            incomeId: incomeTransactions.incomeId,
            sum: incomeTransactions.sum,
            currency: incomeTransactions.currency,
            sumAddedToAccount: incomeTransactions.sumAddedToAccount,
            date: incomeTransactions.date,
            note: incomeTransactions.note,
            incomeName: incomes.name,
            accountCurrency: accounts.currency,
        })
        .from(incomeTransactions)
        .innerJoin(incomes, eq(incomeTransactions.incomeId, incomes.id))
        .innerJoin(accounts, eq(incomeTransactions.accountId, accounts.id))
        .where(eq(incomeTransactions.accountId, accountId))
        .orderBy(desc(incomeTransactions.date));

    return rows.map((row) => ({
        accountId: row.accountId,
        incomeId: row.incomeId,
        sum: row.sum,
        currency: row.currency,
        sumAddedToAccount: row.sumAddedToAccount ?? undefined,
        date: row.date,
        note: row.note ?? undefined,
        incomeName: row.incomeName,
        accountCurrency: row.accountCurrency,
    }));
}

export async function updateIncomeTransactionNoteAsync(
    transaction: IncomeTransactionEntity,
    note?: string
): Promise<void> {
    await db.update(incomeTransactions)
        .set({ note })
        .where(buildTransactionIdentityCondition(transaction));
}

export async function deleteIncomeTransactionAsync(transaction: IncomeTransactionEntity): Promise<void> {
    await db.delete(incomeTransactions).where(buildTransactionIdentityCondition(transaction));
}
