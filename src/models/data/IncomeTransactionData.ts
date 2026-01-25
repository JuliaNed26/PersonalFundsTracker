export default interface IncomeTransactionData {
    incomeId: number;
    accountId: number;
    sum: number;
    date: string;
    note?: string;
}