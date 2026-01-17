import { insertOrIgnoreExchangeRatesAsync } from "../db/Repositories/ExchangeRatesRepository";
import ExchangeRateEntity from "../models/entities/ExchangeRateEntity";
import { Currency } from "../models/enums/Currency";

export async function saveDefaultExchangeRates() : Promise<void> {
    var exchangeRates = [
        { baseCurrency: Currency.UAH, quoteCurrency: Currency.USD, rate: 0.023 },
        { baseCurrency: Currency.UAH, quoteCurrency: Currency.EUR, rate: 0.02 },
        { baseCurrency: Currency.UAH, quoteCurrency: Currency.GBP, rate: 0.017 },
        { baseCurrency: Currency.UAH, quoteCurrency: Currency.JPY, rate: 3.66 },
        { baseCurrency: Currency.UAH, quoteCurrency: Currency.CNY, rate: 0.16 },
        { baseCurrency: Currency.USD, quoteCurrency: Currency.UAH, rate: 43.14 },
        { baseCurrency: Currency.EUR, quoteCurrency: Currency.UAH, rate: 50.23 },
        { baseCurrency: Currency.GBP, quoteCurrency: Currency.UAH, rate: 57.85 },
        { baseCurrency: Currency.JPY, quoteCurrency: Currency.UAH, rate: 0.27 },
        { baseCurrency: Currency.CNY, quoteCurrency: Currency.UAH, rate: 6.18 },
    ].map(rate => ({
        baseCurrency: rate.baseCurrency,
        quoteCurrency: rate.quoteCurrency,
        rate: rate.rate
    })) as ExchangeRateEntity[];

    await insertOrIgnoreExchangeRatesAsync(exchangeRates);
}