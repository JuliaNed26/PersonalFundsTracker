import { and, eq } from 'drizzle-orm';
import { db, type DbClient } from '../index';
import { SavingGoal, savingGoals } from '../schema';
import SavingGoalEntity from '../../models/entities/SavingGoalEntity';
import SavingGoalUpdateEntity from '../../models/entities/SavingGoalUpdateEntity';
import { normalizeSavingGoalName } from '../../services/SavingGoalsNormalizationService';

function getExecutor(executor: DbClient = db): DbClient {
    return executor;
}

export function getSavingGoalById(id: number, executor: DbClient = db): SavingGoalEntity | null {
    const savingGoal = getExecutor(executor)
        .select()
        .from(savingGoals)
        .where(eq(savingGoals.id, id))
        .get() as SavingGoal | undefined;

    return savingGoal ? mapSavingGoalToEntity(savingGoal as SavingGoal) : null;
}

export async function getSavingGoalByIdAsync(id: number): Promise<SavingGoalEntity | null> {
    return getSavingGoalById(id);
}

export function getSavingGoalByNameAndCurrency(
    name: string,
    currency: number,
    executor: DbClient = db
): SavingGoalEntity | null {
    const savingGoal = getExecutor(executor)
        .select()
        .from(savingGoals)
        .where(
            and(
                eq(savingGoals.normalizedName, normalizeSavingGoalName(name)),
                eq(savingGoals.currency, currency)
            )
        )
        .get() as SavingGoal | undefined;

    return savingGoal ? mapSavingGoalToEntity(savingGoal as SavingGoal) : null;
}

export async function getSavingGoalByNameAndCurrencyAsync(
    name: string,
    currency: number
): Promise<SavingGoalEntity | null> {
    return getSavingGoalByNameAndCurrency(name, currency);
}

export function getSavingGoalsByCurrency(currency: number, executor: DbClient = db): SavingGoalEntity[] {
    const foundSavingGoals = getExecutor(executor)
        .select()
        .from(savingGoals)
        .where(eq(savingGoals.currency, currency))
        .all() as SavingGoal[];

    return foundSavingGoals.map(mapSavingGoalToEntity);
}

export async function getSavingGoalsByCurrencyAsync(currency: number): Promise<SavingGoalEntity[]> {
    return getSavingGoalsByCurrency(currency);
}

export function getAllSavingGoals(executor: DbClient = db): SavingGoalEntity[] {
    const foundSavingGoals = getExecutor(executor).select().from(savingGoals).all() as SavingGoal[];

    return foundSavingGoals.map(mapSavingGoalToEntity);
}

export async function getAllSavingGoalsAsync(): Promise<SavingGoalEntity[]> {
    return getAllSavingGoals();
}

export function insertSavingGoal(
    savingGoalToAdd: Omit<SavingGoalEntity, 'id'>
,
    executor: DbClient = db
): SavingGoalEntity {
    const row = getExecutor(executor)
        .insert(savingGoals)
        .values({
            name: savingGoalToAdd.name,
            normalizedName: savingGoalToAdd.normalizedName,
            currency: savingGoalToAdd.currency,
            monthGoal: savingGoalToAdd.monthGoal,
            totalGoal: savingGoalToAdd.totalGoal,
            totalSaved: savingGoalToAdd.totalSaved,
        })
        .returning()
        .get();
    return mapSavingGoalToEntity(row as SavingGoal);
}

export async function insertSavingGoalAsync(
    savingGoalToAdd: Omit<SavingGoalEntity, 'id'>
): Promise<SavingGoalEntity> {
    return insertSavingGoal(savingGoalToAdd);
}

export function updateSavingGoal(
    savingGoalToUpdate: SavingGoalUpdateEntity
,
    executor: DbClient = db
): SavingGoalEntity {
    const existingSavingGoal = getSavingGoalById(savingGoalToUpdate.id, executor);
    if (!existingSavingGoal) {
        throw new Error(`Saving goal with id ${savingGoalToUpdate.id} not found`);
    }

    const row = getExecutor(executor)
        .update(savingGoals)
        .set({
            name: savingGoalToUpdate.name,
            normalizedName: savingGoalToUpdate.normalizedName,
            monthGoal: savingGoalToUpdate.monthGoal,
            totalGoal: savingGoalToUpdate.totalGoal,
        })
        .where(eq(savingGoals.id, savingGoalToUpdate.id))
        .returning()
        .get();
    return mapSavingGoalToEntity(row as SavingGoal);
}

export async function updateSavingGoalAsync(
    savingGoalToUpdate: SavingGoalUpdateEntity
): Promise<SavingGoalEntity> {
    return updateSavingGoal(savingGoalToUpdate);
}

export function updateSavingGoalTotalSaved(
    id: number,
    totalSaved: number,
    executor: DbClient = db
): SavingGoalEntity {
    const row = getExecutor(executor)
        .update(savingGoals)
        .set({ totalSaved })
        .where(eq(savingGoals.id, id))
        .returning()
        .get();
    return mapSavingGoalToEntity(row as SavingGoal);
}

export async function updateSavingGoalTotalSavedAsync(
    id: number,
    totalSaved: number
): Promise<SavingGoalEntity> {
    return updateSavingGoalTotalSaved(id, totalSaved);
}

export function deleteSavingGoal(id: number, executor: DbClient = db): void {
    getExecutor(executor).delete(savingGoals).where(eq(savingGoals.id, id)).run();
}

export async function deleteSavingGoalAsync(id: number): Promise<void> {
    deleteSavingGoal(id);
}

function mapSavingGoalToEntity(savingGoal: SavingGoal): SavingGoalEntity {
    return {
        id: savingGoal.id,
        name: savingGoal.name,
        normalizedName: savingGoal.normalizedName,
        currency: savingGoal.currency,
        monthGoal: savingGoal.monthGoal,
        totalGoal: savingGoal.totalGoal,
        totalSaved: savingGoal.totalSaved,
    } as SavingGoalEntity;
}
