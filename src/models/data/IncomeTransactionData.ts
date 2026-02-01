export default interface IncomeTransactionData {
    incomeId: number;
    accountId: number;
    sum: number;
    currency: number;
    date: string;
    note?: string;
}