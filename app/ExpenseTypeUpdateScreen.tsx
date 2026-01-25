import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import ExpenseTypeData from "../src/models/data/ExpenseTypeData";
import ExpenseTypeFormErrors from "./ExpenseTypeFormScreens/Errors";
import { getExpenseAsync, updateExpenseAsync } from "../src/services/ExpenseTypesService";
import { validateExpenseType } from "../src/services/ExpenseTypesValidationService";
import { StyleSheet, View } from "react-native";
import HeaderForEditScreens from "./components/HeaderForEditScreens";
import TextInputField from "./components/TextInputField";
import SubmitButton from "./components/SubmitButton";

export default function ExpenseTypeUpdateScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const expenseIdParam = params.expenseTypeId as string | undefined;
    const expenseId = expenseIdParam ? parseInt(expenseIdParam, 10) : undefined;
    const [expenseTypeData, setExpenseTypeData] = useState<ExpenseTypeData>(
        { 
            id: expenseId ?? 0, 
            name: "", 
            balance: 0, 
        } as ExpenseTypeData);
    const [errors, setErrors] = useState<ExpenseTypeFormErrors>({});
    
    async function handleSubmit() {
        var isValid = validate();
        if (!isValid) 
        {
            return;
        }

        await updateExpenseAsync(expenseTypeData);

        router.back();
    }

    function validate() : boolean {
        const validationResult = validateExpenseType(expenseTypeData);
        if (validationResult.isValid) {
            return true;
        }
        
        if (validationResult.nameErrorMessage) {
            setErrors((prev) => ({ ...prev, nameErrorMessage: validationResult.nameErrorMessage }));
        }

        if (validationResult.limitErrorMessage) {
            setErrors((prev) => ({ ...prev, limitErrorMessage: validationResult.limitErrorMessage }));
        }

        return false;
    }

    useEffect(() => {
        if (expenseId === undefined || Number.isNaN(expenseId)) {
            console.error('expenseId is missing or invalid in route params');
            return;
        }

        (async () => {
            const expense = await getExpenseAsync(expenseId);
            setExpenseTypeData(expense);
        })();
    }, [expenseId]);

    return (
        <View style={styles.screenContainer}>
            <HeaderForEditScreens text="Update Expense Type" />
            <View style={styles.formContainer}>
                <View style={styles.inputsContainer}>
                    <TextInputField 
                        label="Expense type name"
                        placeholder="Enter name" 
                        value={expenseTypeData.name}
                        onChangeText={(text) => setExpenseTypeData({ ...expenseTypeData, name: text })}
                        errorMessage={errors.nameErrorMessage}/>
                    <TextInputField 
                        label="Limit per month" 
                        placeholder="0"
                        value={expenseTypeData.limit?.toString() || ''}
                        onChangeText={(text) => setExpenseTypeData({ ...expenseTypeData, limit: parseFloat(text) || 0 })}
                        errorMessage={errors.limitErrorMessage}/>
                </View>
                <View style={styles.submitButton}>
                    <SubmitButton onHandleSubmit={handleSubmit}/>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
    },
    formContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "60%",
    },
    inputsContainer: {
        width: "100%",
        height: "80%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    submitButton: {
        width: "80%",
        marginTop: 100,
    },
});