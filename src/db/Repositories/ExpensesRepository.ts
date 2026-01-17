import { db } from '../index';
import { ExpenseTypeEntity } from "../../models/entities/ExpenseTypeEntity";
import { Expense, expenses } from '../schema';
import { eq } from 'drizzle-orm';

export async function getAllExpensesAsync() : Promise<ExpenseTypeEntity[]>{
    const foundExpenses = (await db.select().from(expenses)) as Expense[];

    return foundExpenses.map((expense: Expense) => (
    {
      id: expense.id,
      name: expense.name,
      limit: expense.limit,
    })) as ExpenseTypeEntity[];
}

export async function getExpenseByIdAsync(id: number) : Promise<ExpenseTypeEntity | null>{
    const expense = (await db.query.expenses.findFirst({
        where: eq(expenses.id, id),
    })) as Expense;

    return !expense 
    ? null 
    : ({
      id: expense.id,
      name: expense.name,
      limit: expense.limit,
    } as ExpenseTypeEntity);
}

export async function insertExpenseAsync(expenseToAdd: ExpenseTypeEntity) : Promise<ExpenseTypeEntity>{
    console.log('Inserting expense:', expenseToAdd);
    const inserted = await db.insert(expenses).values({
        name: expenseToAdd.name,
        limit: expenseToAdd.limit,
    }).returning();

    const row = Array.isArray(inserted) ? inserted[0] : inserted;
    return row as ExpenseTypeEntity;
}

export async function updateExpenseAsync(expenseToUpdate: ExpenseTypeEntity) : Promise<ExpenseTypeEntity>{
    const updated = await db.update(expenses).set({
        name: expenseToUpdate.name,
        limit: expenseToUpdate.limit,
    }).where(eq(expenses.id, expenseToUpdate.id)).returning();

    const row = Array.isArray(updated) ? updated[0] : updated;
    return row as ExpenseTypeEntity;
}

export async function deleteExpenseByIdAsync(id: number) : Promise<void>{
    await db.delete(expenses).where(eq(expenses.id, id));
}