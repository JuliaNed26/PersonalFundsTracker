import { AccountTransferData } from "./AccountTransferData";

export interface AccountTransferListItem extends AccountTransferData {
  isOutgoing: boolean;
  counterpartAccountName: string;
  accountCurrency: number;
  sumForAccount: number;
}
