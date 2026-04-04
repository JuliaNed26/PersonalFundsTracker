import { getAccountByIdAsync, getAllAccountsAsync, updateAccountBalanceAsync } from "../db/Repositories/AccountRepositiory";
import {
    addAccountTransferTransactionAsync,
    deleteAccountTransferTransactionAsync,
    getAccountTransferTransactionsByAccountIdAsync,
} from "../db/Repositories/AccountTransactionsRepository";
import { AccountData } from "../models/data/AccountData";
import { AccountTransferData } from "../models/data/AccountTransferData";
import { AccountTransferListItem } from "../models/data/AccountTransferListItem";
import { Currency } from "../models/enums/Currency";

export async function addTransferTransactionAsync(
    transfer: AccountTransferData,
    sourceAccount: AccountData,
    targetAccount: AccountData
): Promise<void> {
    await addAccountTransferTransactionAsync(transfer);

    await updateAccountBalanceAsync(sourceAccount.id, sourceAccount.balance - transfer.sumSent);
    await updateAccountBalanceAsync(targetAccount.id, targetAccount.balance + transfer.sumReceived);
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

    await deleteAccountTransferTransactionAsync(transfer);
    await updateAccountBalanceAsync(sourceAccount.id, sourceAccount.balance + transfer.sumSent);
    await updateAccountBalanceAsync(targetAccount.id, targetAccount.balance - transfer.sumReceived);
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
