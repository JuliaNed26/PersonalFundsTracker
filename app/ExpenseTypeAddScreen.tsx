import { useRouter } from "expo-router";
import { useState } from "react";
import ExpenseTypeData from "../src/models/data/ExpenseTypeData";
import ExpenseTypeFormErrors from "./ExpenseTypeFormScreens/Errors";
import { addExpenseTypeAsync } from "../src/services/ExpenseTypesService";
import { validateExpenseType } from "../src/services/ExpenseTypesValidationService";
import { StyleSheet, View } from "react-native";
import HeaderForEditScreens from "./components/HeaderForEditScreens";
import TextInputField from "./components/TextInputField";
import SubmitButton from "./components/SubmitButton";
import { parseDotDecimalInputOrZero } from "../src/services/DotDecimalInputService";

export default function ExpenseTypeAddScreen() {
    const router = useRouter();
    const [expenseTypeData, setExpenseTypeData] = useState<ExpenseTypeData>(
        { 
            id: 0, 
            name: "", 
            balance: 0, 
        } as ExpenseTypeData);
    const [limitInput, setLimitInput] = useState<string>("");
    const [errors, setErrors] = useState<ExpenseTypeFormErrors>({});
    
    async function handleSubmit() {
        const nextExpenseType = {
            ...expenseTypeData,
            limit: parseDotDecimalInputOrZero(limitInput),
        };

        var isValid = validate(nextExpenseType);
        if (!isValid) 
        {
            return;
        }

        await addExpenseTypeAsync(nextExpenseType);

        router.back();
    }

    function validate(expenseType: ExpenseTypeData) : boolean {
        const validationResult = validateExpenseType(expenseType);
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

    return (
        <View style={styles.screenContainer}>
            <HeaderForEditScreens text="Add Expense Type" />
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
                        value={limitInput}
                        onChangeText={(text) => {
                            setLimitInput(text);
                            setErrors((prev) => ({ ...prev, limitErrorMessage: undefined }));
                        }}
                        dotDecimalOnly
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
        marginTop: 20,
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
    }
});
