import { 
    deleteExpenseByIdAsync,
    getAllExpensesAsync, 
    getExpenseByIdAsync,
    insertExpenseAsync,
    updateExpenseAsync as updateExpenseInDbAsync } from "../db/Repositories/ExpensesRepository";
import ExpenseTypeData from "../models/data/ExpenseTypeData";
import { mapExpenseTypeDataToExpenseTypeEntity, mapExpenseTypeEntityToExpenseTypeData } from "./MapService";

export async function getAllExpensesForCurrentMonthAsync() : Promise<ExpenseTypeData[]> {
    const foundExpenses = await getAllExpensesAsync();

    // ToDo: calculate balance for each expense type after transactions are implemented for the month
    return foundExpenses.map(expense => mapExpenseTypeEntityToExpenseTypeData(expense));
}

export async function getExpenseAsync(id: number) : Promise<ExpenseTypeData> {
    const foundExpenseType = await getExpenseByIdAsync(id);
    if (!foundExpenseType) {
        throw new Error(`Expense type with id ${id} not found`);
    }

    return mapExpenseTypeEntityToExpenseTypeData(foundExpenseType);
}

export async function addExpenseTypeAsync(expenseToAdd: ExpenseTypeData) : Promise<ExpenseTypeData> {
    const addedExpenseType = await insertExpenseAsync(mapExpenseTypeDataToExpenseTypeEntity(expenseToAdd));
    return mapExpenseTypeEntityToExpenseTypeData(addedExpenseType);
}

export async function updateExpenseAsync(expenseToUpdate: ExpenseTypeData) : Promise<ExpenseTypeData> {
    const updatedExpenseType = await updateExpenseInDbAsync(mapExpenseTypeDataToExpenseTypeEntity(expenseToUpdate));
    return mapExpenseTypeEntityToExpenseTypeData(updatedExpenseType);
}

export async function deleteExpenseAsync(id: number) : Promise<void> {
    await deleteExpenseByIdAsync(id);
}