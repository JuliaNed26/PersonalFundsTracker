import ExchangeRateUpdateData from "../models/data/ExchangeRateUpdateData";
import ExchangeRateValidationResult from "../models/data/ExchangeRateValidationResult";

export function validateExchangeRateUpdateData(
    exchangeRate: ExchangeRateUpdateData
): ExchangeRateValidationResult {
    const validationResult: ExchangeRateValidationResult = { isValid: true };

    validatePurchaseRate(exchangeRate.purchaseRate, validationResult);
    validateSellRate(exchangeRate.sellRate, validationResult);

    return validationResult;
}

function validatePurchaseRate(
    purchaseRate: number,
    validationResult: ExchangeRateValidationResult
): boolean {
    if (!Number.isFinite(purchaseRate)) {
        validationResult.isValid = false;
        validationResult.purchaseRateErrorMessage = "Purchase rate must be a number";
        return false;
    }

    if (purchaseRate <= 0) {
        validationResult.isValid = false;
        validationResult.purchaseRateErrorMessage = "Purchase rate must be greater than 0";
        return false;
    }

    return true;
}

function validateSellRate(
    sellRate: number,
    validationResult: ExchangeRateValidationResult
): boolean {
    if (!Number.isFinite(sellRate)) {
        validationResult.isValid = false;
        validationResult.sellRateErrorMessage = "Sell rate must be a number";
        return false;
    }

    if (sellRate <= 0) {
        validationResult.isValid = false;
        validationResult.sellRateErrorMessage = "Sell rate must be greater than 0";
        return false;
    }

    return true;
}
