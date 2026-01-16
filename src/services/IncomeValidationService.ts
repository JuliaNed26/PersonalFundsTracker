import { IncomeSourceData } from "../models/data/IncomeSourceData";
import IncomeValidationResult from "../models/data/IncomeValidationResult";

export function validateIncomeSourceData(income: IncomeSourceData) : IncomeValidationResult {
    const name = income.name.trim();
    let incomeValidationResult: IncomeValidationResult = { isValid: true };
    validateIncomeName(name, incomeValidationResult);
    validateIncomeBalance(income.balance, incomeValidationResult); 

    return incomeValidationResult;
}

function validateIncomeName(name: string, validationResult: IncomeValidationResult) : boolean {
    const trimmedName = name.trim();
    if (!trimmedName) {
        validationResult.isValid = false;
        validationResult.nameErrorMessage = "Name is required";
        return false;
    }

    return true;
}

function validateIncomeBalance(balance: number, validationResult: IncomeValidationResult) : boolean {
    if (Number.isNaN(balance)) {
        validationResult.isValid = false;
        validationResult.balanceErrorMessage = "Balance must be a number";
        return false;
    }

    return true;
}