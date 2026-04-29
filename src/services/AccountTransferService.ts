import { db } from "../db";
import { getAccountById, getAccountByIdAsync, getAllAccountsAsync, updateAccountBalances } from "../db/repositories/AccountRepositiory";
import {
    addAccountTransferTransaction,
    addAccountTransferTransactionAsync,
    deleteAccountTransferTransaction,
    deleteAccountTransferTransactionAsync,
    getAccountTransferTransactionsByAccountIdAsync,
} from "../db/repositories/AccountTransactionsRepository";
import { AccountData } from "../models/data/AccountData";
import { AccountTransferData } from "../models/data/AccountTransferData";
import { AccountTransferListItem } from "../models/data/AccountTransferListItem";
import { Currency } from "../models/enums/Currency";

export async function addTransferTransactionAsync(
    transfer: AccountTransferData,
    _sourceAccount: AccountData,
    _targetAccount: AccountData
): Promise<void> {
    db.transaction((tx) => {
        const sourceAccount = getAccountById(transfer.sourceAccountId, tx);
        const targetAccount = getAccountById(transfer.targetAccountId, tx);

        if (!sourceAccount || !targetAccount) {
            throw new Error("Failed to create transfer transaction: account not found");
        }

        if (sourceAccount.availableBalance < transfer.sumSent) {
            throw new Error("Insufficient available balance");
        }

        addAccountTransferTransaction(transfer, tx);
        updateAccountBalances(
            sourceAccount.id,
            sourceAccount.balance - transfer.sumSent,
            sourceAccount.availableBalance - transfer.sumSent,
            tx
        );
        updateAccountBalances(
            targetAccount.id,
            targetAccount.balance + transfer.sumReceived,
            targetAccount.availableBalance + transfer.sumReceived,
            tx
        );
    });
}

export async function deleteTransferTransactionAsync(
    transfer: AccountTransferData
): Promise<void> {
    const [sourceAccount, targetAccount] = await Promise.all([
        getAccountByIdAsync(transfer.sourceAccountId),
        getAccountByIdAsync(transfer.targetAccountId),
    ]);

    if (!sourceAccount || !targetAccount) {
        throw new Error("Failed to delete transfer transaction: account not found");
    }

    db.transaction((tx) => {
        deleteAccountTransferTransaction(transfer, tx);
        updateAccountBalances(
            sourceAccount.id,
            sourceAccount.balance + transfer.sumSent,
            sourceAccount.availableBalance + transfer.sumSent,
            tx
        );
        updateAccountBalances(
            targetAccount.id,
            targetAccount.balance - transfer.sumReceived,
            targetAccount.availableBalance - transfer.sumReceived,
            tx
        );
    });
}

export async function getTransferTransactionsForAccountAsync(
    accountId: number
): Promise<AccountTransferListItem[]> {
    const [transfers, accounts] = await Promise.all([
        getAccountTransferTransactionsByAccountIdAsync(accountId),
        getAllAccountsAsync(),
    ]);

    const accountsMap = new Map(accounts.map((account) => [account.id, account]));
    const currentAccountCurrency = accountsMap.get(accountId)?.currency ?? Currency.UAH;

    return transfers.map((transfer) => {
        const isOutgoing = transfer.sourceAccountId === accountId;
        const counterpartAccountId = isOutgoing ? transfer.targetAccountId : transfer.sourceAccountId;
        const counterpartAccountName =
            accountsMap.get(counterpartAccountId)?.name ?? `Account #${counterpartAccountId}`;

        return {
            ...transfer,
            isOutgoing,
            counterpartAccountName,
            accountCurrency: currentAccountCurrency,
            sumForAccount: isOutgoing ? -transfer.sumSent : transfer.sumReceived,
        };
    });
}
