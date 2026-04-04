export default interface ExpenseTransactionData {
    accountId: number;
    expenseId: number;
    sumSent: number;
    sumReceived: number;
    date: string;
    note?: string;
}
