import {
    getExchangeRateRowAsync,
    getExchangeRatesByReferenceCurrencyAsync,
    insertOrIgnoreExchangeRatesAsync,
    updateExchangeRateAsync as updateExchangeRateInRepositoryAsync,
} from "../db/repositories/ExchangeRatesRepository";
import ExchangeRateListItemData from "../models/data/ExchangeRateListItemData";
import ExchangeRateUpdateData from "../models/data/ExchangeRateUpdateData";
import ExchangeRateEntity from "../models/entities/ExchangeRateEntity";
import { Currency } from "../models/enums/Currency";
import { currencyMap } from "../models/constants/CurrencyList";
import { mapExchangeRateEntityToListItemData } from "./MapService";
import { getDefaultCurrencySetting } from "./async-storage/AsyncStorageService";
import { validateExchangeRateUpdateData } from "./ExchangeRateValidationService";

function getCurrencyLabel(currency: number): string {
    return currencyMap.get(currency) ?? currency.toString();
}

function buildUnsupportedPivotCurrencyErrorMessage(pivotCurrency: number): string {
    return `Spread exchange rates currently support only UAH as pivot currency. Found ${getCurrencyLabel(pivotCurrency)}.`;
}

function buildExchangeRateNotFoundErrorMessage(sourceCurrency: number, targetCurrency: number): string {
    return `Exchange rate from ${getCurrencyLabel(sourceCurrency)} to ${getCurrencyLabel(targetCurrency)} not found`;
}

async function getCanonicalExchangeRateOrThrowAsync(
    foreignCurrency: number,
    pivotCurrency: number
): Promise<ExchangeRateEntity> {
    const exchangeRate = await getExchangeRateRowAsync(foreignCurrency, pivotCurrency);

    if (!exchangeRate) {
        throw new Error(buildExchangeRateNotFoundErrorMessage(foreignCurrency, pivotCurrency));
    }

    return exchangeRate;
}

function throwExchangeRateValidationError(
    validationResult: ReturnType<typeof validateExchangeRateUpdateData>
): never {
    throw new Error(
        validationResult.purchaseRateErrorMessage ??
        validationResult.sellRateErrorMessage ??
        "Exchange rate validation failed"
    );
}

export async function saveDefaultExchangeRates() : Promise<void> {
    const exchangeRates: ExchangeRateEntity[] = [
        { baseCurrency: Currency.UAH, quoteCurrency: Currency.USD, purchaseRate: 0.023, sellRate: 0.023 },
        { baseCurrency: Currency.UAH, quoteCurrency: Currency.EUR, purchaseRate: 0.02, sellRate: 0.02 },
        { baseCurrency: Currency.UAH, quoteCurrency: Currency.GBP, purchaseRate: 0.017, sellRate: 0.017 },
        { baseCurrency: Currency.UAH, quoteCurrency: Currency.JPY, purchaseRate: 3.66, sellRate: 3.66 },
        { baseCurrency: Currency.UAH, quoteCurrency: Currency.CNY, purchaseRate: 0.16, sellRate: 0.16 },
        { baseCurrency: Currency.USD, quoteCurrency: Currency.UAH, purchaseRate: 43.14, sellRate: 43.14 },
        { baseCurrency: Currency.EUR, quoteCurrency: Currency.UAH, purchaseRate: 50.23, sellRate: 50.23 },
        { baseCurrency: Currency.GBP, quoteCurrency: Currency.UAH, purchaseRate: 57.85, sellRate: 57.85 },
        { baseCurrency: Currency.JPY, quoteCurrency: Currency.UAH, purchaseRate: 0.27, sellRate: 0.27 },
        { baseCurrency: Currency.CNY, quoteCurrency: Currency.UAH, purchaseRate: 6.18, sellRate: 6.18 },
    ];

    await insertOrIgnoreExchangeRatesAsync(exchangeRates);
}

export async function getPivotCurrencyAsync(): Promise<number> {
    const pivotCurrency = await getDefaultCurrencySetting();

    if (pivotCurrency !== Currency.UAH) {
        throw new Error(buildUnsupportedPivotCurrencyErrorMessage(pivotCurrency));
    }

    return pivotCurrency;
}

export async function getExchangeRatesAsync(): Promise<ExchangeRateListItemData[]> {
    const pivotCurrency = await getPivotCurrencyAsync();
    const exchangeRates = await getExchangeRatesByReferenceCurrencyAsync(pivotCurrency);

    return exchangeRates
        .map(mapExchangeRateEntityToListItemData)
        .sort((left, right) => left.targetCurrency - right.targetCurrency);
}

export async function updateExchangeRateAsync(data: ExchangeRateUpdateData): Promise<ExchangeRateEntity> {
    const pivotCurrency = await getPivotCurrencyAsync();
    const validationResult = validateExchangeRateUpdateData(data);

    if (!validationResult.isValid) {
        throwExchangeRateValidationError(validationResult);
    }

    return updateExchangeRateInRepositoryAsync(data, pivotCurrency);
}

export async function convertSumToCurrencyAsync(initialSum: number, initialCurrency: number, targetCurrency: number): Promise<number> {
    const pivotCurrency = await getPivotCurrencyAsync();

    if (initialCurrency === targetCurrency) {
        return initialSum;
    }

    if (initialCurrency === pivotCurrency) {
        const targetExchangeRate = await getCanonicalExchangeRateOrThrowAsync(targetCurrency, pivotCurrency);
        return initialSum / targetExchangeRate.sellRate;
    }

    if (targetCurrency === pivotCurrency) {
        const sourceExchangeRate = await getCanonicalExchangeRateOrThrowAsync(initialCurrency, pivotCurrency);
        return initialSum * sourceExchangeRate.purchaseRate;
    }

    const sourceExchangeRate = await getCanonicalExchangeRateOrThrowAsync(initialCurrency, pivotCurrency);
    const targetExchangeRate = await getCanonicalExchangeRateOrThrowAsync(targetCurrency, pivotCurrency);

    return (initialSum * sourceExchangeRate.purchaseRate) / targetExchangeRate.sellRate;
}
