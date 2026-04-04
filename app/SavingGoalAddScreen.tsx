import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import DropdownList from "./components/DropdownList";
import HeaderWithActions from "./components/HeaderWithActions";
import TextInputField from "./components/TextInputField";
import { currencyDropdownData } from "../src/models/constants/CurrencyList";
import SavingGoalData from "../src/models/data/SavingGoalData";
import SavingGoalValidationResult from "../src/models/data/SavingGoalValidationResult";
import { Currency } from "../src/models/enums/Currency";
import { addSavingGoalAsync, isSavingGoalDuplicateError } from "../src/services/SavingGoalsService";
import { validateSavingGoalData } from "../src/services/SavingGoalsValidationService";

const defaultCurrency = currencyDropdownData[0]?.key ?? Currency.UAH;

export default function SavingGoalAddScreen() {
    const router = useRouter();
    const [savingGoalToAdd, setSavingGoalToAdd] = useState<SavingGoalData>({
        id: 0,
        name: "",
        currency: defaultCurrency,
        monthGoal: 0,
        totalGoal: 0,
    });
    const [errors, setErrors] = useState<SavingGoalValidationResult>({ isValid: true });

    async function handleSubmit() {
        const validationResult = validateSavingGoalData(savingGoalToAdd);
        setErrors(validationResult);

        if (!validationResult.isValid) {
            return;
        }

        try {
            await addSavingGoalAsync(savingGoalToAdd);
            router.back();
        } catch (error) {
            if (isSavingGoalDuplicateError(error)) {
                setErrors({
                    isValid: false,
                    nameErrorMessage: error.message,
                });
                return;
            }

            throw error;
        }
    }

    return (
        <SafeAreaView style={styles.screenContainer}>
            <HeaderWithActions
                title="Create new saving goal"
                onClose={() => router.back()}
                onSubmit={handleSubmit}
            />

            <View style={styles.contentContainer}>
                <View style={styles.formContainer}>
                    <TextInputField
                        label="Saving type name"
                        placeholder="Enter name"
                        value={savingGoalToAdd.name}
                        onChangeText={(text) => {
                            setSavingGoalToAdd((prev) => ({ ...prev, name: text }));
                            setErrors((prev) => ({ ...prev, nameErrorMessage: undefined }));
                        }}
                        errorMessage={errors.nameErrorMessage}
                    />
                    <TextInputField
                        label="Per month goal"
                        placeholder="Enter sum"
                        value={savingGoalToAdd.monthGoal === 0 ? "" : savingGoalToAdd.monthGoal.toString()}
                        onChangeText={(text) => {
                            setSavingGoalToAdd((prev) => ({
                                ...prev,
                                monthGoal: parseFloat(text) || 0,
                            }));
                            setErrors((prev) => ({ ...prev, monthGoalErrorMessage: undefined }));
                        }}
                        errorMessage={errors.monthGoalErrorMessage}
                        keyboardType="decimal-pad"
                    />
                    <TextInputField
                        label="Total goal"
                        placeholder="Enter sum"
                        value={savingGoalToAdd.totalGoal === 0 ? "" : savingGoalToAdd.totalGoal.toString()}
                        onChangeText={(text) => {
                            setSavingGoalToAdd((prev) => ({
                                ...prev,
                                totalGoal: parseFloat(text) || 0,
                            }));
                            setErrors((prev) => ({ ...prev, totalGoalErrorMessage: undefined }));
                        }}
                        errorMessage={errors.totalGoalErrorMessage}
                        keyboardType="decimal-pad"
                    />
                </View>

                <View style={styles.currencySection}>
                    <DropdownList
                        data={currencyDropdownData}
                        defaultOption={
                            currencyDropdownData.find(
                                (currencyOption) => currencyOption.key === savingGoalToAdd.currency
                            ) ?? currencyDropdownData[0]
                        }
                        setSelected={(selectedCurrency) =>
                            setSavingGoalToAdd((prev) => ({
                                ...prev,
                                currency: Number(selectedCurrency),
                            }))
                        }
                        placeholder="Select currency"
                        label="Choose Currency"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    formContainer: {
        alignItems: "center",
        paddingTop: 24,
        paddingBottom: 28,
        gap: 8,
    },
    currencySection: {
        borderTopWidth: 1,
        borderTopColor: "#C7C7C7",
        paddingTop: 16,
        alignItems: "center",
    },
});
