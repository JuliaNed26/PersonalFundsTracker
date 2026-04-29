import { db } from "../db";
import {
    getAccountSavingByAccountAndGoal,
    getAccountSavingById,
    getAccountSavingsByAccountId,
    insertAccountSaving,
    updateAccountSavingBalance,
    deleteAccountSaving,
} from "../db/repositories/AccountSavingsRepository";
import {
    getCurrentMonthSavingTotalsByAccountSavingIds,
    insertSavingTransaction,
    deleteSavingTransactionsByAccountSavingId,
} from "../db/repositories/SavingTransactionsRepository";
import {
    getSavingGoalById,
    getSavingGoalsByCurrency,
    updateSavingGoalTotalSaved,
} from "../db/repositories/SavingGoalsRepository";
import {
    getAccountById,
    updateAccountAvailableBalance,
} from "../db/repositories/AccountRepositiory";
import AccountSavingData from "../models/data/AccountSavingData";
import SavingGoalData from "../models/data/SavingGoalData";
import {
    mapAccountSavingEntityToAccountSavingData,
    mapSavingGoalEntityToSavingGoalData,
} from "./MapService";
import { getTodayLocalDate } from "./DateService";

function validateAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Amount must be greater than 0");
    }
}

export async function getAccountSavingsWithDetailsAsync(accountId: number): Promise<AccountSavingData[]> {
    const linkedSavings = getAccountSavingsByAccountId(accountId);
    const monthlyTotals = getCurrentMonthSavingTotalsByAccountSavingIds(
        linkedSavings.map((saving) => saving.id)
    );

    return linkedSavings.map((linkedSaving) =>
        mapAccountSavingEntityToAccountSavingData(
            linkedSaving,
            linkedSaving.savingGoalName,
            monthlyTotals[linkedSaving.id] ?? 0
        )
    );
}

export async function getAvailableGoalsForAccountAsync(accountId: number): Promise<SavingGoalData[]> {
    const account = getAccountById(accountId);
    if (!account) {
        throw new Error(`Account with id ${accountId} not found`);
    }

    const existingLinks = new Set(
        getAccountSavingsByAccountId(accountId).map((saving) => saving.savingGoalId)
    );

    return getSavingGoalsByCurrency(account.currency)
        .filter((goal) => !existingLinks.has(goal.id))
        .map(mapSavingGoalEntityToSavingGoalData);
}

export async function addSavingToAccountAsync(accountId: number, savingGoalId: number): Promise<void> {
    db.transaction((tx) => {
        const account = getAccountById(accountId, tx);
        if (!account) {
            throw new Error(`Account with id ${accountId} not found`);
        }

        const savingGoal = getSavingGoalById(savingGoalId, tx);
        if (!savingGoal) {
            throw new Error(`Saving goal with id ${savingGoalId} not found`);
        }

        if (savingGoal.currency !== account.currency) {
            throw new Error("Currency mismatch");
        }

        if (getAccountSavingByAccountAndGoal(accountId, savingGoalId, tx)) {
            throw new Error("This saving goal is already linked to this account");
        }

        insertAccountSaving(accountId, savingGoalId, tx);
    });
}

export async function depositToSavingAsync(accountSavingId: number, amount: number): Promise<void> {
    validateAmount(amount);

    db.transaction((tx) => {
        const accountSaving = getAccountSavingById(accountSavingId, tx);
        if (!accountSaving) {
            throw new Error(`Saving link with id ${accountSavingId} not found`);
        }

        const account = getAccountById(accountSaving.accountId, tx);
        const savingGoal = getSavingGoalById(accountSaving.savingGoalId, tx);

        if (!account || !savingGoal) {
            throw new Error("Saving link is missing related data");
        }

        if (account.availableBalance < amount) {
            throw new Error("Insufficient available balance");
        }

        updateAccountAvailableBalance(
            account.id,
            account.availableBalance - amount,
            tx
        );
        updateAccountSavingBalance(
            accountSaving.id,
            accountSaving.balance + amount,
            tx
        );
        updateSavingGoalTotalSaved(
            savingGoal.id,
            savingGoal.totalSaved + amount,
            tx
        );
        insertSavingTransaction(accountSaving.id, amount, getTodayLocalDate(), tx);
    });
}

export async function withdrawFromSavingAsync(accountSavingId: number, amount: number): Promise<void> {
    validateAmount(amount);

    db.transaction((tx) => {
        const accountSaving = getAccountSavingById(accountSavingId, tx);
        if (!accountSaving) {
            throw new Error(`Saving link with id ${accountSavingId} not found`);
        }

        const account = getAccountById(accountSaving.accountId, tx);
        const savingGoal = getSavingGoalById(accountSaving.savingGoalId, tx);

        if (!account || !savingGoal) {
            throw new Error("Saving link is missing related data");
        }

        if (accountSaving.balance < amount) {
            throw new Error("Insufficient saving balance");
        }

        updateAccountAvailableBalance(
            account.id,
            account.availableBalance + amount,
            tx
        );
        updateAccountSavingBalance(
            accountSaving.id,
            accountSaving.balance - amount,
            tx
        );
        updateSavingGoalTotalSaved(
            savingGoal.id,
            savingGoal.totalSaved - amount,
            tx
        );
        insertSavingTransaction(accountSaving.id, -amount, getTodayLocalDate(), tx);
    });
}

export async function removeSavingFromAccountAsync(accountSavingId: number): Promise<void> {
    db.transaction((tx) => {
        const accountSaving = getAccountSavingById(accountSavingId, tx);
        if (!accountSaving) {
            throw new Error(`Saving link with id ${accountSavingId} not found`);
        }

        const account = getAccountById(accountSaving.accountId, tx);
        const savingGoal = getSavingGoalById(accountSaving.savingGoalId, tx);

        if (!account || !savingGoal) {
            throw new Error("Saving link is missing related data");
        }

        updateAccountAvailableBalance(
            account.id,
            account.availableBalance + accountSaving.balance,
            tx
        );
        updateSavingGoalTotalSaved(
            savingGoal.id,
            savingGoal.totalSaved - accountSaving.balance,
            tx
        );
        deleteSavingTransactionsByAccountSavingId(accountSaving.id, tx);
        deleteAccountSaving(accountSaving.id, tx);
    });
}
