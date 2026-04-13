import { MonthlyExpenseTypeComparisonData } from "./MonthlyExpenseTypeComparisonData";

export interface MonthlyExpenseComparisonData {
    currentMonthTotal: number;
    previousMonthTotal: number;
    byType: MonthlyExpenseTypeComparisonData[];
}
