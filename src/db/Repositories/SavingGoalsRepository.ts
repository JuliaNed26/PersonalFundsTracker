import { and, eq } from 'drizzle-orm';
import { db } from '../index';
import { SavingGoal, savingGoals } from '../schema';
import SavingGoalEntity from '../../models/entities/SavingGoalEntity';
import SavingGoalUpdateEntity from '../../models/entities/SavingGoalUpdateEntity';
import { normalizeSavingGoalName } from '../../services/SavingGoalsNormalizationService';

export async function getSavingGoalByIdAsync(id: number): Promise<SavingGoalEntity | null> {
    const savingGoal = await db.query.savingGoals.findFirst({
        where: eq(savingGoals.id, id),
    });

    return savingGoal ? mapSavingGoalToEntity(savingGoal as SavingGoal) : null;
}

export async function getSavingGoalByNameAndCurrencyAsync(
    name: string,
    currency: number
): Promise<SavingGoalEntity | null> {
    const savingGoal = await db.query.savingGoals.findFirst({
        where: and(
            eq(savingGoals.normalizedName, normalizeSavingGoalName(name)),
            eq(savingGoals.currency, currency)
        ),
    });

    return savingGoal ? mapSavingGoalToEntity(savingGoal as SavingGoal) : null;
}

export async function getSavingGoalsByCurrencyAsync(currency: number): Promise<SavingGoalEntity[]> {
    const foundSavingGoals = await db.select().from(savingGoals).where(eq(savingGoals.currency, currency));

    return foundSavingGoals.map(mapSavingGoalToEntity);
}

export async function getAllSavingGoalsAsync(): Promise<SavingGoalEntity[]> {
    const foundSavingGoals = await db.select().from(savingGoals);

    return foundSavingGoals.map(mapSavingGoalToEntity);
}

export async function insertSavingGoalAsync(
    savingGoalToAdd: Omit<SavingGoalEntity, 'id'>
): Promise<SavingGoalEntity> {
    const inserted = await db
        .insert(savingGoals)
        .values({
            name: savingGoalToAdd.name,
            normalizedName: savingGoalToAdd.normalizedName,
            currency: savingGoalToAdd.currency,
            monthGoal: savingGoalToAdd.monthGoal,
            totalGoal: savingGoalToAdd.totalGoal,
        })
        .returning();

    const row = Array.isArray(inserted) ? inserted[0] : inserted;
    return mapSavingGoalToEntity(row as SavingGoal);
}

export async function updateSavingGoalAsync(
    savingGoalToUpdate: SavingGoalUpdateEntity
): Promise<SavingGoalEntity> {
    const updated = await db
        .update(savingGoals)
        .set({
            name: savingGoalToUpdate.name,
            normalizedName: savingGoalToUpdate.normalizedName,
            monthGoal: savingGoalToUpdate.monthGoal,
            totalGoal: savingGoalToUpdate.totalGoal,
        })
        .where(eq(savingGoals.id, savingGoalToUpdate.id))
        .returning();

    const row = Array.isArray(updated) ? updated[0] : updated;
    return mapSavingGoalToEntity(row as SavingGoal);
}

export async function deleteSavingGoalAsync(id: number): Promise<void> {
    await db.delete(savingGoals).where(eq(savingGoals.id, id));
}

function mapSavingGoalToEntity(savingGoal: SavingGoal): SavingGoalEntity {
    return {
        id: savingGoal.id,
        name: savingGoal.name,
        normalizedName: savingGoal.normalizedName,
        currency: savingGoal.currency,
        monthGoal: savingGoal.monthGoal,
        totalGoal: savingGoal.totalGoal,
    } as SavingGoalEntity;
}
