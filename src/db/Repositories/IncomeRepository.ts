import { db } from '../index';
import { incomes } from '../schema';
import type { Income } from '../schema';
import type { IncomeEntity } from '../../models/entities/IncomeEntity';
import { eq } from 'drizzle-orm';

export async function getAllIncomesAsync(): Promise<IncomeEntity[]> {
  const foundIncomes = (await db.select().from(incomes)) as Income[];

  return foundIncomes.map((income: Income) => (
  {
    id: income.id,
    name: income.name,
    balance: income.balance,
    currency: income.currency,
  }));
}

export async function getIncomeByIdAsync(id: number): Promise<IncomeEntity | null> {
  var income = (
    await db.query.incomes.findFirst({
      where: eq(incomes.id, id),
    })
  ) as Income;

  return !income 
    ? null 
    : ({
      id: income.id,
      name: income.name,
      balance: income.balance,
      currency: income.currency,
    } as IncomeEntity);
}

export async function insertIncomeAsync(incomeData: Omit<IncomeEntity, 'id'>): Promise<IncomeEntity> {
  const inserted = await db.insert(incomes).values({
    name: incomeData.name,
    currency: incomeData.currency,
    balance: incomeData.balance,
  }).returning();

  const row = Array.isArray(inserted) ? inserted[0] : inserted;
  return row as IncomeEntity;
}

export async function updateIncomeAsync(incomeData: Omit<IncomeEntity, 'currency'>): Promise<IncomeEntity> {
  const updated = await db.update(incomes).set({
    name: incomeData.name,
    balance: incomeData.balance,
  }).where(eq(incomes.id, incomeData.id)).returning();

  const row = Array.isArray(updated) ? updated[0] : updated;
  return row as IncomeEntity;
}

export async function deleteIncomeByIdAsync(id: number): Promise<void> {
  await db.delete(incomes).where(eq(incomes.id, id));
}
