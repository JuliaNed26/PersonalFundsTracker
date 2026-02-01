import TransactionValidationResult from "../models/data/TransactionValidationResult";

export function validateTransactionData(transferredSum: number, sumAddToAccount: number): TransactionValidationResult {
    let validationResult: TransactionValidationResult = { isValid: true };
    validateTransferredSum(transferredSum, validationResult);
    validateSumAddToAccount(sumAddToAccount, validationResult);

    return validationResult;
}

function validateTransferredSum(sum: number, validationResult: TransactionValidationResult): boolean {
    var errorMessage = getErrorMessageForSum(sum);

    if (errorMessage) {
        validationResult.isValid = false;
        validationResult.transferredSumErrorMessage = errorMessage;
        return false;
    }
    return true;
}

function validateSumAddToAccount(sum: number, validationResult: TransactionValidationResult): boolean {
    var errorMessage = getErrorMessageForSum(sum);

    if (errorMessage) {
        validationResult.isValid = false;
        validationResult.sumAddToAccountErrorMessage = errorMessage;
        return false;
    }
    return true;
}

function getErrorMessageForSum(sum: number): string | null {
    if (Number.isNaN(sum)) {
        return "Sum must be a number";
    }

    if (sum <= 0) {
        return "Sum must be greater than 0";
    }
    return null;
}
