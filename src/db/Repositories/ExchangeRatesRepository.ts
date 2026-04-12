import { db } from '../index';
import { eq, and, ne } from "drizzle-orm";
import { exchangeRates } from '../schema';
import ExchangeRateEntity from '../../models/entities/ExchangeRateEntity';
import ExchangeRateUpdateData from '../../models/data/ExchangeRateUpdateData';

type ExchangeRateRow = {
    base: number;
    quote: number;
    purchaseRate: number;
    sellRate: number;
};

function mapExchangeRateRowToEntity(rate: ExchangeRateRow): ExchangeRateEntity {
    return {
        baseCurrency: rate.base,
        quoteCurrency: rate.quote,
        purchaseRate: rate.purchaseRate,
        sellRate: rate.sellRate,
    } as ExchangeRateEntity;
}

function sortExchangeRates(left: ExchangeRateEntity, right: ExchangeRateEntity): number {
    if (left.baseCurrency !== right.baseCurrency) {
        return left.baseCurrency - right.baseCurrency;
    }

    return left.quoteCurrency - right.quoteCurrency;
}

export async function getAllExchangeRatesAsync(): Promise<ExchangeRateEntity[]> {
    const results = await db.query.exchangeRates.findMany();

    return results
        .map((rate) => mapExchangeRateRowToEntity(rate as ExchangeRateRow))
        .sort(sortExchangeRates);
}

export async function getExchangeRateRowAsync(
    baseCurrency: number,
    quoteCurrency: number
): Promise<ExchangeRateEntity | null> {
    const exchangeRate = await db.query.exchangeRates.findFirst({
        where: and(eq(exchangeRates.base, baseCurrency), eq(exchangeRates.quote, quoteCurrency)),
    });

    return exchangeRate ? mapExchangeRateRowToEntity(exchangeRate as ExchangeRateRow) : null;
}

export async function getExchangeRatesByReferenceCurrencyAsync(
    referenceCurrency: number
): Promise<ExchangeRateEntity[]> {
    const results = await db.query.exchangeRates.findMany({
        where: and(
            eq(exchangeRates.quote, referenceCurrency),
            ne(exchangeRates.base, referenceCurrency)
        ),
    });

    return results
        .map((rate) => mapExchangeRateRowToEntity(rate as ExchangeRateRow))
        .sort(sortExchangeRates);
}

export async function updateExchangeRateAsync(
    data: ExchangeRateUpdateData,
    referenceCurrency: number
): Promise<ExchangeRateEntity> {
    const updated = await db.update(exchangeRates)
        .set({
            purchaseRate: data.purchaseRate,
            sellRate: data.sellRate,
        })
        .where(
            and(
                eq(exchangeRates.base, data.targetCurrency),
                eq(exchangeRates.quote, referenceCurrency)
            )
        )
        .returning();

    const row = Array.isArray(updated) ? updated[0] : updated;
    if (!row) {
        throw new Error(
            `Exchange rate not found for target currency ${data.targetCurrency} and reference currency ${referenceCurrency}`
        );
    }

    return mapExchangeRateRowToEntity(row as ExchangeRateRow);
}

export async function insertOrIgnoreExchangeRatesAsync(rates: ExchangeRateEntity[]): Promise<void> {
    if (rates.length === 0) return;

    await db.insert(exchangeRates)
        .values(rates.map(rate => ({
            base: rate.baseCurrency,
            quote: rate.quoteCurrency,
            purchaseRate: rate.purchaseRate,
            sellRate: rate.sellRate,
        })))
        .onConflictDoNothing();
}
