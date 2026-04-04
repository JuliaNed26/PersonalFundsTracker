import { updateAccountBalanceAsync } from "../db/Repositories/AccountRepositiory";
import {
    addExpenseTransactionAsync as addExpenseTransactionToDbAsync,
    deleteExpenseTransactionAsync as deleteExpenseTransactionFromDbAsync,
    getAllExpenseTransactionsForAnalyticsAsync as getAllExpenseTransactionsForAnalyticsFromDbAsync,
    getExpenseBalancesByExpenseIdAsync,
    getExpenseTransactionsByAccountIdAsync,
    getExpenseTransactionsByExpenseIdAsync,
    updateExpenseTransactionNoteAsync as updateExpenseTransactionNoteInDbAsync,
} from "../db/Repositories/ExpenseTransactionsRepository";
import type { ExpenseTransactionTrendRow } from "../db/Repositories/ExpenseTransactionsRepository";
import { AccountData } from "../models/data/AccountData";
import ExpenseTransactionData from "../models/data/ExpenseTransactionData";
import ExpenseTransactionListItem from "../models/data/ExpenseTransactionListItem";
import { getAccountAsync } from "./AccountService";

export async function addExpenseTransactionAsync(
    transaction: ExpenseTransactionData,
    account: AccountData
): Promise<void> {
    await addExpenseTransactionToDbAsync(transaction);
    await updateAccountBalanceAsync(account.id, account.balance - transaction.sumSent);
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
    const account = await getAccountAsync(transaction.accountId);
    await deleteExpenseTransactionFromDbAsync(transaction);
    await updateAccountBalanceAsync(transaction.accountId, account.balance + transaction.sumSent);
}

export async function getExpenseBalancesAsync(): Promise<Record<number, number>> {
    return await getExpenseBalancesByExpenseIdAsync();
}

export async function getAllExpenseTransactionsForAnalyticsAsync(): Promise<ExpenseTransactionTrendRow[]> {
    return await getAllExpenseTransactionsForAnalyticsFromDbAsync();
}
