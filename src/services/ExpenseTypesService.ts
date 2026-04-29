import { 
    deleteExpenseByIdAsync,
    getAllExpensesAsync, 
    getExpenseByIdAsync,
    insertExpenseAsync,
    updateExpenseAsync as updateExpenseInDbAsync } from "../db/repositories/ExpensesRepository";
import ExpenseTypeData from "../models/data/ExpenseTypeData";
import { mapExpenseTypeDataToExpenseTypeEntity, mapExpenseTypeEntityToExpenseTypeData } from "./MapService";
import { getAllExpenseTransactionsForAnalyticsAsync, getExpenseBalancesAsync } from "./ExpenseTransactionService";

const TREND_COLOR_PALETTE = ["#237F46", "#B64A25", "#D00000", "#67707C", "#4ADE80", "#FB923C"];
const TOTAL_SERIES_COLOR = "#1F2937";
const TOTAL_SERIES_ID = -1;

type MonthDescriptor = {
    key: string;
    label: string;
};

export interface ExpenseTrendPoint {
    monthKey: string;
    monthLabel: string;
    sum: number;
}

export interface ExpenseTrendSeries {
    id: number;
    name: string;
    color: string;
    points: ExpenseTrendPoint[];
}

export interface ExpenseTrendsData {
    totalSeries: ExpenseTrendSeries;
    expenseSeries: ExpenseTrendSeries[];
}

function buildLastMonths(monthsCount: number): MonthDescriptor[] {
    const result: MonthDescriptor[] = [];
    const today = new Date();

    for (let monthOffset = monthsCount - 1; monthOffset >= 0; monthOffset--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth() + 1;
        result.push({
            key: `${year}-${month.toString().padStart(2, "0")}`,
            label: monthDate.toLocaleString(undefined, { month: "short" }),
        });
    }

    return result;
}

function initializeSumsArray(length: number): number[] {
    return Array.from({ length }, () => 0);
}

function roundToCurrency(sum: number): number {
    return Math.round(sum * 100) / 100;
}

export async function getAllExpensesForCurrentMonthAsync() : Promise<ExpenseTypeData[]> {
    const [foundExpenses, expenseBalances] = await Promise.all([
        getAllExpensesAsync(),
        getExpenseBalancesAsync(),
    ]);

    return foundExpenses.map(expense =>
        mapExpenseTypeEntityToExpenseTypeData(expense, expenseBalances[expense.id] ?? 0)
    );
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

export async function getExpenseTrendsAsync(monthsCount: number = 12): Promise<ExpenseTrendsData> {
    const normalizedMonthsCount = Math.max(1, monthsCount);
    const [foundExpenses, transactions] = await Promise.all([
        getAllExpensesAsync(),
        getAllExpenseTransactionsForAnalyticsAsync(),
    ]);

    const expenses = [...foundExpenses];
    const months = buildLastMonths(normalizedMonthsCount);
    const monthIndexByKey = new Map(months.map((month, index) => [month.key, index]));
    const totalSums = initializeSumsArray(months.length);
    const sumsByExpenseId = new Map<number, number[]>();

    for (const expense of expenses) {
        sumsByExpenseId.set(expense.id, initializeSumsArray(months.length));
    }

    for (const transaction of transactions) {
        const monthKey = transaction.date.slice(0, 7);
        const monthIndex = monthIndexByKey.get(monthKey);
        if (monthIndex === undefined) {
            continue;
        }

        totalSums[monthIndex] += transaction.sumReceived;

        if (!sumsByExpenseId.has(transaction.expenseId)) {
            sumsByExpenseId.set(transaction.expenseId, initializeSumsArray(months.length));
            expenses.push({
                id: transaction.expenseId,
                name: transaction.expenseName,
                limit: undefined,
            });
        }

        const expenseSums = sumsByExpenseId.get(transaction.expenseId);
        if (!expenseSums) {
            continue;
        }

        expenseSums[monthIndex] += transaction.sumReceived;
    }

    const monthPointsFactory = (sums: number[]): ExpenseTrendPoint[] =>
        months.map((month, index) => ({
            monthKey: month.key,
            monthLabel: month.label,
            sum: roundToCurrency(sums[index] ?? 0),
        }));

    const totalSeries: ExpenseTrendSeries = {
        id: TOTAL_SERIES_ID,
        name: "Total expenses",
        color: TOTAL_SERIES_COLOR,
        points: monthPointsFactory(totalSums),
    };

    const sortedExpenses = [...expenses].sort((leftExpense, rightExpense) =>
        leftExpense.name.localeCompare(rightExpense.name)
    );

    const expenseSeries = sortedExpenses.map((expense, index) => ({
        id: expense.id,
        name: expense.name,
        color: TREND_COLOR_PALETTE[index % TREND_COLOR_PALETTE.length],
        points: monthPointsFactory(sumsByExpenseId.get(expense.id) ?? initializeSumsArray(months.length)),
    }));

    return {
        totalSeries,
        expenseSeries,
    };
}
