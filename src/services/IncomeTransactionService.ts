import IncomeTransactionData from '../models/data/IncomeTransactionData';
import IncomeTransactionEntity from '../models/entities/IncomeTransactionEntity';
import IncomeTransactionListItem from '../models/data/IncomeTransactionListItem';
import {
  addIncomeTransaction,
  deleteIncomeTransaction,
  deleteIncomeTransactionAsync as deleteIncomeTransactionFromDbAsync,
  getIncomeTransactionsByAccountIdAsync,
  getIncomeTransactionsByIncomeIdAsync,
  updateIncomeTransactionNoteAsync as updateIncomeTransactionNoteInDbAsync
} from '../db/repositories/IncomeTransactionsRepository';
import { db } from '../db';
import { getAccountById, updateAccountBalances } from '../db/repositories/AccountRepositiory';
import { mapIncomeTransactionDataToIncomeTransactionEntity } from './MapService';
import { AccountData } from '../models/data/AccountData';
import { getAccountAsync } from './AccountService';
import { convertSumToCurrencyAsync } from './ExchangeRateService';

export async function addIncomeTransactionAsync(
  transaction: IncomeTransactionData,
  _account: AccountData,
  sumAddToAccount: number
): Promise<void> {
  const transactionEntity: IncomeTransactionEntity = mapIncomeTransactionDataToIncomeTransactionEntity({
    ...transaction,
    sumAddedToAccount: sumAddToAccount,
  });

  db.transaction((tx) => {
    const account = getAccountById(transaction.accountId, tx);
    if (!account) {
      throw new Error(`Account with id ${transaction.accountId} not found`);
    }

    addIncomeTransaction(transactionEntity, tx);
    updateAccountBalances(
      transaction.accountId,
      account.balance + sumAddToAccount,
      account.availableBalance + sumAddToAccount,
      tx
    );
  });
}

export async function getIncomeTransactionsForAccountAsync(accountId: number): Promise<IncomeTransactionListItem[]> {
  const list = await getIncomeTransactionsByAccountIdAsync(accountId);
  const enriched = await Promise.all(
    list.map(async (transaction) => {
      if (transaction.sumAddedToAccount !== undefined) {
        return { ...transaction, sumForAccount: transaction.sumAddedToAccount };
      }

      if (transaction.currency === transaction.accountCurrency) {
        return { ...transaction, sumForAccount: transaction.sum };
      }

      try {
        const converted = await convertSumToCurrencyAsync(
          transaction.sum,
          transaction.currency,
          transaction.accountCurrency
        );
        return { ...transaction, sumForAccount: converted };
      } catch (error) {
        console.error("Failed to convert transaction sum for list", error);
        return transaction;
      }
    })
  );

  return enriched;
}

export async function getIncomeTransactionsForIncomeAsync(incomeId: number): Promise<IncomeTransactionListItem[]> {
  return getIncomeTransactionsByIncomeIdAsync(incomeId);
}

export async function updateIncomeTransactionNoteAsync(
  transaction: IncomeTransactionData,
  note?: string
): Promise<void> {
  const transactionEntity: IncomeTransactionEntity = mapIncomeTransactionDataToIncomeTransactionEntity(transaction);
  await updateIncomeTransactionNoteInDbAsync(transactionEntity, note);
}

export async function deleteIncomeTransactionAsync(transaction: IncomeTransactionData): Promise<void> {
  const transactionEntity: IncomeTransactionEntity = mapIncomeTransactionDataToIncomeTransactionEntity(transaction);
  const account = await getAccountAsync(transaction.accountId);
  let sumToSubtract = transaction.sumAddedToAccount ?? transaction.sum;

  if (transaction.sumAddedToAccount === undefined && transaction.currency !== account.currency) {
    sumToSubtract = await convertSumToCurrencyAsync(transaction.sum, transaction.currency, account.currency);
  }

  db.transaction((tx) => {
    deleteIncomeTransaction(transactionEntity, tx);
    updateAccountBalances(
      transaction.accountId,
      account.balance - sumToSubtract,
      account.availableBalance - sumToSubtract,
      tx
    );
  });
}
