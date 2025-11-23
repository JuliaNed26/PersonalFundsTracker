import { db } from './index';
import { incomes } from './schema';
import type { Income } from './schema';
import type { IncomeEntity } from '../models/IncomeEntity';

export async function getAllIncomesAsync(): Promise<IncomeEntity[]> {
  const foundIncomes = (await db.select().from(incomes)) as Income[];

  return foundIncomes.map((income: Income) => ({
    id: income.id,
    name: income.name,
    balance: 0,
    currency: income.currency,
  }));
}

export async function insertIncomeAsync(
  incomeData: Omit<IncomeEntity, 'id' | 'balance'>,
): Promise<void> {
  await db.insert(incomes).values({
    name: incomeData.name,
    currency: incomeData.currency,
  });
}
