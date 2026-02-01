export default interface TransactionValidationResult {
    isValid: boolean;
    transferredSumErrorMessage?: string;
    sumAddToAccountErrorMessage?: string;
}
