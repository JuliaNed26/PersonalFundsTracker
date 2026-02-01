import IncomeTransactionData from '../models/data/IncomeTransactionData';
import IncomeTransactionEntity from '../models/entities/IncomeTransactionEntity';
import { addIncomeTransaction } from '../db/Repositories/IncomeTransactionsRepository';
import { updateAccountBalanceAsync } from '../db/Repositories/AccountRepositiory';
import { mapIncomeTransactionDataToIncomeTransactionEntity } from './MapService';
import { AccountData } from '../models/data/AccountData';

export async function addIncomeTransactionAsync(
  transaction: IncomeTransactionData,
  account: AccountData,
  sumAddToAccount: number
): Promise<void> {
  const transactionEntity: IncomeTransactionEntity = mapIncomeTransactionDataToIncomeTransactionEntity(transaction);

  // Add the income transaction
  await addIncomeTransaction(transactionEntity);

  // Update account balance
  await updateAccountBalanceAsync(transaction.accountId, account.balance + sumAddToAccount);
}
