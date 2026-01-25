import { db } from '../index';
import { incomes, incomeTransactions } from '../schema';
import type { Income } from '../schema';
import type { IncomeSourceEntity } from '../../models/entities/IncomeEntity';
import { eq, and, gte, lte } from 'drizzle-orm';

function getCurrentMonthDateRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { startOfMonth, endOfMonth };
}

export async function getAllIncomesAsync(): Promise<IncomeSourceEntity[]> {
  const foundIncomes = (await db.query.incomes.findMany({
    with: { transactions: true }
  })) as any[];

  return foundIncomes.map((income) => (
  {
    id: income.id,
    name: income.name,
    currency: income.currency,
    transactions: income.transactions || []
  }));
}

export async function getIncomeByIdAsync(id: number): Promise<IncomeSourceEntity | null> {
  var income = (
    await db.query.incomes.findFirst({
      where: eq(incomes.id, id),
      with: { transactions: true },
    })
  ) as any;

  return !income 
    ? null 
    : ({
      id: income.id,
      name: income.name,
      currency: income.currency,
      transactions: income.transactions || []
    } as IncomeSourceEntity);
}

export async function insertIncomeAsync(incomeData: Omit<IncomeSourceEntity, 'id' | 'transactions'>): Promise<IncomeSourceEntity> {
  const inserted = await db.insert(incomes).values({
    name: incomeData.name,
    currency: incomeData.currency,
  }).returning();

  const row = Array.isArray(inserted) ? inserted[0] : inserted;
  return { ...row as IncomeSourceEntity, transactions: [] };
}

export async function updateIncomeAsync(incomeData: Omit<IncomeSourceEntity, 'currency' | 'transactions'>): Promise<IncomeSourceEntity> {
  const updated = await db.update(incomes).set({
    name: incomeData.name,
  }).where(eq(incomes.id, incomeData.id)).returning();

  const row = Array.isArray(updated) ? updated[0] : updated;
  return { ...row as IncomeSourceEntity, transactions: [] };
}

export async function deleteIncomeByIdAsync(id: number): Promise<void> {
  await db.delete(incomes).where(eq(incomes.id, id));
}

export async function getIncomeByIdWithCurrentMonthTransactionsAsync(id: number): Promise<IncomeSourceEntity | null> {
  const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();
  
  var income = (
    await db.query.incomes.findFirst({
      where: eq(incomes.id, id),
      with: {
        transactions: {
          where: and(
            gte(incomeTransactions.date, startOfMonth),
            lte(incomeTransactions.date, endOfMonth)
          )
        }
      },
    })
  ) as any;

  return !income 
    ? null 
    : ({
      id: income.id,
      name: income.name,
      currency: income.currency,
      transactions: income.transactions || []
    } as IncomeSourceEntity);
}

export async function getAllIncomesWithCurrentMonthTransactionsAsync(): Promise<IncomeSourceEntity[]> {
  const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();
  
  const foundIncomes = (await db.query.incomes.findMany({
    with: {
      transactions: {
        where: and(
          gte(incomeTransactions.date, startOfMonth),
          lte(incomeTransactions.date, endOfMonth)
        )
      }
    }
  })) as any[];

  return foundIncomes.map((income) => (
  {
    id: income.id,
    name: income.name,
    currency: income.currency,
    transactions: income.transactions || []
  }));
}