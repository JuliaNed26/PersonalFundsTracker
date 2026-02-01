import { AccountData } from "../models/data/AccountData";
import AccountUpdateData from "../models/data/AccountUpdateData";
import ExpenseTypeData from "../models/data/ExpenseTypeData";
import { IncomeSourceData } from "../models/data/IncomeSourceData";
import IncomeTransactionData from "../models/data/IncomeTransactionData";
import { AccountEntity } from "../models/entities/AccountEntity";
import { AccountUpdateEntity } from "../models/entities/AccountUpdateEntity";
import { ExpenseTypeEntity } from "../models/entities/ExpenseTypeEntity";
import { IncomeSourceEntity } from "../models/entities/IncomeEntity";
import IncomeTransactionEntity from "../models/entities/IncomeTransactionEntity";

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

export function mapIncomeEntityToIncomeSourceData(income: IncomeSourceEntity) : IncomeSourceData
{
    return {
        id: income.id,
        name: income.name,
        transactions: income.transactions.map(mapIncomeTransactionEntityToIncomeTransactionData),
        currency: income.currency
    } as IncomeSourceData;
}

export function mapIncomeSourceDataToIncomeEntity(income: IncomeSourceData) : IncomeSourceEntity
{
    return {
        id: income.id,
        name: income.name,
        transactions: income.transactions.map(mapIncomeTransactionDataToIncomeTransactionEntity),
        currency: income.currency
    } as IncomeSourceEntity;
}

export function mapExpenseTypeEntityToExpenseTypeData(expenseType: ExpenseTypeEntity) : ExpenseTypeData
{
    return {
        id: expenseType.id,
        name: expenseType.name,
        limit: expenseType.limit,
        balance: 0
    } as ExpenseTypeData;
}

export function mapExpenseTypeDataToExpenseTypeEntity(expenseType: ExpenseTypeData) : ExpenseTypeEntity
{
    return {
        id: expenseType.id,
        name: expenseType.name,
        limit: expenseType.limit
    } as ExpenseTypeEntity;
}

export function mapIncomeTransactionEntityToIncomeTransactionData(transaction: IncomeTransactionEntity) : IncomeTransactionData
{
    return {
        incomeId: transaction.incomeId,
        accountId: transaction.accountId,
        sum: transaction.sum,
        currency: transaction.currency,
        date: transaction.date,
        note: transaction.note
    } as IncomeTransactionData;
}

export function mapIncomeTransactionDataToIncomeTransactionEntity(transaction: IncomeTransactionData) : IncomeTransactionEntity
{
    return {
        incomeId: transaction.incomeId,
        accountId: transaction.accountId,
        sum: transaction.sum,
        currency: transaction.currency,
        date: transaction.date,
        note: transaction.note
    } as IncomeTransactionEntity;
}