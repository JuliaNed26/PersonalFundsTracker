# Savings-to-Account Linking — Implementation Plan

## Table of Contents
1. [Overview](#overview)
2. [Database Changes](#1-database-changes)
3. [Repositories](#2-repositories)
4. [Services](#3-services)
5. [UI: Home Screen Changes](#4-ui-home-screen-changes)
6. [UI: Account Savings Screen (New)](#5-ui-account-savings-screen-new)
7. [UI: Saving Goals Screen Updates](#6-ui-saving-goals-screen-updates)
8. [Navigation Updates](#7-navigation-updates)
9. [Calculation Examples](#8-calculation-examples-full-walkthrough)
10. [Edge Cases & Validation](#9-edge-cases--validation)
11. [Implementation Order](#10-implementation-order)

---

## Overview

Each account can have multiple savings linked to it. Savings are based on saving goal types and must share the same currency as the account. Users can transfer money between the account's available balance and its savings. The account displays two balances: **available** (for spending) and **total** (available + all savings).

---

## 1. Database Changes

### 1.1 Migration: Alter `accounts` table

Rename the existing `balance` column to `availableBalance` and add a `totalBalance` column.

**Since SQLite doesn't support `RENAME COLUMN` in older versions**, the safest approach is:
1. Add a new column `totalBalance` (real, default 0)
2. Add a new column `availableBalance` (real, default 0)
3. Copy current `balance` values into `availableBalance` and `totalBalance` (initially they are the same — no savings exist yet)
4. The old `balance` column can be left unused (SQLite doesn't support DROP COLUMN easily) or handled via table recreation.

**Simpler alternative** (recommended): Keep `balance` as `totalBalance` semantically and add `availableBalance`:
```sql
ALTER TABLE accounts ADD COLUMN availableBalance REAL NOT NULL DEFAULT 0;
UPDATE accounts SET availableBalance = balance;
```

Then in schema.ts, `balance` becomes the total balance and `availableBalance` is the new field. This avoids table recreation. Update all code that reads `balance` to understand the difference.

**Schema change in `schema.ts`:**
```typescript
export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  balance: real('balance').notNull().default(0),             // total balance (unchanged column)
  availableBalance: real('availableBalance').notNull().default(0), // NEW
  currency: integer('currency').notNull(),
  includeToTotalBalance: integer('includeToTotalBalance', {mode: 'boolean'}).notNull().default(true),
});
```

### 1.2 Migration: Add `accountSavings` table

This is the join table linking accounts to saving goal types.

```sql
CREATE TABLE accountSavings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accountId INTEGER NOT NULL REFERENCES accounts(id),
  savingGoalId INTEGER NOT NULL REFERENCES savingGoals(id),
  balance REAL NOT NULL DEFAULT 0,
  UNIQUE(accountId, savingGoalId)
);
```

**Schema in `schema.ts`:**
```typescript
export const accountSavings = sqliteTable(
  'accountSavings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('accountId').notNull().references(() => accounts.id),
    savingGoalId: integer('savingGoalId').notNull().references(() => savingGoals.id),
    balance: real('balance').notNull().default(0),
  },
  (table) => ({
    accountSavingUnique: unique('accountSavings_account_goal_unique').on(
      table.accountId,
      table.savingGoalId
    ),
  })
);
```

### 1.3 Migration: Add `savingTransactions` table

Records every transfer between account ↔ saving.

```sql
CREATE TABLE savingTransactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accountSavingId INTEGER NOT NULL REFERENCES accountSavings(id),
  sum REAL NOT NULL,        -- positive = account→saving, negative = saving→account
  date TEXT NOT NULL
);
```

**Schema in `schema.ts`:**
```typescript
export const savingTransactions = sqliteTable('savingTransactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountSavingId: integer('accountSavingId').notNull().references(() => accountSavings.id),
  sum: real('sum').notNull(),   // positive = deposit to saving, negative = withdraw from saving
  date: text('date').notNull(),
});
```

### 1.4 Migration: Add `totalSaved` to `savingGoals` table

To optimize total goal calculations, store a running balance on the saving goal itself.

```sql
ALTER TABLE savingGoals ADD COLUMN totalSaved REAL NOT NULL DEFAULT 0;
```

**Updated schema:**
```typescript
export const savingGoals = sqliteTable('savingGoals', {
  // ... existing fields ...
  totalSaved: real('totalSaved').notNull().default(0),  // NEW: running total across all accounts
});
```

### Summary of new/changed tables:

| Table | Change |
|-------|--------|
| `accounts` | Add `availableBalance` column |
| `accountSavings` | **New table** — links account ↔ savingGoal with balance |
| `savingTransactions` | **New table** — records each transfer |
| `savingGoals` | Add `totalSaved` column |

---

## 2. Repositories

### 2.1 `AccountSavingRepository.ts` (new file)

```
src/db/Repositories/AccountSavingRepository.ts
```

**Functions:**
- `getAccountSavingsAsync(accountId: number)` → returns all accountSavings rows for an account, joined with savingGoal name/currency
- `getAccountSavingByIdAsync(id: number)` → single accountSaving
- `getAccountSavingByAccountAndGoalAsync(accountId, savingGoalId)` → check for duplicates
- `insertAccountSavingAsync(accountId, savingGoalId)` → create link with balance 0
- `updateAccountSavingBalanceAsync(id, newBalance)` → update balance
- `deleteAccountSavingAsync(id)` → delete the link
- `deleteAccountSavingsByGoalIdAsync(savingGoalId)` → delete all links for a goal (when goal is deleted)
- `getAccountSavingsByGoalIdAsync(savingGoalId)` → get all accounts linked to a goal

### 2.2 `SavingTransactionRepository.ts` (new file)

```
src/db/Repositories/SavingTransactionRepository.ts
```

**Functions:**
- `insertSavingTransactionAsync(accountSavingId, sum, date)` → insert a transaction
- `getSavingTransactionsForAccountSavingAsync(accountSavingId)` → all transactions for one account-saving link
- `getSavingTransactionsForGoalCurrentMonthAsync(savingGoalId)` → all transactions this month across all accounts for a goal
- `deleteSavingTransactionsByAccountSavingIdAsync(accountSavingId)` → cascade delete when saving removed from account
- `deleteSavingTransactionsByGoalIdAsync(savingGoalId)` → cascade delete when goal deleted

### 2.3 Updates to existing repositories

**`AccountRepository.ts`:**
- `updateAccountAvailableBalanceAsync(id, newAvailableBalance)` → update only availableBalance
- Update existing functions that read accounts to include `availableBalance`

---

## 3. Services

### 3.1 `AccountSavingService.ts` (new file)

```
src/services/AccountSavingService.ts
```

**Functions:**

#### `getAccountSavingsWithDetailsAsync(accountId)`
Returns list of savings for an account with:
- saving goal name
- saving balance (on this account)
- this month's saved amount (sum of transactions this month)
- total saved since beginning (= accountSaving.balance)

#### `getAvailableGoalsForAccountAsync(accountId, accountCurrency)`
Returns saving goals that:
1. Have the same currency as the account
2. Are NOT already linked to this account

#### `addSavingToAccountAsync(accountId, savingGoalId)`
Validates:
- Same currency check
- Not already linked
Creates the accountSaving record.

#### `depositToSavingAsync(accountSavingId, amount)`
Transfer from account → saving:
1. Validate `amount > 0`
2. Load accountSaving → get accountId
3. Load account → check `availableBalance >= amount`
4. **In a transaction:**
   - `account.availableBalance -= amount` (total unchanged)
   - `accountSaving.balance += amount`
   - `savingGoal.totalSaved += amount`
   - Insert savingTransaction with `sum = +amount`

#### `withdrawFromSavingAsync(accountSavingId, amount)`
Transfer from saving → account:
1. Validate `amount > 0`
2. Load accountSaving → check `balance >= amount`
3. **In a transaction:**
   - `account.availableBalance += amount` (total unchanged)
   - `accountSaving.balance -= amount`
   - `savingGoal.totalSaved -= amount`
   - Insert savingTransaction with `sum = -amount`

#### `removeSavingFromAccountAsync(accountSavingId)`
Remove a saving from an account:
1. Load accountSaving → get balance, accountId, savingGoalId
2. **In a transaction:**
   - `account.availableBalance += accountSaving.balance` (return saved money)
   - `account.balance` unchanged (total stays same)
   - `savingGoal.totalSaved -= accountSaving.balance`
   - Delete all savingTransactions for this accountSavingId
   - Delete the accountSaving record

### 3.2 Updates to existing services

**`AccountService.ts`:**
- `getAccountAsync()` now returns `availableBalance` alongside `balance` (total)
- `calculateTotalBalanceAsync()` should use `balance` (total) since it represents all money in the account including savings
- When creating a new account: set `availableBalance = balance` (initial total = available, no savings yet)

**`SavingGoalsService.ts`:**
- `deleteSavingGoalAsync(id)` must now also:
  1. Find all accountSavings linked to this goal
  2. For each: return `accountSaving.balance` to `account.availableBalance`
  3. Delete all savingTransactions for those accountSavings
  4. Delete all accountSavings for this goal
  5. Then delete the goal itself

- `getSavingGoalsAsync()` now returns **both** `totalSaved` (from database) **and** `thisMonthSaved` (calculated: sum of all savingTransactions for this goal where date is in the current month, across all accounts). Both values are returned as fields on each `SavingGoalData` object so the UI can render both progress bars immediately without additional calls

**`ExpenseTransactionService.ts` / `AccountTransferService.ts`:**
- When creating expense transactions: validate against `availableBalance` (not `balance`), then decrease **both** `availableBalance` and `balance` (total) by the expense amount
- When creating account-to-account transfers: validate source `availableBalance >= sumSent`, then decrease **both** `availableBalance` and `balance` (total) on source, increase **both** on target

**`IncomeTransactionService.ts`:**
- When adding income to account: increase **both** `balance` and `availableBalance`

**`MapService.ts`:**
- Update `mapAccountEntityToAccountData` to include `availableBalance`
- Add mapping functions for accountSaving entities/data

### 3.3 Data models (new/updated)

**`AccountData.ts`** — add field:
```typescript
interface AccountData {
  id: number;
  name: string;
  balance: number;            // total balance
  availableBalance: number;   // NEW: available for spending
  currency: number;
  includeToTotalBalance: boolean;
}
```

**`AccountSavingData.ts`** (new):
```typescript
interface AccountSavingData {
  id: number;
  accountId: number;
  savingGoalId: number;
  savingGoalName: string;
  balance: number;            // saved amount on this account
  thisMonthSaved: number;     // sum of transactions this month
}
```

**`SavingGoalData.ts`** — add field:
```typescript
interface SavingGoalData {
  // ... existing fields ...
  totalSaved: number;         // NEW: running total across all accounts
  thisMonthSaved: number;     // calculated at query time
}
```

---

## 4. UI: Home Screen Changes

### 4.1 Account CircleItem — show two balances

Currently `CircleItem` shows one `balance` line. Change to show:
- **Line 1 (bold):** available balance (what user can spend)
- **Line 2 (normal weight):** total balance

Update `CircleItem.tsx` to accept an optional `secondaryBalance` prop:
```
Available: 8,000.00 UAH    ← bold
Total: 10,000.00 UAH       ← normal
```

### 4.2 Account long-press modal — add "Watch Savings" button

In `AccountsSection.tsx`, the existing modal has 3 buttons: Update, Delete, Watch Transactions.
Add a 4th option: **"Watch Savings"**.

Since the current `Modal` component supports max 3 buttons:
- Create a dedicated `AccountActionsModal` component with a list-style layout

When pressed → navigate to `AccountSavingsScreen` with `accountId` param.

### 4.3 Expense/Transfer validation

When user creates an expense from an account or transfers to another account, the validation should check against `availableBalance` instead of `balance`.

---

## 5. UI: Account Savings Screen (New)

### File: `app/AccountSavingsScreen.tsx`

**Header:**
- Account name as title
- Back button (arrow)

**List of savings:**
Each row shows:
```
┌──────────────────────────────────────────────────────┐
│ Trips                    this month: 1,000 UAH       │
│                            total: 125,000 UAH    + ≫ │
├──────────────────────────────────────────────────────┤
│ Flat                     this month: 5,000 UAH       │
│                            total: 100,000 UAH    + ≫ │
└──────────────────────────────────────────────────────┘
```

**Buttons per saving row:**
- **`+` button (green circle):** Opens a modal/input to deposit money FROM account TO this saving. User enters an amount. Validates: amount ≤ account.availableBalance.
- **`≫` button (green circle):** Opens a modal/input to withdraw money FROM this saving TO account. User enters an amount. Validates: amount ≤ accountSaving.balance.

**Delete saving from account:**
- Trash-bin button near `≫` button → modal with "Remove saving" option
- On removal: balance returned to account's availableBalance, transactions deleted

**Bottom button:**
- **"+ Add saving"** → Opens a modal/new screen showing available saving goal types (same currency, not already linked)

### File: `app/components/SavingTransferModal.tsx` (new)

Simple modal with:
- Text explaining the action ("Deposit to Trips" / "Withdraw from Trips")
- Single amount input field
- Save / Cancel buttons
- Validation message if amount exceeds limit

---

## 6. UI: Saving Goals Screen Updates

### File: `app/SavingGoalsScreen.tsx`

Currently shows `EMPTY_SAVED_AMOUNT = 0` for both progress bars. Update to:

**"This month" bar:**
- `savedAmount` = sum of all `savingTransactions` this month for this `savingGoalId` (across all accounts)
- This includes both positive (deposits) and negative (withdrawals) transactions
- Progress bar is clamped to 0–100%: if net monthly is negative → 0%, if exceeds goal → 100%. The text label always shows the real value (can be negative)

**"Total" bar:**
- `savedAmount` = `savingGoal.totalSaved` from the database (pre-calculated running total)
- Same clamping: 0–100% on bar, real value in text

**On deleting a saving goal:**
- Now must cascade: return balances to accounts, delete accountSavings, delete transactions, then delete goal

---

## 7. Navigation Updates

### `app/_layout.tsx`

Add new screen:
```typescript
Stack.Screen(name="AccountSavingsScreen")
```

---

## 8. Calculation Examples (Full Walkthrough)

### Setup

**Accounts:**
| Account | Currency | Total Balance | Available Balance |
|---------|----------|--------------|-------------------|
| Main    | UAH      | 50,000       | 50,000            |
| Salary  | UAH      | 30,000       | 30,000            |
| USD Acc | USD      | 2,000        | 2,000             |

**Saving Goals:**
| Goal    | Currency | Monthly Goal | Total Goal | Total Saved |
|---------|----------|-------------|------------|-------------|
| Trips   | UAH      | 3,000       | 100,000    | 0           |
| Flat    | UAH      | 10,000      | 500,000    | 0           |
| Emergency | USD    | 200         | 5,000      | 0           |

---

### Step 1: Link "Trips" saving to "Main" account

- Creates `accountSaving(accountId=Main, savingGoalId=Trips, balance=0)`
- No balance changes

**State after:**
| Account | Total | Available |
|---------|-------|-----------|
| Main    | 50,000 | 50,000  |

---

### Step 2: Link "Flat" saving to "Main" account

- Creates `accountSaving(accountId=Main, savingGoalId=Flat, balance=0)`

---

### Step 3: Link "Trips" saving to "Salary" account

- Creates `accountSaving(accountId=Salary, savingGoalId=Trips, balance=0)`
- Note: "Trips" is now linked to TWO accounts (Main and Salary)

---

### Step 4: User deposits 5,000 UAH to "Trips" from "Main" account (date: 2026-04-05)

**Validation:** Main.availableBalance (50,000) >= 5,000 ✓

**Transaction:**
- `savingTransaction(accountSavingId=Main-Trips, sum=+5000, date=2026-04-05)`
- `accountSaving(Main-Trips).balance`: 0 → 5,000
- `Main.availableBalance`: 50,000 → 45,000
- `Main.balance (total)`: 50,000 → 50,000 (unchanged!)
- `savingGoal(Trips).totalSaved`: 0 → 5,000

**State after:**
| Account | Total  | Available |
|---------|--------|-----------|
| Main    | 50,000 | 45,000    |
| Salary  | 30,000 | 30,000    |

| Main's Savings | Balance | This Month |
|---------------|---------|------------|
| Trips         | 5,000   | 5,000      |
| Flat          | 0       | 0          |

| Saving Goal | Monthly (this month) | Total Saved |
|-------------|---------------------|-------------|
| Trips       | 5,000 / 3,000       | 5,000 / 100,000 |
| Flat        | 0 / 10,000          | 0 / 500,000 |

---

### Step 5: User deposits 2,000 UAH to "Trips" from "Salary" account (date: 2026-04-10)

**Validation:** Salary.availableBalance (30,000) >= 2,000 ✓

**Transaction:**
- `savingTransaction(accountSavingId=Salary-Trips, sum=+2000, date=2026-04-10)`
- `accountSaving(Salary-Trips).balance`: 0 → 2,000
- `Salary.availableBalance`: 30,000 → 28,000
- `Salary.balance (total)`: 30,000 → 30,000 (unchanged)
- `savingGoal(Trips).totalSaved`: 5,000 → 7,000

**State after:**
| Account | Total  | Available |
|---------|--------|-----------|
| Main    | 50,000 | 45,000    |
| Salary  | 30,000 | 28,000    |

| Saving Goal | Monthly (this month)  | Total Saved      |
|-------------|----------------------|------------------|
| Trips       | **7,000** / 3,000    | 7,000 / 100,000  |

**Explanation of monthly:** The monthly saved amount for "Trips" is 5,000 (from Main) + 2,000 (from Salary) = 7,000 across all accounts this month. Progress bar shows **100%** (clamped to 0–100% range) — user exceeded their monthly target!

---

### Step 6: User deposits 8,000 UAH to "Flat" from "Main" (date: 2026-04-12)

**Validation:** Main.availableBalance (45,000) >= 8,000 ✓

**Transaction:**
- `accountSaving(Main-Flat).balance`: 0 → 8,000
- `Main.availableBalance`: 45,000 → 37,000
- `Main.balance (total)`: 50,000 (unchanged)
- `savingGoal(Flat).totalSaved`: 0 → 8,000

**State after:**
| Account | Total  | Available |
|---------|--------|-----------|
| Main    | 50,000 | 37,000    |

| Main's Savings | Balance | This Month |
|---------------|---------|------------|
| Trips         | 5,000   | 5,000      |
| Flat          | 8,000   | 8,000      |

Check: Main.available (37,000) + Trips (5,000) + Flat (8,000) = 50,000 = Main.total ✓

---

### Step 7: User withdraws 1,500 UAH from "Trips" saving on "Main" account (date: 2026-04-15)

User presses the `≫` button next to "Trips" on the Main account savings screen.

**Validation:** accountSaving(Main-Trips).balance (5,000) >= 1,500 ✓

**Transaction:**
- `savingTransaction(accountSavingId=Main-Trips, sum=-1500, date=2026-04-15)`
- `accountSaving(Main-Trips).balance`: 5,000 → 3,500
- `Main.availableBalance`: 37,000 → 38,500
- `Main.balance (total)`: 50,000 (unchanged!)
- `savingGoal(Trips).totalSaved`: 7,000 → 5,500

**State after:**
| Account | Total  | Available |
|---------|--------|-----------|
| Main    | 50,000 | 38,500    |

| Main's Savings | Balance | This Month |
|---------------|---------|------------|
| Trips         | 3,500   | 3,500 (5000 - 1500) |
| Flat          | 8,000   | 8,000      |

Check: 38,500 + 3,500 + 8,000 = 50,000 ✓

**Saving Goals page:**
| Saving Goal | Monthly (this month) | Total Saved     |
|-------------|---------------------|-----------------|
| Trips       | 5,500 / 3,000       | 5,500 / 100,000 |
| Flat        | 8,000 / 10,000      | 8,000 / 500,000 |

**Monthly calculation for Trips this month:**
- Main: +5,000 (step 4) + (-1,500) (step 7) = 3,500 from Main this month
- Salary: +2,000 (step 5) = 2,000 from Salary this month
- Total this month: 3,500 + 2,000 = **5,500**

---

### Step 8: New month begins (May 2026) — User deposits 1,000 UAH to "Trips" from "Main" (date: 2026-05-03)

**Transaction:**
- `accountSaving(Main-Trips).balance`: 3,500 → 4,500
- `Main.availableBalance`: 38,500 → 37,500
- `savingGoal(Trips).totalSaved`: 5,500 → 6,500

**Saving Goals page in May:**
| Saving Goal | Monthly (May only)   | Total Saved     |
|-------------|---------------------|-----------------|
| Trips       | **1,000** / 3,000   | 6,500 / 100,000 |
| Flat        | **0** / 10,000      | 8,000 / 500,000 |

**Monthly resets!** Only transactions from May are counted. The 1,000 deposited in May is all that shows for the monthly bar. Total continues accumulating.

---

### Step 9: User accidentally deposits 3,000, then withdraws 3,000 in the same month (May)

Deposit 3,000 to Flat from Main (date: 2026-05-05):
- `savingTransaction(Main-Flat, +3000, 2026-05-05)`
- Flat balance: 8,000 → 11,000
- Main available: 37,500 → 34,500
- Flat.totalSaved: 8,000 → 11,000

Then withdraw 3,000 from Flat to Main (date: 2026-05-05):
- `savingTransaction(Main-Flat, -3000, 2026-05-05)`
- Flat balance: 11,000 → 8,000
- Main available: 34,500 → 37,500
- Flat.totalSaved: 11,000 → 8,000

**Monthly for Flat in May:** +3,000 + (-3,000) = **0** — net zero, as expected. The accident is corrected.

---

### Step 10: User withdraws money saved LAST month (edge case)

In May, user withdraws 2,000 from "Flat" (which was saved in April):
- `savingTransaction(Main-Flat, -2000, 2026-05-10)`
- Flat balance: 8,000 → 6,000
- Main available: 37,500 → 39,500
- Flat.totalSaved: 8,000 → 6,000

**Monthly for Flat in May:** +3,000 + (-3,000) + (-2,000) = **-2,000**

**How to display negative monthly?** The progress bar shows **0%** (clamped to 0–100% range: negative and >100% both get clamped). The text shows: `-2,000 UAH / 10,000 UAH`. This is correct — user actually took money OUT of savings this month.

**Progress bar clamping rule (applies everywhere):** `Math.max(0, Math.min(100, (savedAmount / goalAmount) * 100))` — the existing `getProgressPercent` function already does this. No change needed there. The bar never goes below 0% or above 100%, but the text label always shows the real number.

---

### Step 11: Remove "Trips" saving from "Salary" account

User presses trash bin button near "Trips" on Salary's savings screen → "Remove saving" modal window approved by user

**What happens:**
- `accountSaving(Salary-Trips).balance` = 2,000
- `Salary.availableBalance`: 28,000 → 30,000 (returned!)
- `Salary.balance (total)`: 30,000 (unchanged)
- `savingGoal(Trips).totalSaved`: 6,500 → 4,500 (decreased by 2,000)
- All savingTransactions for Salary-Trips are deleted
- The accountSaving record is deleted

**After removal:**
| Account | Total  | Available |
|---------|--------|-----------|
| Salary  | 30,000 | 30,000    |

"Trips" saving goal still exists and is still linked to "Main" with 4,500 balance.

**Saving Goals page:**
| Saving Goal | Monthly (May) | Total Saved     |
|-------------|--------------|-----------------|
| Trips       | 1,000 / 3,000 | 4,500 / 100,000 |

Monthly for Trips in May: now only counts Main's May transactions (1,000). Salary's historical transactions are gone.

---

### Step 12: Delete "Trips" saving goal entirely (from Saving Goals page)

**Cascade:**
1. Find all accountSavings for Trips: `[Main-Trips (balance=4,500)]`
2. For Main: `availableBalance`: 37,500 → 42,000 (+ 4,500 returned)
3. Delete all savingTransactions for Main-Trips
4. Delete accountSaving Main-Trips
5. Delete savingGoal Trips

**After:**
| Account | Total  | Available |
|---------|--------|-----------|
| Main    | 50,000 | 42,000    |

Main's savings list: only "Flat" with balance 6,000 remains.
Check: 42,000 + 6,000 = 48,000... wait, that's not 50,000!

Let me retrace: Main started at 50,000. In April, income was never added or expenses taken in our example. But in step 7 we withdrew 1,500 from Trips. Let me recalculate more carefully.

Actually, let me trace Main's total balance:
- Main.total was always 50,000 (never changed by saving operations)
- Main's savings after step 12: Flat with balance 6,000
- So Main.available should be 50,000 - 6,000 = 44,000

Let me re-trace available:
- Step 4: 50,000 → 45,000 (deposited 5,000 to Trips)
- Step 6: 45,000 → 37,000 (deposited 8,000 to Flat)
- Step 7: 37,000 → 38,500 (withdrew 1,500 from Trips)
- Step 8: 38,500 → 37,500 (deposited 1,000 to Trips)
- Step 9: 37,500 → 34,500 → 37,500 (deposit then withdraw, net 0)
- Step 10: 37,500 → 39,500 (withdrew 2,000 from Flat)
- Step 12: Trips deleted, Main-Trips balance at this point = 3,500 + 1,000 = 4,500. Return 4,500 → 39,500 + 4,500 = 44,000

Main savings: Flat with balance = 8,000 - 2,000 = 6,000
Check: 44,000 + 6,000 = 50,000 ✓

---

### Step 13: Regular expense from account (interaction with savings)

User wants to pay a 5,000 UAH expense from "Main" account.

**Validation:** Main.availableBalance (44,000) >= 5,000 ✓

**Transaction (existing expense flow):**
- `Main.availableBalance`: 44,000 → 39,000
- `Main.balance (total)`: 50,000 → 45,000
- Both decrease by the same amount!

**After expense:**
Check: 39,000 + 6,000 (Flat saving) = 45,000 = Main.total ✓

---

### Step 14: Income to account (interaction with savings)

User receives 10,000 UAH income to "Main".

**Transaction (existing income flow):**
- `Main.availableBalance`: 39,000 → 49,000
- `Main.balance (total)`: 45,000 → 55,000
- Both increase by the same amount!

**After income:**
Check: 49,000 + 6,000 = 55,000 = Main.total ✓

---

### Step 15: Attempting invalid operations

**Try to deposit 50,000 to Flat from Main:**
Main.availableBalance = 49,000 < 50,000 → **REJECTED** with error "Insufficient available balance"

**Try to withdraw 10,000 from Flat (balance is 6,000):**
accountSaving(Main-Flat).balance = 6,000 < 10,000 → **REJECTED** with error "Insufficient saving balance"

**Try to add "Trips" (UAH) to "USD Acc" (USD):**
Currencies don't match → **REJECTED** with error "Currency mismatch"

**Try to add "Flat" to "Main" again:**
Already exists → **REJECTED** with error "This saving goal is already linked to this account"

---

## Account Savings Screen — What user sees for "Main" account

```
┌─────────────────────────────────────────────────────┐
│  ← Main Account Savings                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Flat                    this month: 0 UAH          │
│                          total: 6,000 UAH       + ≫ │
│                                                     │
│─────────────────────────────────────────────────────│
│                                                     │
│  (empty space)                                      │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                   [+ Add saving]                     │
└─────────────────────────────────────────────────────┘
```

When user presses "+ Add saving" → sees dropdown/list with saving goals of the same currency (UAH) that are NOT already linked. If "Trips" was deleted and "Flat" is already linked, it shows nothing (or a message "No available saving goals").

---

## 9. Edge Cases & Validation

| Case | Behavior |
|------|----------|
| Deposit exceeds available balance | Show error, block transaction |
| Withdrawal exceeds saving balance | Show error, block transaction |
| Add saving with different currency | Don't show it in available list |
| Add duplicate saving to account | Don't show it in available list |
| Delete saving goal from goals page | Return all balances to all affected accounts, cascade delete |
| Remove saving from one account | Return that saving's balance to that account only |
| Delete account | Delete all accountSavings for that account, decrease savingGoal.totalSaved for each |
| Negative monthly total | Display as negative number, progress bar at 0% |
| Account transfer | Validate against availableBalance of source; decrease both availableBalance and balance on source, increase both on target |
| Expense from account | Validate against availableBalance; decrease both availableBalance and balance |
| No saving goals for currency | Show "No available saving goals" when trying to add |

---

## 10. Implementation Order

### Phase 1: Database & Core Logic
1. **Create migration** for `accounts.availableBalance`, `accountSavings` table, `savingTransactions` table, `savingGoals.totalSaved`
2. **Update schema.ts** with new tables and columns
3. **Update entity types** (`AccountEntity`) and **data types** (`AccountData`, `SavingGoalData`)
4. **Create `AccountSavingRepository.ts`** and **`SavingTransactionRepository.ts`**
5. **Update `AccountRepository`** to handle `availableBalance`
6. **Update `MapService.ts`** for new fields

### Phase 2: Service Layer
7. **Create `AccountSavingService.ts`** with deposit/withdraw/add/remove logic
8. **Update `AccountService.ts`** — new account sets availableBalance = balance
9. **Update `SavingGoalsService.ts`** — cascade delete, return totalSaved and monthly amounts
10. **Update `ExpenseTransactionService.ts`** — validate against availableBalance
11. **Update `AccountTransferService.ts`** — validate against availableBalance
12. **Update `IncomeTransactionService.ts`** — increase both balances

### Phase 3: UI
13. **Update `CircleItem.tsx`** — show two balances
14. **Update `AccountsSection.tsx`** — add "Watch Savings" to long-press modal
15. **Create `AccountSavingsScreen.tsx`** — full savings management screen
16. **Create `SavingTransferModal.tsx`** — deposit/withdraw amount input
17. **Update `SavingGoalsScreen.tsx`** — show real saved amounts from database
18. **Update `_layout.tsx`** — register new screen

### Phase 4: Polish
19. **Test all calculation flows** with the examples above
20. **Handle edge cases** (empty states, no goals available, etc.)
21. **Update delete flows** for accounts (cascade savings cleanup)
