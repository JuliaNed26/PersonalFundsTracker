import IncomeTransactionData from '../models/data/IncomeTransactionData';
import IncomeTransactionEntity from '../models/entities/IncomeTransactionEntity';
import IncomeTransactionListItem from '../models/data/IncomeTransactionListItem';
import {
  addIncomeTransaction,
  deleteIncomeTransactionAsync as deleteIncomeTransactionFromDbAsync,
  getIncomeTransactionsByAccountIdAsync,
  updateIncomeTransactionNoteAsync as updateIncomeTransactionNoteInDbAsync
} from '../db/Repositories/IncomeTransactionsRepository';
import { updateAccountBalanceAsync } from '../db/Repositories/AccountRepositiory';
import { mapIncomeTransactionDataToIncomeTransactionEntity } from './MapService';
import { AccountData } from '../models/data/AccountData';
import { getAccountAsync } from './AccountService';
import { convertSumToCurrencyAsync } from './ExchangeRateService';

export async function addIncomeTransactionAsync(
  transaction: IncomeTransactionData,
  account: AccountData,
  sumAddToAccount: number
): Promise<void> {
  const transactionEntity: IncomeTransactionEntity = mapIncomeTransactionDataToIncomeTransactionEntity({
    ...transaction,
    sumAddedToAccount: sumAddToAccount,
  });

  // Add the income transaction
  await addIncomeTransaction(transactionEntity);

  // Update account balance
  await updateAccountBalanceAsync(transaction.accountId, account.balance + sumAddToAccount);
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

  await deleteIncomeTransactionFromDbAsync(transactionEntity);
  await updateAccountBalanceAsync(transaction.accountId, account.balance - sumToSubtract);
}
