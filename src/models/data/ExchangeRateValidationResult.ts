export default interface ExchangeRateValidationResult {
    isValid: boolean;
    purchaseRateErrorMessage?: string;
    sellRateErrorMessage?: string;
}
