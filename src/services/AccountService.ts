import { 
    deleteAccount,
    getAccountById,
    getAllAccounts,
    insertAccount,
    getAccountByIdAsync, 
    getAllAccountsAsync, 
    insertAccountAsync, 
    updateAccountAsync as updateAccountInDbAsync,
    updateAccount,
} from "../db/repositories/AccountRepositiory";
import { AccountEntity } from "../models/entities/AccountEntity";
import { AccountData } from "../models/data/AccountData";
import { AccountListData } from "../models/data/AccountListData";
import { getDefaultCurrencySetting } from "./async-storage/AsyncStorageService";
import { mapAccountDataToAccountEntity, mapAccountEntityToAccountData, mapAccountUpdateDataToAccountUpdateEntity } from "./MapService";
import AccountUpdateData from "../models/data/AccountUpdateData";
import { db } from "../db";
import { deleteAccountSavingsByAccountId, getAccountSavingsByAccountId } from "../db/repositories/AccountSavingsRepository";
import { deleteSavingTransactionsByAccountSavingId } from "../db/repositories/SavingTransactionsRepository";
import { getSavingGoalById, updateSavingGoalTotalSaved } from "../db/repositories/SavingGoalsRepository";
import { convertSumToCurrencyAsync } from "./ExchangeRateService";

export class AccountBalanceBelowSavedAmountError extends Error {
    minimumAllowedBalance: number;

    constructor(minimumAllowedBalance: number) {
        super(`Balance cannot be lower than the currently saved amount (${minimumAllowedBalance.toFixed(2)}).`);
        this.name = "AccountBalanceBelowSavedAmountError";
        this.minimumAllowedBalance = minimumAllowedBalance;
    }
}

export function isAccountBalanceBelowSavedAmountError(
    error: unknown
): error is AccountBalanceBelowSavedAmountError {
    return error instanceof AccountBalanceBelowSavedAmountError;
}

export async function getAccountsListAsync() : Promise<AccountListData> {
    const foundAccounts = await getAllAccountsAsync();
    const mappedAccounts = foundAccounts
                            .map<AccountData>((account: AccountEntity) => mapAccountEntityToAccountData(account));

    const totalBalance = await calculateTotalBalanceAsync(mappedAccounts);

    return {
        accounts: mappedAccounts,
        totalBalance: totalBalance
    } as AccountListData;
}

export async function getAccountAsync(id: number) : Promise<AccountData> 
{
    const foundAccount = await getAccountByIdAsync(id);
    if (!foundAccount) {
        throw new Error(`Account with id ${id} not found`);
    }

    return mapAccountEntityToAccountData(foundAccount);
}

export async function addAccountAsync(accountToAdd: AccountData) : Promise<AccountData> {
    const addedAccount = insertAccount(
        mapAccountDataToAccountEntity({
            ...accountToAdd,
            availableBalance: accountToAdd.balance,
        })
    );

    return mapAccountEntityToAccountData(addedAccount);
}

export async function updateAccountAsync(accountToUpdate: AccountUpdateData) : Promise<AccountData> {
    const currentAccount = getAccountById(accountToUpdate.id);
    if (!currentAccount) {
        throw new Error(`Account with id ${accountToUpdate.id} not found`);
    }

    const balanceDifference = accountToUpdate.balance - currentAccount.balance;
    const nextAvailableBalance = currentAccount.availableBalance + balanceDifference;
    if (nextAvailableBalance < 0) {
        throw new AccountBalanceBelowSavedAmountError(
            currentAccount.balance - currentAccount.availableBalance
        );
    }

    const updatedAccount = updateAccount({
        ...mapAccountUpdateDataToAccountUpdateEntity(accountToUpdate),
        availableBalance: nextAvailableBalance,
    });

    return mapAccountEntityToAccountData(updatedAccount);
}

export async function deleteAccountAsync(id: number) : Promise<void> {
    db.transaction((tx) => {
        const linkedSavings = getAccountSavingsByAccountId(id, tx);

        for (const linkedSaving of linkedSavings) {
            const savingGoal = getSavingGoalById(linkedSaving.savingGoalId, tx);
            if (!savingGoal) {
                continue;
            }

            updateSavingGoalTotalSaved(
                savingGoal.id,
                savingGoal.totalSaved - linkedSaving.balance,
                tx
            );
            deleteSavingTransactionsByAccountSavingId(linkedSaving.id, tx);
        }

        deleteAccountSavingsByAccountId(id, tx);
        deleteAccount(id, tx);
    });
}

async function calculateTotalBalanceAsync(accounts: AccountData[]): Promise<number> {
    const defaultCurrency = await getDefaultCurrencySetting();
    const accountsToInclude = accounts.filter((account: AccountData) => account.includeToTotalBalance);
    const convertedBalances = await Promise.all(
        accountsToInclude.map(async (account) => {
            if (account.currency === defaultCurrency) {
                return account.balance;
            }

            return await convertSumToCurrencyAsync(account.balance, account.currency, defaultCurrency);
        })
    );

    return convertedBalances.reduce((totalBalance, balance) => totalBalance + balance, 0);
}
