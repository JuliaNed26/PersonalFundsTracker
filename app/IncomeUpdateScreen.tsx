import { StyleSheet, View } from "react-native"
import TextInputField from "./components/TextInputField";
import HeaderForEditScreens from "./components/HeaderForEditScreens";
import { useEffect, useState } from "react";
import SubmitButton from "./components/SubmitButton";
import { useRouter, useLocalSearchParams } from "expo-router";
import { IncomeFormErrors } from "./IncomeFormScreens/models/Errors";
import { IncomeSourceData } from "../src/models/data/IncomeSourceData";
import { getIncomeAsync, updateIncomeAsync } from "../src/services/IncomeService";
import { validateIncomeSourceData } from "../src/services/IncomeValidationService";

export default function IncomeUpdateScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const incomeIdParam = params.incomeId as string | undefined;
    const incomeId = incomeIdParam ? parseInt(incomeIdParam, 10) : undefined;
    const [incomeSourceData, setIncomeSourceData] = useState<IncomeSourceData>(
        { 
            id: incomeId ?? 0, 
            name: "", 
            balance: 0, 
            currency: 0 
        } as IncomeSourceData);
    const [errors, setErrors] = useState<IncomeFormErrors>({});
    
    async function handleSubmit() {
        var isValid = validate();
        if (!isValid) 
        {
            return;
        }

        await updateIncomeAsync(incomeSourceData);

        router.back();
    }

    function validate() : boolean {
        const validationResult = validateIncomeSourceData(incomeSourceData);
        if (validationResult.isValid) {
            return true;
        }
        
        if (validationResult.nameErrorMessage) {
            setErrors((prev) => ({ ...prev, nameErrorMessage: validationResult.nameErrorMessage }));
        }

        if (validationResult.balanceErrorMessage) {
            setErrors((prev) => ({ ...prev, balanceErrorMessage: validationResult.balanceErrorMessage }));
        }

        return false;
    }

    useEffect(() => {
        if (incomeId === undefined || Number.isNaN(incomeId)) {
            console.error('incomeId is missing or invalid in route params');
            return;
        }

        (async () => {
            const income = await getIncomeAsync(incomeId);
            setIncomeSourceData(income);
        })();
    }, [incomeId]);

    return (
        <View style={styles.screenContainer}>
            <HeaderForEditScreens text="Update Income" />
            <View style={styles.formContainer}>
                <View style={styles.inputsContainer}>
                    <TextInputField 
                        label="Income type name"
                        placeholder="Enter name" 
                        value={incomeSourceData.name}
                        onChangeText={(text) => setIncomeSourceData({ ...incomeSourceData, name: text })}
                        errorMessage={errors.nameErrorMessage}/>
                    <TextInputField 
                        label="Balance" 
                        placeholder="0"
                        value={incomeSourceData.balance.toString()}
                        onChangeText={(text) => setIncomeSourceData({ ...incomeSourceData, balance: parseFloat(text) || 0 })}
                        errorMessage={errors.balanceErrorMessage}/>
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