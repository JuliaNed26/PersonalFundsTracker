import { 
    getAccountByIdAsync, 
    getAllAccountsAsync, 
    insertAccountAsync, 
    updateAccountAsync as updateAccountInDbAsync,
    deleteAccountAsync as deleteAccountFromDbAsync } from "../db/Repositories/AccountRepositiory";
import { AccountEntity } from "../models/entities/AccountEntity";
import { AccountData } from "../models/data/AccountData";
import { AccountListData } from "../models/data/AccountListData";
import { getDefaultCurrencySetting } from "./async-storage/AsyncStorageService";
import ExchangeRateRetrievalEntity from "../models/entities/ExchangeRateRetrievalEntity";
import { getExchangeRatesListAsync } from "../db/Repositories/ExchangeRatesRepository";
import { mapAccountDataToAccountEntity, mapAccountEntityToAccountData, mapAccountUpdateDataToAccountUpdateEntity } from "./MapService";
import AccountUpdateData from "../models/data/AccountUpdateData";

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
    await insertAccountAsync(mapAccountDataToAccountEntity(accountToAdd));
    return accountToAdd;
}

export async function updateAccountAsync(accountToUpdate: AccountUpdateData) : Promise<AccountData> {
    var account = await updateAccountInDbAsync(mapAccountUpdateDataToAccountUpdateEntity(accountToUpdate));
    return mapAccountEntityToAccountData(account);
}

export async function deleteAccountAsync(id: number) : Promise<void> {
    await deleteAccountFromDbAsync(id);
}

async function calculateTotalBalanceAsync(accounts: AccountData[]): Promise<number> {
    var defaultCurrency = await getDefaultCurrencySetting();

    var accountsToInclude = accounts.filter((account: AccountData) => account.includeToTotalBalance);
    var currenciesToConvertTo = accountsToInclude
        .map((account: AccountData) => account.currency)
        .filter((currency, index, self) => self.indexOf(currency) === index && currency !== defaultCurrency)
        .map(currency => ({ baseCurrency: currency, quoteCurrency: defaultCurrency }) as ExchangeRateRetrievalEntity);

    var exchangeRates = await getExchangeRatesListAsync(currenciesToConvertTo);
    var ratesDictionary = exchangeRates.reduce((dict, rate) => {
        dict[rate.baseCurrency] = rate.rate;
        return dict;
    }, {} as Record<number, number>);

    for (const pair of currenciesToConvertTo) {
        if (ratesDictionary[pair.baseCurrency] === undefined) {
            throw new Error(`Exchange rate not found for currency ${pair.baseCurrency} to ${pair.quoteCurrency}`);
        }
    }

    var totalBalance = accounts
        .filter((account: AccountData) => account.includeToTotalBalance)
        .reduce((balance, account) =>
        {
            if (account.currency === defaultCurrency) {
                return balance + account.balance;
            } else {
                var rate = ratesDictionary[account.currency];
                return balance + (account.balance * rate);
            }
        }, 0);

    return totalBalance;
}
