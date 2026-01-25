import { 
    getAllIncomesAsync,
    getAllIncomesWithCurrentMonthTransactionsAsync,
    getIncomeByIdAsync, 
    getIncomeByIdWithCurrentMonthTransactionsAsync, 
    insertIncomeAsync,
    updateIncomeAsync as updateAccountInDbAsync } from "../db/Repositories/IncomeRepository";
import { IncomeSourceData } from "../models/data/IncomeSourceData";
import IncomeTransactionData from "../models/data/IncomeTransactionData";
import { mapIncomeEntityToIncomeSourceData, mapIncomeTransactionDataToIncomeTransactionEntity, mapIncomeTransactionEntityToIncomeTransactionData } from "./MapService";
import { addIncomeTransaction as addIncomeTransactionToDb } from "../db/Repositories/IncomeTransactionsRepository";
import { IncomeSourceEntity } from "../models/entities/IncomeEntity";

export async function getIncomesAsync() : Promise<IncomeSourceData[]> {
    var foundIncomes = await getAllIncomesWithCurrentMonthTransactionsAsync();
    return foundIncomes.map(income => toIncomeSourceData(income));
}

export async function getIncomeAsync(id: number) : Promise<IncomeSourceData> 
{
    var foundIncome = await getIncomeByIdWithCurrentMonthTransactionsAsync(id);
    if (!foundIncome) {
        throw new Error(`Income with id ${id} not found`);
    }
    
    return toIncomeSourceData(foundIncome);
}

export async function addIncomeAsync(incomeToAdd: IncomeSourceData) : Promise<IncomeSourceData> {
    var addedIncome = await insertIncomeAsync(incomeToAdd);
    return toIncomeSourceData(addedIncome);
}

export async function updateIncomeAsync(incomeToUpdate: IncomeSourceData) : Promise<IncomeSourceData> {
    var updatedIncome = await updateAccountInDbAsync(incomeToUpdate);
    return toIncomeSourceData(updatedIncome);
}

export async function addIncomeTransaction(incomeTransaction: IncomeTransactionData) : Promise<IncomeTransactionData> {
    // validate: account exists, income source exists, income currency matches account currency, sufficient balance
    // sum is greater than 0
    var addedTransaction = await addIncomeTransactionToDb(
        mapIncomeTransactionDataToIncomeTransactionEntity(incomeTransaction));
    return mapIncomeTransactionEntityToIncomeTransactionData(addedTransaction);
}

function toIncomeSourceData(income: IncomeSourceEntity) : IncomeSourceData {
    var mappedIncomeSource = mapIncomeEntityToIncomeSourceData(income);
    mappedIncomeSource.balance = calculateBalanceForIncomeSource(mappedIncomeSource);
    return mappedIncomeSource;
}

function calculateBalanceForIncomeSource(incomeSource: IncomeSourceData) : number {
    return incomeSource.transactions
        .reduce((accumulator: number, transaction: IncomeTransactionData) => accumulator + transaction.sum, 0);
}