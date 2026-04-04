import { and, desc, eq, or } from "drizzle-orm";
import { db } from "../index";
import { accountTransactions } from "../schema";
import { AccountTransferData } from "../../models/data/AccountTransferData";

export async function addAccountTransferTransactionAsync(
    transfer: AccountTransferData
): Promise<void> {
    await db.insert(accountTransactions).values({
        sourceAccountId: transfer.sourceAccountId,
        targetAccountId: transfer.targetAccountId,
        sumSent: transfer.sumSent,
        sumReceived: transfer.sumReceived,
        date: transfer.date,
    });
}

function buildTransferIdentityCondition(transfer: AccountTransferData) {
    return and(
        eq(accountTransactions.sourceAccountId, transfer.sourceAccountId),
        eq(accountTransactions.targetAccountId, transfer.targetAccountId),
        eq(accountTransactions.sumSent, transfer.sumSent),
        eq(accountTransactions.sumReceived, transfer.sumReceived),
        eq(accountTransactions.date, transfer.date)
    );
}

export async function getAccountTransferTransactionsByAccountIdAsync(
    accountId: number
): Promise<AccountTransferData[]> {
    const rows = await db
        .select({
            sourceAccountId: accountTransactions.sourceAccountId,
            targetAccountId: accountTransactions.targetAccountId,
            sumSent: accountTransactions.sumSent,
            sumReceived: accountTransactions.sumReceived,
            date: accountTransactions.date,
        })
        .from(accountTransactions)
        .where(
            or(
                eq(accountTransactions.sourceAccountId, accountId),
                eq(accountTransactions.targetAccountId, accountId)
            )
        )
        .orderBy(desc(accountTransactions.date));

    return rows.map((row) => ({
        sourceAccountId: row.sourceAccountId,
        targetAccountId: row.targetAccountId,
        sumSent: row.sumSent,
        sumReceived: row.sumReceived,
        date: row.date,
    }));
}

export async function deleteAccountTransferTransactionAsync(
    transfer: AccountTransferData
): Promise<void> {
    await db.delete(accountTransactions).where(buildTransferIdentityCondition(transfer));
}
