import ExpenseTypeData from "../models/data/ExpenseTypeData";
import ExpenseTypeValidationResult from "../models/data/ExpenseTypeValidationResult";

export function validateExpenseType(expenseType: ExpenseTypeData) : ExpenseTypeValidationResult {
    const name = expenseType.name.trim();
    let expenseTypeValidationResult: ExpenseTypeValidationResult = { isValid: true };
    validateAccountName(name, expenseTypeValidationResult);
    validateAccountLimit(expenseTypeValidationResult, expenseType.limit); 

    return expenseTypeValidationResult;
}

function validateAccountName(name: string, validationResult: ExpenseTypeValidationResult) : boolean {
    const trimmedName = name.trim();
    if (!trimmedName) {
        validationResult.isValid = false;
        validationResult.nameErrorMessage = "Name is required";
        return false;
    }

    return true;
}

function validateAccountLimit(validationResult: ExpenseTypeValidationResult, limit?: number) : boolean {
    if (!limit && limit! < 0) {
        validationResult.isValid = false;
        validationResult.limitErrorMessage = "Limit cannot be negative";
        return false;
    }
    
    return true;
}