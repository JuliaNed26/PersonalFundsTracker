import IncomeTransactionEntity from "./IncomeTransactionEntity";

export interface IncomeSourceEntity {
  id: number;
  name: string;
  currency: number;
  transactions: IncomeTransactionEntity[];
}