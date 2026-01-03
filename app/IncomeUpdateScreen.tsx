import { StyleSheet, View } from "react-native"
import TextInputField from "./components/TextInputField";
import HeaderForEditScreens from "./components/HeaderForEditScreens";
import { useEffect, useState } from "react";
import SubmitButton from "./components/SubmitButton";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getIncomeByIdAsync, updateIncomeAsync } from "../src/db/IncomeRepository";
import { IncomeFormErrors } from "./IncomeFormScreens/models/Errors";
import { IncomeEntity } from "../src/models/entities/IncomeEntity";

export default function IncomeUpdateScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const incomeIdParam = params.incomeId as string | undefined;
    const incomeId = incomeIdParam ? parseInt(incomeIdParam, 10) : undefined;
    const [incomeEntity, setIncomeEntity] = useState<IncomeEntity>({ id: incomeId ?? 0, name: "", balance: 0, currency: 0 });
    const [errors, setErrors] = useState<IncomeFormErrors>({});
    
    async function handleSubmit() {
        var isValid = validate();
        if (!isValid) 
        {
            return;
        }
        const name = incomeEntity?.name.trim();
        if (!name) return;

        try {
            await updateIncomeAsync(incomeEntity!);
        } catch (err) {
            console.error('Failed to update income', err);
        }

        router.back();
    }

    function validate() : boolean {
        const name = incomeEntity?.name.trim();
        let isValid = true;
        if (!name)
        {
            setErrors((prev) => ({ ...prev, nameErrorMessage: "Name is required" }));
            isValid = false;
        }

        if (Number.isNaN(incomeEntity?.balance)) 
        {
            setErrors((prev) => ({ ...prev, balanceErrorMessage: "Balance must be a number" }));
            isValid = false;
        }

        return isValid;
    }

    useEffect(() => {
        if (incomeId === undefined || Number.isNaN(incomeId)) {
            console.error('incomeId is missing or invalid in route params');
            return;
        }

        (async () => {
            try {
                const income = await getIncomeByIdAsync(incomeId);
                if (!income) {
                    console.error('Income not found');
                    return;
                }
                setIncomeEntity(income);
            } catch (err) {
                console.error('Failed to load income', err);
            }
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
                        value={incomeEntity.name}
                        onChangeText={(text) => setIncomeEntity({ ...incomeEntity, name: text })}
                        errorMessage={errors.nameErrorMessage}/>
                    <TextInputField 
                        label="Balance" 
                        placeholder="0"
                        value={incomeEntity.balance.toString()}
                        onChangeText={(text) => setIncomeEntity({ ...incomeEntity, balance: parseFloat(text) || 0 })}
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