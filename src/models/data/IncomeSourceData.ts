import IncomeTransactionData from "./IncomeTransactionData";

export interface IncomeSourceData {
  id: number;
  name: string;
  currency: number;
  transactions: IncomeTransactionData[];
  balance?: number;
}
