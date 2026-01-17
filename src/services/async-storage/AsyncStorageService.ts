import AsyncStorage from '@react-native-async-storage/async-storage';
import { Currency } from '../../models/enums/Currency';

export const defaultCurrencySettingKey = 'defaultCurrencySetting';

export async function getDefaultCurrencySetting(): Promise<number> {
    var defaultCurrency = await AsyncStorage.getItem(defaultCurrencySettingKey);
    if (!defaultCurrency)
    {
        return Currency.UAH;
    }

    return parseInt(defaultCurrency);
}

export function saveDefaultCurrencySetting(defaultCurrency: number): Promise<void> {
    return AsyncStorage.setItem(defaultCurrencySettingKey, defaultCurrency.toString());
}