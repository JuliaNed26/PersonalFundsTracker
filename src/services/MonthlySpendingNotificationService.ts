import { getMonthDateRange, getPreviousMonthDateRange, getMonthKey } from "./DateService";
import { getExpenseTotalForDateRangeAsync } from "../db/Repositories/ExpenseTransactionsRepository";
import {
    getMonthlySpendingNotificationShownMonth,
    saveMonthlySpendingNotificationShownMonth,
} from "./async-storage/AsyncStorageService";

export interface MonthlySpendingNotificationPayload {
    currentTotal: number;
    previousTotal: number;
}

export async function getMonthlySpendingNotificationAsync(): Promise<MonthlySpendingNotificationPayload | null> {
    const currentMonthKey = getMonthKey();
    const shownMonthKey = await getMonthlySpendingNotificationShownMonth();

    if (shownMonthKey === currentMonthKey) {
        return null;
    }

    const { startOfMonth: currentStart, endOfMonth: currentEnd } = getMonthDateRange();
    const { startOfMonth: prevStart, endOfMonth: prevEnd } = getPreviousMonthDateRange();

    const [currentTotal, previousTotal] = await Promise.all([
        getExpenseTotalForDateRangeAsync(currentStart, currentEnd),
        getExpenseTotalForDateRangeAsync(prevStart, prevEnd),
    ]);

    if (currentTotal > previousTotal) {
        return { currentTotal, previousTotal };
    }

    return null;
}

export async function markMonthlySpendingNotificationShownAsync(): Promise<void> {
    await saveMonthlySpendingNotificationShownMonth(getMonthKey());
}
