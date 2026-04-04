import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Modal from "./components/Modal";
import { currencyMap } from "../src/models/constants/CurrencyList";
import SavingGoalData from "../src/models/data/SavingGoalData";
import { deleteSavingGoalAsync, getSavingGoalsAsync } from "../src/services/SavingGoalsService";

type SavingGoalGroup = {
    currency: number;
    savingGoals: SavingGoalData[];
};

const EMPTY_SAVED_AMOUNT = 0;

function groupSavingGoalsByCurrency(savingGoals: SavingGoalData[]): SavingGoalGroup[] {
    const groupedSavingGoals = new Map<number, SavingGoalData[]>();
    const sortedSavingGoals = [...savingGoals].sort((leftGoal, rightGoal) => {
        if (leftGoal.currency !== rightGoal.currency) {
            return leftGoal.currency - rightGoal.currency;
        }

        return leftGoal.name.localeCompare(rightGoal.name, undefined, { sensitivity: "base" });
    });

    for (const savingGoal of sortedSavingGoals) {
        const goals = groupedSavingGoals.get(savingGoal.currency) ?? [];
        goals.push(savingGoal);
        groupedSavingGoals.set(savingGoal.currency, goals);
    }

    return Array.from(groupedSavingGoals.entries()).map(([currency, goals]) => ({
        currency,
        savingGoals: goals,
    }));
}

function formatAmount(sum: number, currency: number): string {
    const currencyLabel = currencyMap.get(currency) ?? `${currency}`;
    const formattedSum = sum.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    return `${formattedSum} ${currencyLabel}`;
}

function getProgressPercent(savedAmount: number, goalAmount: number): number {
    if (goalAmount <= 0) {
        return 0;
    }

    return Math.max(0, Math.min(100, (savedAmount / goalAmount) * 100));
}

function getProgressColor(progressPercent: number): string {
    if (progressPercent >= 100) {
        return "#54C242";
    }

    if (progressPercent >= 80) {
        return "#4A6B2A";
    }

    if (progressPercent >= 40) {
        return "#8B5E34";
    }

    return "#A23A3A";
}

type ProgressBarRowProps = {
    label: string;
    savedAmount: number;
    goalAmount: number;
    currency: number;
};

