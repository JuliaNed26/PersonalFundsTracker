import { 
    getAllIncomesAsync,
    getIncomeByIdAsync, 
    insertIncomeAsync,
    updateIncomeAsync as updateAccountInDbAsync } from "../db/Repositories/IncomeRepository";
import { IncomeSourceData } from "../models/data/IncomeSourceData";
import { mapIncomeEntityToIncomeSourceData } from "./MapService";

export async function getIncomesAsync() : Promise<IncomeSourceData[]> {
    var foundIncomes = await getAllIncomesAsync();
    return foundIncomes.map(income => mapIncomeEntityToIncomeSourceData(income));
}

export async function getIncomeAsync(id: number) : Promise<IncomeSourceData> 
{
    var foundIncome = await getIncomeByIdAsync(id);
    if (!foundIncome) {
        throw new Error(`Income with id ${id} not found`);
    }
    
    return mapIncomeEntityToIncomeSourceData(foundIncome);
}

export async function addIncomeAsync(incomeToAdd: IncomeSourceData) : Promise<IncomeSourceData> {
    var addedIncome = await insertIncomeAsync(incomeToAdd);
    return mapIncomeEntityToIncomeSourceData(addedIncome);
}

export async function updateIncomeAsync(incomeToUpdate: IncomeSourceData) : Promise<IncomeSourceData> {
    var updatedIncome = await updateAccountInDbAsync(incomeToUpdate);
    return mapIncomeEntityToIncomeSourceData(updatedIncome);
}