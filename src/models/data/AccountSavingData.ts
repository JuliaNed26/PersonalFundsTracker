export default interface AccountSavingData {
    id: number;
    accountId: number;
    savingGoalId: number;
    savingGoalName: string;
    balance: number;
    thisMonthSaved: number;
}
