import IncomeTransactionData from "./IncomeTransactionData";

export default interface IncomeTransactionListItem extends IncomeTransactionData {
  incomeName: string;
  accountName?: string;
  accountCurrency: number;
  sumForAccount?: number;
}
