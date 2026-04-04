import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";
import HeaderWithActions from "./components/HeaderWithActions";
import TextInputField from "./components/TextInputField";
import SavingGoalValidationResult from "../src/models/data/SavingGoalValidationResult";
import SavingGoalUpdateData from "../src/models/data/SavingGoalUpdateData";
import { mapSavingGoalDataToSavingGoalUpdateData } from "../src/services/MapService";
import {
    getSavingGoalAsync,
    isSavingGoalDuplicateError,
    updateSavingGoalAsync,
} from "../src/services/SavingGoalsService";
import { validateSavingGoalUpdateData } from "../src/services/SavingGoalsValidationService";

export default function SavingGoalUpdateScreen() {
    const router = useRouter();
    const savingGoalIdParam = useLocalSearchParams().savingGoalId as string | undefined;
    const savingGoalId = savingGoalIdParam ? parseInt(savingGoalIdParam, 10) : undefined;
    const [savingGoalToUpdate, setSavingGoalToUpdate] = useState<SavingGoalUpdateData>({
        id: savingGoalId ?? 0,
        name: "",
        monthGoal: 0,
        totalGoal: 0,
    });
    const [errors, setErrors] = useState<SavingGoalValidationResult>({ isValid: true });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (savingGoalId === undefined || Number.isNaN(savingGoalId)) {
            throw new Error("Saving goal id is missing or invalid in route params");
        }

        (async () => {
            try {
                setIsLoading(true);
                const savingGoal = await getSavingGoalAsync(savingGoalId);
                setSavingGoalToUpdate(mapSavingGoalDataToSavingGoalUpdateData(savingGoal));
            } finally {
                setIsLoading(false);
            }
        })();
    }, [savingGoalId]);

    async function handleSubmit() {
        const validationResult = validateSavingGoalUpdateData(savingGoalToUpdate);
        setErrors(validationResult);

        if (!validationResult.isValid) {
            return;
        }

        try {
            await updateSavingGoalAsync(savingGoalToUpdate);
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
                title="Update saving goal"
                onClose={() => router.back()}
                onSubmit={handleSubmit}
            />

            <View style={styles.contentContainer}>
                {isLoading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#4A6B2A" />
                    </View>
                ) : (
                    <View style={styles.formContainer}>
                        <TextInputField
                            label="Saving type name"
                            placeholder="Enter name"
                            value={savingGoalToUpdate.name}
                            onChangeText={(text) => {
                                setSavingGoalToUpdate((prev) => ({ ...prev, name: text }));
                                setErrors((prev) => ({ ...prev, nameErrorMessage: undefined }));
                            }}
                            errorMessage={errors.nameErrorMessage}
                        />
                        <TextInputField
                            label="Per month goal"
                            placeholder="Enter sum"
                            value={
                                savingGoalToUpdate.monthGoal === 0
                                    ? ""
                                    : savingGoalToUpdate.monthGoal.toString()
                            }
                            onChangeText={(text) => {
                                setSavingGoalToUpdate((prev) => ({
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
                            value={
                                savingGoalToUpdate.totalGoal === 0
                                    ? ""
                                    : savingGoalToUpdate.totalGoal.toString()
                            }
                            onChangeText={(text) => {
                                setSavingGoalToUpdate((prev) => ({
                                    ...prev,
                                    totalGoal: parseFloat(text) || 0,
                                }));
                                setErrors((prev) => ({ ...prev, totalGoalErrorMessage: undefined }));
                            }}
                            errorMessage={errors.totalGoalErrorMessage}
                            keyboardType="decimal-pad"
                        />
                    </View>
                )}
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
    loaderContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    formContainer: {
        alignItems: "center",
        paddingTop: 24,
        gap: 8,
    },
});
