export default interface ExpenseTypeValidationResult {
    isValid: boolean;
    nameErrorMessage?: string;
    limitErrorMessage?: string;
}