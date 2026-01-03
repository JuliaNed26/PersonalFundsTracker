export const currencyMap = new Map<number, string>([
  [0, 'UAH'],
  [1, 'USD'],
  [2, 'EUR'],
  [3, 'GBP'],
  [4, 'JPY'],
  [5, 'CNY'],
]);

export const currencyDropdownData = Array.from(currencyMap, ([key, value]) => ({ key, value }));