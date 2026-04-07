import {
    deleteSavingGoal,
    getAllSavingGoals,
    getSavingGoalById,
    deleteSavingGoalAsync as deleteSavingGoalFromDbAsync,
    getAllSavingGoalsAsync,
    getSavingGoalByIdAsync,
    getSavingGoalByNameAndCurrencyAsync,
    getSavingGoalsByCurrencyAsync as getSavingGoalsByCurrencyFromDbAsync,
    insertSavingGoalAsync,
    updateSavingGoalAsync as updateSavingGoalInDbAsync,
} from "../db/Repositories/SavingGoalsRepository";
import { db } from "../db";
import { currencyMap } from "../models/constants/CurrencyList";
import SavingGoalData from "../models/data/SavingGoalData";
import SavingGoalUpdateData from "../models/data/SavingGoalUpdateData";
import { getAccountById, updateAccountAvailableBalance } from "../db/Repositories/AccountRepositiory";
import { deleteAccountSaving, getAccountSavingsByGoalId } from "../db/Repositories/AccountSavingsRepository";
import { deleteSavingTransactionsByAccountSavingId, getCurrentMonthSavingTotalsByGoalIds } from "../db/Repositories/SavingTransactionsRepository";
import {
    mapSavingGoalDataToSavingGoalEntity,
    mapSavingGoalEntityToSavingGoalData,
    mapSavingGoalUpdateDataToSavingGoalUpdateEntity,
} from "./MapService";

export class SavingGoalDuplicateError extends Error {
    goalName: string;
    currency: number;

    constructor(goalName: string, currency: number) {
        const currencyLabel = currencyMap.get(currency) ?? `${currency}`;
        super(`Saving goal "${goalName}" already exists for ${currencyLabel}.`);
        this.name = "SavingGoalDuplicateError";
        this.goalName = goalName;
        this.currency = currency;
    }
}

export function isSavingGoalDuplicateError(error: unknown): error is SavingGoalDuplicateError {
    return error instanceof SavingGoalDuplicateError;
}

export async function getSavingGoalAsync(id: number): Promise<SavingGoalData> {
    const savingGoal = await getSavingGoalByIdAsync(id);
    if (!savingGoal) {
        throw new Error(`Saving goal with id ${id} not found`);
    }

    const monthlyTotals = getCurrentMonthSavingTotalsByGoalIds([id]);
    return {
        ...mapSavingGoalEntityToSavingGoalData(savingGoal),
        thisMonthSaved: monthlyTotals[id] ?? 0,
    };
}

export async function getSavingGoalsAsync(): Promise<SavingGoalData[]> {
    const savingGoals = await getAllSavingGoalsAsync();
    const monthlyTotals = getCurrentMonthSavingTotalsByGoalIds(savingGoals.map((goal) => goal.id));

    return savingGoals.map((savingGoal) => ({
        ...mapSavingGoalEntityToSavingGoalData(savingGoal),
        thisMonthSaved: monthlyTotals[savingGoal.id] ?? 0,
    }));
}

export async function getSavingGoalsByCurrencyAsync(currency: number): Promise<SavingGoalData[]> {
    const savingGoals = await getSavingGoalsByCurrencyFromDbAsync(currency);

    return savingGoals.map(mapSavingGoalEntityToSavingGoalData);
}

export async function addSavingGoalAsync(savingGoalToAdd: SavingGoalData): Promise<SavingGoalData> {
    const trimmedName = savingGoalToAdd.name.trim();
    await ensureSavingGoalUniqueAsync(trimmedName, savingGoalToAdd.currency);

    try {
        const addedSavingGoal = await insertSavingGoalAsync(
            mapSavingGoalDataToSavingGoalEntity({
                ...savingGoalToAdd,
                name: trimmedName,
            })
        );

        return mapSavingGoalEntityToSavingGoalData(addedSavingGoal);
    } catch (error) {
        handleDuplicateConstraintError(error, trimmedName, savingGoalToAdd.currency);
        throw error;
    }
}

export async function updateSavingGoalAsync(
    savingGoalToUpdate: SavingGoalUpdateData
): Promise<SavingGoalData> {
    const existingSavingGoal = await getSavingGoalByIdAsync(savingGoalToUpdate.id);
    if (!existingSavingGoal) {
        throw new Error(`Saving goal with id ${savingGoalToUpdate.id} not found`);
    }

    const trimmedName = savingGoalToUpdate.name.trim();
    await ensureSavingGoalUniqueAsync(trimmedName, existingSavingGoal.currency, savingGoalToUpdate.id);

    try {
        const updatedSavingGoal = await updateSavingGoalInDbAsync(
            mapSavingGoalUpdateDataToSavingGoalUpdateEntity({
                ...savingGoalToUpdate,
                name: trimmedName,
            })
        );

        return mapSavingGoalEntityToSavingGoalData(updatedSavingGoal);
    } catch (error) {
        handleDuplicateConstraintError(error, trimmedName, existingSavingGoal.currency);
        throw error;
    }
}

export async function deleteSavingGoalAsync(id: number): Promise<void> {
    db.transaction((tx) => {
        const savingGoal = getSavingGoalById(id, tx);
        if (!savingGoal) {
            throw new Error(`Saving goal with id ${id} not found`);
        }

        const linkedSavings = getAccountSavingsByGoalId(id, tx);
        for (const linkedSaving of linkedSavings) {
            const account = getAccountById(linkedSaving.accountId, tx);
            if (account) {
                updateAccountAvailableBalance(
                    account.id,
                    account.availableBalance + linkedSaving.balance,
                    tx
                );
            }

            deleteSavingTransactionsByAccountSavingId(linkedSaving.id, tx);
            deleteAccountSaving(linkedSaving.id, tx);
        }

        deleteSavingGoal(id, tx);
    });
}

async function ensureSavingGoalUniqueAsync(
    name: string,
    currency: number,
    excludedId?: number
): Promise<void> {
    const existingSavingGoal = await getSavingGoalByNameAndCurrencyAsync(name, currency);
    if (!existingSavingGoal) {
        return;
    }

    if (excludedId !== undefined && existingSavingGoal.id === excludedId) {
        return;
    }

    throw new SavingGoalDuplicateError(name, currency);
}

function handleDuplicateConstraintError(error: unknown, name: string, currency: number): void {
    if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
    ) {
        throw new SavingGoalDuplicateError(name, currency);
    }
}
