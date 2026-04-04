export default interface SavingGoalValidationResult {
    isValid: boolean;
    nameErrorMessage?: string;
    monthGoalErrorMessage?: string;
    totalGoalErrorMessage?: string;
}
