import { AccountData } from "../models/data/AccountData";
import AccountUpdateData from "../models/data/AccountUpdateData";
import { AccountEntity } from "../models/entities/AccountEntity";
import { AccountUpdateEntity } from "../models/entities/AccountUpdateEntity";

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

