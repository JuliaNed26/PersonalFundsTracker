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
import {
    formatDotDecimalInput,
    parseDotDecimalInputOrZero,
} from "../src/services/DotDecimalInputService";

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
    const [monthGoalInput, setMonthGoalInput] = useState<string>("");
    const [totalGoalInput, setTotalGoalInput] = useState<string>("");
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
                const mappedSavingGoal = mapSavingGoalDataToSavingGoalUpdateData(savingGoal);
                setSavingGoalToUpdate(mappedSavingGoal);
                setMonthGoalInput(formatDotDecimalInput(mappedSavingGoal.monthGoal, true));
                setTotalGoalInput(formatDotDecimalInput(mappedSavingGoal.totalGoal, true));
            } finally {
                setIsLoading(false);
            }
        })();
    }, [savingGoalId]);

    async function handleSubmit() {
        const nextSavingGoal = {
            ...savingGoalToUpdate,
            monthGoal: parseDotDecimalInputOrZero(monthGoalInput),
            totalGoal: parseDotDecimalInputOrZero(totalGoalInput),
        };

        const validationResult = validateSavingGoalUpdateData(nextSavingGoal);
        setErrors(validationResult);

        if (!validationResult.isValid) {
            return;
        }

        try {
            await updateSavingGoalAsync(nextSavingGoal);
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
                            value={monthGoalInput}
                            onChangeText={(text) => {
                                setMonthGoalInput(text);
                                setErrors((prev) => ({ ...prev, monthGoalErrorMessage: undefined }));
                            }}
                            errorMessage={errors.monthGoalErrorMessage}
                            dotDecimalOnly
                        />
                        <TextInputField
                            label="Total goal"
                            placeholder="Enter sum"
                            value={totalGoalInput}
                            onChangeText={(text) => {
                                setTotalGoalInput(text);
                                setErrors((prev) => ({ ...prev, totalGoalErrorMessage: undefined }));
                            }}
                            errorMessage={errors.totalGoalErrorMessage}
                            dotDecimalOnly
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
