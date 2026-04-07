export interface AccountEntity {
  id: number;
  name: string;
  balance: number;
  availableBalance: number;
  currency: number;
  includeToTotalBalance: boolean;
}
