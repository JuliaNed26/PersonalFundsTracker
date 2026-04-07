import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { db, type DbClient } from "../index";
import { accountSavings, savingTransactions, type SavingTransaction } from "../schema";
import SavingTransactionEntity from "../../models/entities/SavingTransactionEntity";
import { getCurrentMonthDateRange } from "../../services/DateService";

function getExecutor(executor: DbClient = db): DbClient {
    return executor;
}

function mapSavingTransactionToEntity(transaction: SavingTransaction): SavingTransactionEntity {
    return {
        id: transaction.id,
        accountSavingId: transaction.accountSavingId,
        sum: transaction.sum,
        date: transaction.date,
    } as SavingTransactionEntity;
}

export function insertSavingTransaction(
    accountSavingId: number,
    sum: number,
    date: string,
    executor: DbClient = db
): SavingTransactionEntity {
    const row = getExecutor(executor)
        .insert(savingTransactions)
        .values({
            accountSavingId,
            sum,
            date,
        })
        .returning()
        .get();
    return mapSavingTransactionToEntity(row as SavingTransaction);
}

export function getSavingTransactionsForAccountSaving(
    accountSavingId: number,
    executor: DbClient = db
): SavingTransactionEntity[] {
    const rows = getExecutor(executor)
        .select()
        .from(savingTransactions)
        .where(eq(savingTransactions.accountSavingId, accountSavingId))
        .all() as SavingTransaction[];

    return rows.map(mapSavingTransactionToEntity);
}

export function getCurrentMonthSavingTotalsByAccountSavingIds(
    accountSavingIds: number[],
    executor: DbClient = db
): Record<number, number> {
    if (accountSavingIds.length === 0) {
        return {};
    }

    const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();
    const rows = getExecutor(executor)
        .select({
            accountSavingId: savingTransactions.accountSavingId,
            sum: savingTransactions.sum,
        })
        .from(savingTransactions)
        .where(
            and(
                inArray(savingTransactions.accountSavingId, accountSavingIds),
                gte(savingTransactions.date, startOfMonth),
                lte(savingTransactions.date, endOfMonth)
            )
        )
        .all();

    return rows.reduce((totals, row) => {
        totals[row.accountSavingId] = (totals[row.accountSavingId] ?? 0) + row.sum;
        return totals;
    }, {} as Record<number, number>);
}

export function getCurrentMonthSavingTotalsByGoalIds(
    savingGoalIds: number[],
    executor: DbClient = db
): Record<number, number> {
    if (savingGoalIds.length === 0) {
        return {};
    }

    const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();
    const rows = getExecutor(executor)
        .select({
            savingGoalId: accountSavings.savingGoalId,
            sum: savingTransactions.sum,
        })
        .from(savingTransactions)
        .innerJoin(accountSavings, eq(savingTransactions.accountSavingId, accountSavings.id))
        .where(
            and(
                inArray(accountSavings.savingGoalId, savingGoalIds),
                gte(savingTransactions.date, startOfMonth),
                lte(savingTransactions.date, endOfMonth)
            )
        )
        .all();

    return rows.reduce((totals, row) => {
        totals[row.savingGoalId] = (totals[row.savingGoalId] ?? 0) + row.sum;
        return totals;
    }, {} as Record<number, number>);
}

export function deleteSavingTransactionsByAccountSavingId(
    accountSavingId: number,
    executor: DbClient = db
): void {
    getExecutor(executor)
        .delete(savingTransactions)
        .where(eq(savingTransactions.accountSavingId, accountSavingId))
        .run();
}

export function deleteSavingTransactionsByGoalId(
    savingGoalId: number,
    executor: DbClient = db
): void {
    const linkedSavings = getExecutor(executor)
        .select({ id: accountSavings.id })
        .from(accountSavings)
        .where(eq(accountSavings.savingGoalId, savingGoalId))
        .all();

    const accountSavingIds = linkedSavings.map((item) => item.id);
    if (accountSavingIds.length === 0) {
        return;
    }

    getExecutor(executor)
        .delete(savingTransactions)
        .where(inArray(savingTransactions.accountSavingId, accountSavingIds))
        .run();
}
