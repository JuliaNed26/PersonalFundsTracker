import { and, eq } from "drizzle-orm";
import { db, type DbClient } from "../index";
import { accountSavings, type AccountSaving, savingGoals } from "../schema";
import AccountSavingEntity from "../../models/entities/AccountSavingEntity";

export interface AccountSavingDetailsRow extends AccountSavingEntity {
    savingGoalName: string;
    currency: number;
}

function getExecutor(executor: DbClient = db): DbClient {
    return executor;
}

function mapAccountSavingToEntity(accountSaving: AccountSaving): AccountSavingEntity {
    return {
        id: accountSaving.id,
        accountId: accountSaving.accountId,
        savingGoalId: accountSaving.savingGoalId,
        balance: accountSaving.balance,
    } as AccountSavingEntity;
}

export function getAccountSavingsByAccountId(
    accountId: number,
    executor: DbClient = db
): AccountSavingDetailsRow[] {
    const rows = getExecutor(executor)
        .select({
            id: accountSavings.id,
            accountId: accountSavings.accountId,
            savingGoalId: accountSavings.savingGoalId,
            balance: accountSavings.balance,
            savingGoalName: savingGoals.name,
            currency: savingGoals.currency,
        })
        .from(accountSavings)
        .innerJoin(savingGoals, eq(accountSavings.savingGoalId, savingGoals.id))
        .where(eq(accountSavings.accountId, accountId))
        .all();

    return rows.map((row) => ({
        id: row.id,
        accountId: row.accountId,
        savingGoalId: row.savingGoalId,
        balance: row.balance,
        savingGoalName: row.savingGoalName,
        currency: row.currency,
    }));
}

export function getAccountSavingById(
    id: number,
    executor: DbClient = db
): AccountSavingEntity | null {
    const row = getExecutor(executor)
        .select()
        .from(accountSavings)
        .where(eq(accountSavings.id, id))
        .get() as AccountSaving | undefined;

    return row ? mapAccountSavingToEntity(row) : null;
}

export function getAccountSavingByAccountAndGoal(
    accountId: number,
    savingGoalId: number,
    executor: DbClient = db
): AccountSavingEntity | null {
    const row = getExecutor(executor)
        .select()
        .from(accountSavings)
        .where(
            and(
                eq(accountSavings.accountId, accountId),
                eq(accountSavings.savingGoalId, savingGoalId)
            )
        )
        .get() as AccountSaving | undefined;

    return row ? mapAccountSavingToEntity(row) : null;
}

export function getAccountSavingsByGoalId(
    savingGoalId: number,
    executor: DbClient = db
): AccountSavingEntity[] {
    const rows = getExecutor(executor)
        .select()
        .from(accountSavings)
        .where(eq(accountSavings.savingGoalId, savingGoalId))
        .all() as AccountSaving[];

    return rows.map(mapAccountSavingToEntity);
}

export function insertAccountSaving(
    accountId: number,
    savingGoalId: number,
    executor: DbClient = db
): AccountSavingEntity {
    const row = getExecutor(executor)
        .insert(accountSavings)
        .values({
            accountId,
            savingGoalId,
            balance: 0,
        })
        .returning()
        .get();
    return mapAccountSavingToEntity(row as AccountSaving);
}

export function updateAccountSavingBalance(
    id: number,
    newBalance: number,
    executor: DbClient = db
): AccountSavingEntity {
    const row = getExecutor(executor)
        .update(accountSavings)
        .set({ balance: newBalance })
        .where(eq(accountSavings.id, id))
        .returning()
        .get();
    return mapAccountSavingToEntity(row as AccountSaving);
}

export function deleteAccountSaving(id: number, executor: DbClient = db): void {
    getExecutor(executor).delete(accountSavings).where(eq(accountSavings.id, id)).run();
}

export function deleteAccountSavingsByGoalId(
    savingGoalId: number,
    executor: DbClient = db
): void {
    getExecutor(executor).delete(accountSavings).where(eq(accountSavings.savingGoalId, savingGoalId)).run();
}

export function deleteAccountSavingsByAccountId(
    accountId: number,
    executor: DbClient = db
): void {
    getExecutor(executor).delete(accountSavings).where(eq(accountSavings.accountId, accountId)).run();
}
