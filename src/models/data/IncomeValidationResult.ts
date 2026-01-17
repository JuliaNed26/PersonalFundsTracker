export default interface IncomeValidationResult {
    isValid: boolean;
    nameErrorMessage?: string;
    balanceErrorMessage?: string;
}