function ProgressBarRow({ label, savedAmount, goalAmount, currency }: ProgressBarRowProps) {
    const progressPercent = getProgressPercent(savedAmount, goalAmount);
    const progressColor = getProgressColor(progressPercent);

    return (
        <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{label}</Text>
                <Text style={styles.progressAmount}>
                    {`${formatAmount(savedAmount, currency)} / ${formatAmount(goalAmount, currency)}`}
                </Text>
            </View>
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${progressPercent}%`,
                            backgroundColor: progressColor,
                        },
                    ]}
                />
                <Text style={styles.progressPercentText}>{`${Math.round(progressPercent)}%`}</Text>
            </View>
        </View>
    );
}

export default function SavingGoalsScreen() {
    const router = useRouter();
    const [savingGoals, setSavingGoals] = useState<SavingGoalData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [actionModalVisible, setActionModalVisible] = useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const [selectedSavingGoal, setSelectedSavingGoal] = useState<SavingGoalData | null>(null);

    const loadSavingGoals = useCallback(async () => {
        try {
            setIsLoading(true);
            const foundSavingGoals = await getSavingGoalsAsync();
            setSavingGoals(foundSavingGoals);
        } catch (error) {
            console.error("Failed to load saving goals", error);
            setSavingGoals([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            void loadSavingGoals();
        }, [loadSavingGoals])
    );

    async function handleDeleteSavingGoal() {
        if (!selectedSavingGoal) {
            return;
        }

        try {
            await deleteSavingGoalAsync(selectedSavingGoal.id);
            setDeleteModalVisible(false);
            setSelectedSavingGoal(null);
            await loadSavingGoals();
        } catch (error) {
            console.error("Failed to delete saving goal", error);
        }
    }

    function handleOpenActionModal(savingGoal: SavingGoalData) {
        setSelectedSavingGoal(savingGoal);
        setActionModalVisible(true);
    }

    function handleOpenDeleteConfirmation() {
        setActionModalVisible(false);
        setDeleteModalVisible(true);
    }

    function handleOpenUpdateScreen() {
        if (!selectedSavingGoal) {
            return;
        }

        setActionModalVisible(false);
        router.push({
            pathname: "/SavingGoalUpdateScreen",
            params: { savingGoalId: selectedSavingGoal.id },
        });
    }

    const groupedSavingGoals = groupSavingGoalsByCurrency(savingGoals);
    const selectedSavingGoalLabel = selectedSavingGoal
        ? `${selectedSavingGoal.name} (${currencyMap.get(selectedSavingGoal.currency) ?? selectedSavingGoal.currency})`
        : "";

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Saving goals</Text>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Image style={styles.backIcon} source={require("./assets/arrow-back.png")} />
                </Pressable>
            </View>

            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4A6B2A" />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                    {groupedSavingGoals.length === 0 ? (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateText}>No saving goals yet.</Text>
                        </View>
                    ) : (
                        groupedSavingGoals.map((group) => (
                            <View key={group.currency} style={styles.currencyGroup}>
                                <Text style={styles.currencyHeading}>
                                    {currencyMap.get(group.currency) ?? group.currency}
                                </Text>

                                {group.savingGoals.map((savingGoal) => (
                                    <View key={savingGoal.id} style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardTitle}>{savingGoal.name}</Text>
                                            <Pressable
                                                hitSlop={8}
                                                onPress={() => handleOpenActionModal(savingGoal)}>
                                                <Ionicons
                                                    name="ellipsis-vertical"
                                                    size={18}
                                                    color="#374151"
                                                />
                                            </Pressable>
                                        </View>

                                        <ProgressBarRow
                                            label="This month"
                                            savedAmount={EMPTY_SAVED_AMOUNT}
                                            goalAmount={savingGoal.monthGoal}
                                            currency={savingGoal.currency}
                                        />
                                        <ProgressBarRow
                                            label="Total"
                                            savedAmount={EMPTY_SAVED_AMOUNT}
                                            goalAmount={savingGoal.totalGoal}
                                            currency={savingGoal.currency}
                                        />
                                    </View>
                                ))}
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            <View style={styles.addButtonContainer}>
                <Pressable style={styles.addButton} onPress={() => router.push("/SavingGoalAddScreen")}>
                    <Text style={styles.addButtonText}>+ Add saving goal</Text>
                </Pressable>
            </View>

            <Modal
                visible={actionModalVisible}
                setIsVisible={setActionModalVisible}
                text={`What do you want to do with ${selectedSavingGoalLabel}?`}
                firstButtonText="Update"
                firstButtonAction={handleOpenUpdateScreen}
                secondButtonText="Delete"
                secondButtonAction={handleOpenDeleteConfirmation}
            />

            <Modal
                visible={deleteModalVisible}
                setIsVisible={setDeleteModalVisible}
                text={`Are you sure you want to delete ${selectedSavingGoalLabel}?`}
                firstButtonText="Cancel"
                firstButtonAction={() => setDeleteModalVisible(false)}
                secondButtonText="Yes"
                secondButtonAction={handleDeleteSavingGoal}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 16,
    },
    headerTitle: {
        flex: 1,
        fontSize: 34,
        fontWeight: "700",
        color: "#333333",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#2F343B",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 16,
    },
    backIcon: {
        width: 20,
        height: 20,
        tintColor: "#E0F07D",
        resizeMode: "contain",
    },
    loaderContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 128,
    },
    emptyStateContainer: {
        flex: 1,
        minHeight: 240,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyStateText: {
        fontSize: 16,
        color: "#6B7280",
    },
    currencyGroup: {
        marginBottom: 18,
        gap: 12,
    },
    currencyHeading: {
        fontSize: 18,
        fontWeight: "700",
        color: "#4B5563",
        paddingLeft: 4,
    },
    card: {
        backgroundColor: "#E0F07D",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 3,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    cardTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: "700",
        color: "#333333",
        marginRight: 12,
    },
    progressSection: {
        marginTop: 8,
    },
    progressHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#4B5563",
    },
    progressAmount: {
        fontSize: 12,
        fontWeight: "600",
        color: "#5B5B5B",
    },
    progressTrack: {
        position: "relative",
        height: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 6,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    progressFill: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 6,
    },
    progressPercentText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#374151",
    },
    addButtonContainer: {
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 26,
    },
    addButton: {
        height: 54,
        borderRadius: 12,
        backgroundColor: "#E0F07D",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 3,
    },
    addButtonText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333333",
    },
});
