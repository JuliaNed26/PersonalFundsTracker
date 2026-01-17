import { db } from '../index';
import { AccountEntity } from "../../models/entities/AccountEntity";
import { Account, accounts } from '../schema';
import { eq } from 'drizzle-orm';
import { AccountUpdateEntity } from '../../models/entities/AccountUpdateEntity';

export async function getAllAccountsAsync() : Promise<AccountEntity[]> 
{
    const foundAccounts = (await db.select().from(accounts)) as Account[];

    return foundAccounts.map((account: Account) => (
    {
      id: account.id,
      name: account.name,
      balance: account.balance,
      currency: account.currency,
      includeToTotalBalance: account.includeToTotalBalance,
    })) as AccountEntity[];
}

export async function getAccountByIdAsync(id: number) : Promise<AccountEntity | null> 
{
    var account = (
      await db.query.accounts.findFirst({
        where: eq(accounts.id, id),
      })
    ) as Account;

    return !account 
      ? null 
      : ({
        id: account.id,
        name: account.name,
        balance: account.balance,
        currency: account.currency,
        includeToTotalBalance: account.includeToTotalBalance,
      } as AccountEntity);
}

export async function insertAccountAsync(accountData: Omit<AccountEntity, 'id'>) : Promise<AccountEntity> 
{
    const inserted = await db.insert(accounts).values({
      name: accountData.name,
      currency: accountData.currency,
      balance: accountData.balance,
      includeToTotalBalance: accountData.includeToTotalBalance,
    }).returning();

    const row = Array.isArray(inserted) ? inserted[0] : inserted;
    return row as AccountEntity;
}

export async function updateAccountAsync(accountData: AccountUpdateEntity) : Promise<AccountEntity> 
{
    const updated = await db.update(accounts).set({
      name: accountData.name,
      balance: accountData.balance,
      includeToTotalBalance: accountData.includeToTotalBalance,
    }).where(eq(accounts.id, accountData.id)).returning();

    const row = Array.isArray(updated) ? updated[0] : updated;
    return row as AccountEntity;
}

export async function deleteAccountAsync(id: number) : Promise<void> {
  await db.delete(accounts).where(eq(accounts.id, id));
}