import { Currency } from "../enums/Currency";

export const currencyMap = new Map<number, string>([
  [Currency.UAH, 'UAH'],
  [Currency.USD, 'USD'],
  [Currency.EUR, 'EUR'],
  [Currency.GBP, 'GBP'],
  [Currency.JPY, 'JPY'],
  [Currency.CNY, 'CNY'],
]);

export const currencyDropdownData = Array.from(currencyMap, ([key, value]) => ({ key, value }));

