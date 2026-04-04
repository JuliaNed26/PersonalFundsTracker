import { IncomeSourceData } from "../models/data/IncomeSourceData";
import IncomeValidationResult from "../models/data/IncomeValidationResult";

export function validateIncomeSourceData(income: IncomeSourceData) : IncomeValidationResult {
    const name = income.name.trim();
    let incomeValidationResult: IncomeValidationResult = { isValid: true };
    validateIncomeName(name, incomeValidationResult);
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

