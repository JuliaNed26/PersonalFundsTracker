import SavingGoalData from "../models/data/SavingGoalData";
import SavingGoalUpdateData from "../models/data/SavingGoalUpdateData";
import SavingGoalValidationResult from "../models/data/SavingGoalValidationResult";

export function validateSavingGoalData(savingGoal: SavingGoalData): SavingGoalValidationResult {
    return validateSavingGoal({
        name: savingGoal.name,
        monthGoal: savingGoal.monthGoal,
        totalGoal: savingGoal.totalGoal,
    });
}

export function validateSavingGoalUpdateData(savingGoal: SavingGoalUpdateData): SavingGoalValidationResult {
    return validateSavingGoal({
        name: savingGoal.name,
        monthGoal: savingGoal.monthGoal,
        totalGoal: savingGoal.totalGoal,
    });
}

function validateSavingGoal(savingGoal: {
    name: string;
    monthGoal: number;
    totalGoal: number;
}): SavingGoalValidationResult {
    const validationResult: SavingGoalValidationResult = { isValid: true };

    validateSavingGoalName(savingGoal.name, validationResult);
    validateGoalAmount(savingGoal.monthGoal, "month", validationResult);
    validateGoalAmount(savingGoal.totalGoal, "total", validationResult);

    return validationResult;
}

function validateSavingGoalName(
    name: string,
    validationResult: SavingGoalValidationResult
): boolean {
    const trimmedName = name.trim();
    if (!trimmedName) {
        validationResult.isValid = false;
        validationResult.nameErrorMessage = "Name is required";
        return false;
    }

    return true;
}

function validateGoalAmount(
    amount: number,
    type: "month" | "total",
    validationResult: SavingGoalValidationResult
): boolean {
    if (Number.isNaN(amount) || !Number.isFinite(amount)) {
        validationResult.isValid = false;

        if (type === "month") {
            validationResult.monthGoalErrorMessage = "Per month goal must be a number";
        } else {
            validationResult.totalGoalErrorMessage = "Total goal must be a number";
        }

        return false;
    }

    if (amount <= 0) {
        validationResult.isValid = false;

        if (type === "month") {
            validationResult.monthGoalErrorMessage = "Per month goal must be greater than 0";
        } else {
            validationResult.totalGoalErrorMessage = "Total goal must be greater than 0";
        }

        return false;
    }

    return true;
}
