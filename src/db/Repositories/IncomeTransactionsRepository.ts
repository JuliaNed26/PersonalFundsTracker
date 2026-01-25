import { db } from '../index';
import IncomeTransactionEntity from "../../models/entities/IncomeTransactionEntity";
import { incomeTransactions } from '../schema';

export async function addIncomeTransaction(incomeTransaction: IncomeTransactionEntity) {
    const added = await db.insert(incomeTransactions).values({
        incomeId: incomeTransaction.incomeId,
        accountId: incomeTransaction.accountId,
        sum: incomeTransaction.sum,
        date: incomeTransaction.date,
        note: incomeTransaction.note
    }).returning();

    const row = Array.isArray(added) ? added[0] : added;
    return row as IncomeTransactionEntity;
}