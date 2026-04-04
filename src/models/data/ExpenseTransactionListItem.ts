import ExpenseTransactionData from "./ExpenseTransactionData";

export default interface ExpenseTransactionListItem extends ExpenseTransactionData {
    accountName: string;
    expenseName: string;
    accountCurrency: number;
}
