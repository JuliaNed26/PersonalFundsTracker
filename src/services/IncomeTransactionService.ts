import IncomeTransactionData from '../models/data/IncomeTransactionData';
import IncomeTransactionEntity from '../models/entities/IncomeTransactionEntity';
import { addIncomeTransaction } from '../db/Repositories/IncomeTransactionsRepository';
import { updateAccountBalanceAsync } from '../db/Repositories/AccountRepositiory';

export async function addIncomeTransactionAsync(
  transaction: IncomeTransactionData,
  currentAccountBalance: number
): Promise<void> {
  const transactionEntity: IncomeTransactionEntity = {
    incomeId: transaction.incomeId,
    accountId: transaction.accountId,
    sum: transaction.sum,
    date: transaction.date,
    note: transaction.note || ''
  };

  // Add the income transaction
  await addIncomeTransaction(transactionEntity);

  // Update account balance
  const newBalance = currentAccountBalance + transaction.sum;
  await updateAccountBalanceAsync(transaction.accountId, newBalance);
}
