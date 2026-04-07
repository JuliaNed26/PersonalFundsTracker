export default interface SavingGoalEntity {
    id: number;
    name: string;
    normalizedName: string;
    currency: number;
    monthGoal: number;
    totalGoal: number;
    totalSaved: number;
}
