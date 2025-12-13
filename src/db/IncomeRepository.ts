import { db } from './index';
import { incomes } from './schema';
import type { Income } from './schema';
import type { IncomeEntity } from '../models/IncomeEntity';
import { eq } from 'drizzle-orm';

export async function getAllIncomesAsync(): Promise<IncomeEntity[]> {
  const foundIncomes = (await db.select().from(incomes)) as Income[];

  return foundIncomes.map((income: Income) => ({
    id: income.id,
    name: income.name,
    balance: 0,
    currency: income.currency,
  }));
}

export async function getIncomeByIdAsync(id: number): Promise<IncomeEntity | null> {
  return (
    await db.select().from(incomes).where(eq(incomes.id, id)).limit(1)
  )[0] as IncomeEntity | null;
}

export async function insertIncomeAsync(incomeData: Omit<IncomeEntity, 'id'>): Promise<IncomeEntity> {
  let income = await db.insert(incomes)
          .values(
          {
            name: incomeData.name,
            currency: incomeData.currency,
            balance: incomeData.balance
          }).returning();

  return await getIncomeByIdAsync(db.getLastInsertRowid() as number) as IncomeEntity;
}
