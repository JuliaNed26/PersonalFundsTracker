import { getMonthDateRange, getPreviousMonthDateRange } from "./DateService";
import {
    getExpenseTotalForDateRangeAsync,
    getExpenseTotalsByTypeForDateRangeAsync,
} from "../db/repositories/ExpenseTransactionsRepository";
import { MonthlyExpenseTypeComparisonDataData } from "../models/data/MonthlyExpenseTypeComparisonDataData";
import { MonthlyExpenseComparisonData } from "../models/data/MonthlyExpenseComparisonData";

export async function getMonthlyExpenseComparisonAsync(): Promise<MonthlyExpenseComparisonData> {
    const { startOfMonth: currentStart, endOfMonth: currentEnd } = getMonthDateRange();
    const { startOfMonth: previousStart, endOfMonth: previousEnd } = getPreviousMonthDateRange();

    const [currentTotal, previousTotal, currentByType, previousByType] = await Promise.all([
        getExpenseTotalForDateRangeAsync(currentStart, currentEnd),
        getExpenseTotalForDateRangeAsync(previousStart, previousEnd),
        getExpenseTotalsByTypeForDateRangeAsync(currentStart, currentEnd),
        getExpenseTotalsByTypeForDateRangeAsync(previousStart, previousEnd),
    ]);

    const map = new Map<number, MonthlyExpenseTypeComparisonData>();

    for (const row of currentByType) {
        map.set(row.expenseId, {
            expenseId: row.expenseId,
            expenseName: row.expenseName,
            currentMonthSum: row.sumReceived,
            previousMonthSum: 0,
        });
    }

    for (const row of previousByType) {
        const existing = map.get(row.expenseId);
        if (existing) {
            existing.previousMonthSum = row.sumReceived;
        } else {
            map.set(row.expenseId, {
                expenseId: row.expenseId,
                expenseName: row.expenseName,
                currentMonthSum: 0,
                previousMonthSum: row.sumReceived,
            });
        }
    }

    const byType = Array.from(map.values()).sort(
        (a, b) => b.currentMonthSum - a.currentMonthSum
    );

    return {
        currentMonthTotal: currentTotal,
        previousMonthTotal: previousTotal,
        byType,
    };
}
