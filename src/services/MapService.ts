import { AccountData } from "../models/data/AccountData";
import AccountUpdateData from "../models/data/AccountUpdateData";
import { IncomeSourceData } from "../models/data/IncomeSourceData";
import { AccountEntity } from "../models/entities/AccountEntity";
import { AccountUpdateEntity } from "../models/entities/AccountUpdateEntity";
import { IncomeEntity } from "../models/entities/IncomeEntity";

export function mapAccountEntityToAccountData(account: AccountEntity) : AccountData
{
    return {
        id: account.id,
        name: account.name,
        balance: account.balance,
        includeToTotalBalance: account.includeToTotalBalance,
        currency: account.currency
    } as AccountData;
}

export function mapAccountDataToAccountEntity(account: AccountData) : AccountEntity
{
    return {
        id: account.id,
        name: account.name,
        balance: account.balance,
        includeToTotalBalance: account.includeToTotalBalance,
        currency: account.currency
    } as AccountEntity;
}

export function mapAccountDataToAccountUpdateEntity(account: AccountData) : AccountUpdateEntity
{
    return {
        id: account.id,
        name: account.name,
        balance: account.balance,
        includeToTotalBalance: account.includeToTotalBalance
    } as AccountUpdateEntity;
}

export function mapAccountUpdateDataToAccountUpdateEntity(account: AccountUpdateData) : AccountUpdateEntity
{
    return {
        id: account.id,
        name: account.name,
        balance: account.balance,
        includeToTotalBalance: account.includeToTotalBalance
    } as AccountUpdateEntity;
}

export function mapIncomeEntityToIncomeSourceData(income: IncomeEntity) : IncomeSourceData
{
    return {
        id: income.id,
        name: income.name,
        balance: income.balance,
        currency: income.currency
    } as IncomeSourceData;
}

export function mapIncomeSourceDataToIncomeEntity(income: IncomeSourceData) : IncomeEntity
{
    return {
        id: income.id,
        name: income.name,
        balance: income.balance,
        currency: income.currency
    } as IncomeEntity;
}

