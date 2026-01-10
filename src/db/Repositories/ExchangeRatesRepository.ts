import { db } from '../index';
import { eq, or, and } from "drizzle-orm";
import { exchangeRates } from '../schema';
import ExchangeRateEntity from '../../models/entities/ExchangeRateEntity';
import ExchangeRateRetrievalEntity from '../../models/entities/ExchangeRateRetrievalEntity';

export default async function getExchangeRateAsync(baseCurrency: number, quoteQurrency: number): Promise<number | null> {
    var exchangeRate = await db.query.exchangeRates.findFirst({
        where: eq(exchangeRates.base, baseCurrency) && (eq(exchangeRates.quote, quoteQurrency)),
    });

    return exchangeRate ? exchangeRate.rate : null;
}

export async function getExchangeRatesListAsync(currencyPairs: Array<ExchangeRateRetrievalEntity>): Promise<ExchangeRateEntity[]> {

    if (currencyPairs.length === 0) return [];

    const conditions = currencyPairs.map(pair =>
        and(eq(exchangeRates.base, pair.baseCurrency), eq(exchangeRates.quote, pair.quoteCurrency))
    );

    const results = await db.query.exchangeRates.findMany({
        where: or(...conditions),
    });

    return results.map(rate => ({
        baseCurrency: rate.base,
        quoteCurrency: rate.quote,
        rate: rate.rate
    })) as ExchangeRateEntity[];
}

export async function insertOrIgnoreExchangeRatesAsync(rates: ExchangeRateEntity[]): Promise<void> {
    if (rates.length === 0) return;

    await db.insert(exchangeRates)
        .values(rates.map(rate => ({
            base: rate.baseCurrency,
            quote: rate.quoteCurrency,
            rate: rate.rate
        })))
        .onConflictDoNothing();
}