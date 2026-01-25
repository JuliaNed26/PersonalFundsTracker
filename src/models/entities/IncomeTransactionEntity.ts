export default interface IncomeTransactionEntity {
    incomeId: number;
    accountId: number;
    sum: number;
    date: string;
    note?: string;
}