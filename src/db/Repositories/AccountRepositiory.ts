import { db, type DbClient } from '../index';
import { AccountEntity } from "../../models/entities/AccountEntity";
import { Account, accounts } from '../schema';
import { eq } from 'drizzle-orm';
import { AccountUpdateEntity } from '../../models/entities/AccountUpdateEntity';

function getExecutor(executor: DbClient = db): DbClient {
  return executor;
}

function mapAccountToEntity(account: Account): AccountEntity {
  return {
    id: account.id,
    name: account.name,
    balance: account.balance,
    availableBalance: account.availableBalance,
    currency: account.currency,
    includeToTotalBalance: account.includeToTotalBalance,
  } as AccountEntity;
}

export function getAllAccounts(executor: DbClient = db): AccountEntity[] {
  const foundAccounts = getExecutor(executor).select().from(accounts).all() as Account[];
  return foundAccounts.map(mapAccountToEntity);
}

export async function getAllAccountsAsync() : Promise<AccountEntity[]> 
{
    return getAllAccounts();
}

export function getAccountById(id: number, executor: DbClient = db) : AccountEntity | null 
{
    const account = getExecutor(executor)
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .get() as Account | undefined;

    return !account 
      ? null 
      : mapAccountToEntity(account);
}

export async function getAccountByIdAsync(id: number) : Promise<AccountEntity | null> 
{
    return getAccountById(id);
}

export function insertAccount(accountData: Omit<AccountEntity, 'id'>, executor: DbClient = db) : AccountEntity 
{
    const row = getExecutor(executor).insert(accounts).values({
      name: accountData.name,
      currency: accountData.currency,
      balance: accountData.balance,
      availableBalance: accountData.availableBalance,
      includeToTotalBalance: accountData.includeToTotalBalance,
    }).returning().get();

    return mapAccountToEntity(row as Account);
}

export async function insertAccountAsync(accountData: Omit<AccountEntity, 'id'>) : Promise<AccountEntity> 
{
    return insertAccount(accountData);
}

export function updateAccount(
  accountData: AccountUpdateEntity & { availableBalance: number },
  executor: DbClient = db
) : AccountEntity 
{
    const row = getExecutor(executor).update(accounts).set({
      name: accountData.name,
      balance: accountData.balance,
      availableBalance: accountData.availableBalance,
      includeToTotalBalance: accountData.includeToTotalBalance,
    }).where(eq(accounts.id, accountData.id)).returning().get();
    return mapAccountToEntity(row as Account);
}

export async function updateAccountAsync(
  accountData: AccountUpdateEntity & { availableBalance: number }
) : Promise<AccountEntity> 
{
    return updateAccount(accountData);
}

export function deleteAccount(id: number, executor: DbClient = db) : void {
  getExecutor(executor).delete(accounts).where(eq(accounts.id, id)).run();
}

export async function deleteAccountAsync(id: number) : Promise<void> {
  deleteAccount(id);
}

export function updateAccountBalances(
  id: number,
  newBalance: number,
  newAvailableBalance: number,
  executor: DbClient = db
): AccountEntity {
  const row = getExecutor(executor).update(accounts).set({
    balance: newBalance,
    availableBalance: newAvailableBalance,
  }).where(eq(accounts.id, id)).returning().get();
  return mapAccountToEntity(row as Account);
}

export async function updateAccountBalancesAsync(
  id: number,
  newBalance: number,
  newAvailableBalance: number
): Promise<AccountEntity> {
  return updateAccountBalances(id, newBalance, newAvailableBalance);
}

export function updateAccountAvailableBalance(
  id: number,
  newAvailableBalance: number,
  executor: DbClient = db
): AccountEntity {
  const row = getExecutor(executor).update(accounts).set({
    availableBalance: newAvailableBalance,
  }).where(eq(accounts.id, id)).returning().get();
  return mapAccountToEntity(row as Account);
}

export async function updateAccountAvailableBalanceAsync(
  id: number,
  newAvailableBalance: number
): Promise<AccountEntity> {
  return updateAccountAvailableBalance(id, newAvailableBalance);
}

export async function updateAccountBalanceAsync(id: number, newBalance: number) : Promise<AccountEntity> {
  return updateAccountBalances(id, newBalance, newBalance);
}
