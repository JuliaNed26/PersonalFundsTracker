import { getAllAccountsAsync } from "../db/Repositories/AccountRepositiory";
import { AccountEntity } from "../models/entities/AccountEntity";
import { AccountData } from "../models/data/AccountData";
import { AccountListData } from "../models/data/AccountListData";
import { getDefaultCurrencySetting } from "./async-storage/AsyncStorageService";
import ExchangeRateRetrievalEntity from "../models/entities/ExchangeRateRetrievalEntity";
import { getExchangeRatesListAsync } from "../db/Repositories/ExchangeRatesRepository";

export async function getAccountsList() : Promise<AccountListData> {
    const foundAccounts = await getAllAccountsAsync();
    const mappedAccounts = foundAccounts.map<AccountData>((account: AccountEntity) => ({
        id: account.id,
        name: account.name,
        balance: account.balance,
        includeToTotalBalance: account.includeToTotalBalance,
        currency: account.currency
    }) as AccountData);

    const totalBalance = await calculateTotalBalanceAsync(mappedAccounts);

    return {
        accounts: mappedAccounts,
        totalBalance: totalBalance
    } as AccountListData;
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
            console.error(`Exchange rate not found for currency ${pair.baseCurrency} to ${pair.quoteCurrency}`);
            return 0;
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

