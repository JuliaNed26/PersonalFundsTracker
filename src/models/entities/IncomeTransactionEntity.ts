export default interface IncomeTransactionEntity {
    incomeId: number;
    accountId: number;
    sum: number;
    currency: number;
    date: string;
    note?: string;
}