import { db } from './index';
import { incomes } from './schema';
import type { Income } from './schema';
import type { IncomeEntity } from '../models/entities/IncomeEntity';
import { eq } from 'drizzle-orm';

export async function getAllIncomesAsync(): Promise<IncomeEntity[]> {
  const foundIncomes = (await db.select().from(incomes)) as Income[];

  return foundIncomes.map((income: Income) => ({
    id: income.id,
    name: income.name,
    balance: income.balance,
    currency: income.currency,
  }));
}

export async function getIncomeByIdAsync(id: number): Promise<IncomeEntity | null> {
  var income = (
    await db.select().from(incomes).where(eq(incomes.id, id)).limit(1)
  )[0] as IncomeEntity | null;
  console.log(income?.balance);
  return income;
}

export async function insertIncomeAsync(incomeData: Omit<IncomeEntity, 'id'>): Promise<IncomeEntity> {
  const inserted = await db.insert(incomes).values({
    name: incomeData.name,
    currency: incomeData.currency,
    balance: incomeData.balance,
  }).returning();

  const row = Array.isArray(inserted) ? inserted[0] : inserted;
  console.log(row.balance);
  return row as IncomeEntity;
}

export async function deleteIncomeByIdAsync(id: number): Promise<void> {
  await db.delete(incomes).where(eq(incomes.id, id));
}
