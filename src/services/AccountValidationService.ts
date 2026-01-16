import { AccountData } from "../models/data/AccountData";
import AccountUpdateData from "../models/data/AccountUpdateData";
import AccountValidationResult from "../models/data/AccountValidationResult";

export function validateAccountData(account: AccountData) : AccountValidationResult {
    const name = account.name.trim();
    let accountValidationResult: AccountValidationResult = { isValid: true };
    validateAccountName(name, accountValidationResult);
    validateAccountBalance(account.balance, accountValidationResult); 

    return accountValidationResult;
}

export function validateAccountUpdateData(account: AccountUpdateData) : AccountValidationResult {
    const name = account.name.trim();
    let accountValidationResult: AccountValidationResult = { isValid: true };
    validateAccountName(name, accountValidationResult);
    validateAccountBalance(account.balance, accountValidationResult); 

    return accountValidationResult;
}

function validateAccountName(name: string, validationResult: AccountValidationResult) : boolean {
    const trimmedName = name.trim();
    if (!trimmedName) {
        validationResult.isValid = false;
        validationResult.nameErrorMessage = "Name is required";
        return false;
    }

    return true;
}

function validateAccountBalance(balance: number, validationResult: AccountValidationResult) : boolean {
    if (Number.isNaN(balance)) {
        validationResult.isValid = false;
        validationResult.balanceErrorMessage = "Balance must be a number";
        return false;
    }

    return true;
}
