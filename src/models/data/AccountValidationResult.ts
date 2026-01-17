export default interface AccountValidationResult {
    isValid: boolean;
    nameErrorMessage?: string;
    balanceErrorMessage?: string;
}