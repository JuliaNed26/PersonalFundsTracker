export default interface IncomeTransactionData {
    incomeId: number;
    accountId: number;
    sum: number;
    currency: number;
    sumAddedToAccount?: number;
    date: string;
    note?: string;
}
