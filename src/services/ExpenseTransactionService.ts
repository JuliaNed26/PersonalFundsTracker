import { db } from "../db";
import { getAccountById, updateAccountBalances } from "../db/Repositories/AccountRepositiory";
import {
    addExpenseTransaction,
    deleteExpenseTransaction,
    getAllExpenseTransactionsForAnalyticsAsync as getAllExpenseTransactionsForAnalyticsFromDbAsync,
    getExpenseBalancesByExpenseIdAsync,
    getExpenseTransactionsByAccountIdAsync,
    getExpenseTransactionsByExpenseIdAsync,
    updateExpenseTransactionNoteAsync as updateExpenseTransactionNoteInDbAsync,
} from "../db/Repositories/ExpenseTransactionsRepository";
import type { ExpenseTransactionEntity } from "../db/Repositories/ExpenseTransactionsRepository";
import { AccountData } from "../models/data/AccountData";
import ExpenseTransactionData from "../models/data/ExpenseTransactionData";
import ExpenseTransactionListItem from "../models/data/ExpenseTransactionListItem";

export async function addExpenseTransactionAsync(
    transaction: ExpenseTransactionData,
    _account: AccountData
): Promise<void> {
    db.transaction((tx) => {
        const account = getAccountById(transaction.accountId, tx);
        if (!account) {
            throw new Error(`Account with id ${transaction.accountId} not found`);
        }

        if (account.availableBalance < transaction.sumSent) {
            throw new Error("Insufficient available balance");
        }

        addExpenseTransaction(transaction, tx);
        updateAccountBalances(
            account.id,
            account.balance - transaction.sumSent,
            account.availableBalance - transaction.sumSent,
            tx
        );
    });
}

export async function getExpenseTransactionsForAccountAsync(
    accountId: number
): Promise<ExpenseTransactionListItem[]> {
    return await getExpenseTransactionsByAccountIdAsync(accountId);
}

export async function getExpenseTransactionsForExpenseAsync(
    expenseId: number
): Promise<ExpenseTransactionListItem[]> {
    return await getExpenseTransactionsByExpenseIdAsync(expenseId);
}

export async function updateExpenseTransactionNoteAsync(
    transaction: ExpenseTransactionData,
    note?: string
): Promise<void> {
    await updateExpenseTransactionNoteInDbAsync(transaction, note);
}

export async function deleteExpenseTransactionAsync(
    transaction: ExpenseTransactionData
): Promise<void> {
    db.transaction((tx) => {
        const account = getAccountById(transaction.accountId, tx);
        if (!account) {
            throw new Error(`Account with id ${transaction.accountId} not found`);
        }

        deleteExpenseTransaction(transaction, tx);
        updateAccountBalances(
            account.id,
            account.balance + transaction.sumSent,
            account.availableBalance + transaction.sumSent,
            tx
        );
    });
}

export async function getExpenseBalancesAsync(): Promise<Record<number, number>> {
    return await getExpenseBalancesByExpenseIdAsync();
}

export async function getAllExpenseTransactionsForAnalyticsAsync(): Promise<ExpenseTransactionEntity[]> {
    return await getAllExpenseTransactionsForAnalyticsFromDbAsync();
}
