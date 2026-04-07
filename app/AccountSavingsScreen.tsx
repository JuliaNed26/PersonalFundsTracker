import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal as RNModal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Modal from "./components/Modal";
import DropdownList from "./components/DropdownList";
import SavingTransferModal from "./components/SavingTransferModal";
import { currencyMap } from "../src/models/constants/CurrencyList";
import { AccountData } from "../src/models/data/AccountData";
import AccountSavingData from "../src/models/data/AccountSavingData";
import SavingGoalData from "../src/models/data/SavingGoalData";
import { getAccountAsync } from "../src/services/AccountService";
import {
    addSavingToAccountAsync,
    depositToSavingAsync,
    getAccountSavingsWithDetailsAsync,
    getAvailableGoalsForAccountAsync,
    removeSavingFromAccountAsync,
    withdrawFromSavingAsync,
} from "../src/services/AccountSavingService";

function formatAmount(sum: number, currency: number): string {
    const currencyLabel = currencyMap.get(currency) ?? `${currency}`;
    return `${sum.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })} ${currencyLabel}`;
}

export default function AccountSavingsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const accountIdParam = params.accountId;
    const accountId = typeof accountIdParam === "string"
        ? parseInt(accountIdParam, 10)
        : Array.isArray(accountIdParam)
            ? parseInt(accountIdParam[0], 10)
            : NaN;

    const [account, setAccount] = useState<AccountData | null>(null);
    const [savings, setSavings] = useState<AccountSavingData[]>([]);
    const [availableGoals, setAvailableGoals] = useState<SavingGoalData[]>([]);
    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
    const [selectedSaving, setSelectedSaving] = useState<AccountSavingData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [depositModalVisible, setDepositModalVisible] = useState<boolean>(false);
    const [withdrawModalVisible, setWithdrawModalVisible] = useState<boolean>(false);
    const [addSavingModalVisible, setAddSavingModalVisible] = useState<boolean>(false);
    const [removeModalVisible, setRemoveModalVisible] = useState<boolean>(false);
    const [addSavingError, setAddSavingError] = useState<string | undefined>();

    const loadScreenData = useCallback(async () => {
        if (Number.isNaN(accountId)) {
            setAccount(null);
            setSavings([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const [loadedAccount, loadedSavings] = await Promise.all([
                getAccountAsync(accountId),
                getAccountSavingsWithDetailsAsync(accountId),
            ]);

            setAccount(loadedAccount);
            setSavings(loadedSavings);
        } catch (error) {
            console.error("Failed to load account savings", error);
            setAccount(null);
            setSavings([]);
        } finally {
            setIsLoading(false);
        }
    }, [accountId]);

    useFocusEffect(
        useCallback(() => {
            void loadScreenData();
        }, [loadScreenData])
    );

    async function handleOpenAddSavingModal() {
        if (!account) {
            return;
        }

        try {
            const goals = await getAvailableGoalsForAccountAsync(account.id);
            setAvailableGoals(goals);
            setSelectedGoalId(goals[0]?.id ?? null);
            setAddSavingError(undefined);
            setAddSavingModalVisible(true);
        } catch (error) {
            console.error("Failed to load available saving goals", error);
        }
    }

    async function handleAddSaving() {
        if (!account || selectedGoalId === null) {
            setAddSavingError("Choose a saving goal first");
            return;
        }

        try {
            await addSavingToAccountAsync(account.id, selectedGoalId);
            setAddSavingModalVisible(false);
            setSelectedGoalId(null);
            setAddSavingError(undefined);
            await loadScreenData();
        } catch (error) {
            setAddSavingError(error instanceof Error ? error.message : "Unable to add saving");
        }
    }

    async function handleDeposit(amount: number) {
        if (!selectedSaving) {
            return;
        }

        await depositToSavingAsync(selectedSaving.id, amount);
        setSelectedSaving(null);
        await loadScreenData();
    }

    async function handleWithdraw(amount: number) {
        if (!selectedSaving) {
            return;
        }

        await withdrawFromSavingAsync(selectedSaving.id, amount);
        setSelectedSaving(null);
        await loadScreenData();
    }

    async function handleRemoveSaving() {
        if (!selectedSaving) {
            return;
        }

        try {
            await removeSavingFromAccountAsync(selectedSaving.id);
            setRemoveModalVisible(false);
            setSelectedSaving(null);
            await loadScreenData();
        } catch (error) {
            console.error("Failed to remove saving from account", error);
        }
    }

    const currency = account?.currency ?? 0;
    const currencyLabel = currencyMap.get(currency) ?? "";

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {account ? `${account.name} Savings` : "Account Savings"}
                </Text>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Image style={styles.backIcon} source={require("./assets/arrow-back.png")} />
                </Pressable>
            </View>

            {account ? (
                <View style={styles.balanceSummary}>
                    <Text style={styles.balanceLine}>
                        {`Available: ${formatAmount(account.availableBalance, account.currency)}`}
                    </Text>
                    <Text style={styles.balanceLineSecondary}>
                        {`Total: ${formatAmount(account.balance, account.currency)}`}
                    </Text>
                </View>
            ) : null}

            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4A6B2A" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {savings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No savings linked to this account yet.</Text>
                        </View>
                    ) : (
                        savings.map((saving) => (
                            <View key={saving.id} style={styles.savingCard}>
                                <View style={styles.savingTextBlock}>
                                    <Text style={styles.savingTitle}>{saving.savingGoalName}</Text>
                                    <Text style={styles.savingMeta}>
                                        {`This month: ${formatAmount(saving.thisMonthSaved, currency)}`}
                                    </Text>
                                    <Text style={styles.savingMetaStrong}>
                                        {`Total: ${formatAmount(saving.balance, currency)}`}
                                    </Text>
                                </View>

                                <View style={styles.actionColumn}>
                                    <Pressable
                                        style={styles.actionButton}
                                        onPress={() => {
                                            setSelectedSaving(saving);
                                            setDepositModalVisible(true);
                                        }}>
                                        <Text style={styles.actionButtonText}>+</Text>
                                    </Pressable>
                                    <Pressable
                                        style={styles.actionButton}
                                        onPress={() => {
                                            setSelectedSaving(saving);
                                            setWithdrawModalVisible(true);
                                        }}>
                                        <Text style={styles.actionButtonText}>{">>"}</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionButton, styles.deleteActionButton]}
                                        onPress={() => {
                                            setSelectedSaving(saving);
                                            setRemoveModalVisible(true);
                                        }}>
                                        <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            <View style={styles.addButtonContainer}>
                <Pressable style={styles.addButton} onPress={handleOpenAddSavingModal}>
                    <Text style={styles.addButtonText}>+ Add saving</Text>
                </Pressable>
            </View>

            <SavingTransferModal
                visible={depositModalVisible}
                setIsVisible={setDepositModalVisible}
                title={selectedSaving ? `Deposit to ${selectedSaving.savingGoalName}` : "Deposit"}
                buttonText="Save"
                currency={currency}
                maxAmount={account?.availableBalance ?? 0}
                onSubmit={handleDeposit}
            />

            <SavingTransferModal
                visible={withdrawModalVisible}
                setIsVisible={setWithdrawModalVisible}
                title={selectedSaving ? `Withdraw from ${selectedSaving.savingGoalName}` : "Withdraw"}
                buttonText="Save"
                currency={currency}
                maxAmount={selectedSaving?.balance ?? 0}
                onSubmit={handleWithdraw}
            />

            <Modal
                visible={removeModalVisible}
                setIsVisible={setRemoveModalVisible}
                text={`Remove ${selectedSaving?.savingGoalName ?? "this saving"} from ${account?.name ?? "this account"}?`}
                firstButtonText="Cancel"
                firstButtonAction={() => setRemoveModalVisible(false)}
                secondButtonText="Remove"
                secondButtonAction={handleRemoveSaving}
            />

            <RNModal
                visible={addSavingModalVisible}
                transparent
                statusBarTranslucent
                animationType="slide"
                onRequestClose={() => setAddSavingModalVisible(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.addSavingModal}>
                        <View style={styles.addSavingHeader}>
                            <Text style={styles.addSavingTitle}>Add saving</Text>
                            <Pressable
                                hitSlop={8}
                                onPress={() => {
                                    setAddSavingModalVisible(false);
                                    setAddSavingError(undefined);
                                }}>
                                <Text style={styles.addSavingClose}>X</Text>
                            </Pressable>
                        </View>

                        {availableGoals.length === 0 ? (
                            <Text style={styles.noGoalsText}>
                                {`No available saving goals for ${currencyLabel}.`}
                            </Text>
                        ) : (
                            <>
                                <DropdownList
                                    data={availableGoals.map((goal) => ({
                                        key: goal.id,
                                        value: goal.name,
                                    }))}
                                    defaultOption={
                                        availableGoals[0]
                                            ? { key: availableGoals[0].id, value: availableGoals[0].name }
                                            : undefined
                                    }
                                    setSelected={(key) => {
                                        setSelectedGoalId(Number(key));
                                        setAddSavingError(undefined);
                                    }}
                                    compact
                                    containerStyle={styles.fullWidthDropdown}
                                    placeholder="Choose saving goal"
                                    label="Saving goal"
                                />
                                {addSavingError ? <Text style={styles.addSavingError}>{addSavingError}</Text> : null}
                            </>
                        )}

                        <View style={styles.addSavingButtons}>
                            <Pressable
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => {
                                    setAddSavingModalVisible(false);
                                    setAddSavingError(undefined);
                                }}>
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.modalButton,
                                    availableGoals.length === 0 ? styles.modalButtonDisabled : null,
                                ]}
                                onPress={handleAddSaving}
                                disabled={availableGoals.length === 0}>
                                <Text style={styles.modalButtonText}>Add</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </RNModal>
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
        minWidth: 0,
        flexShrink: 1,
        fontSize: 34,
        lineHeight: 40,
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
    balanceSummary: {
        paddingHorizontal: 24,
        paddingBottom: 12,
        gap: 4,
    },
    balanceLine: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    balanceLineSecondary: {
        fontSize: 14,
        color: "#4B5563",
    },
    loaderContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 12,
    },
    emptyState: {
        minHeight: 240,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyStateText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
    },
    savingCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#E0F07D",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 3,
    },
    savingTextBlock: {
        flex: 1,
        paddingRight: 12,
        gap: 4,
    },
    savingTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#333333",
    },
    savingMeta: {
        fontSize: 13,
        color: "#4B5563",
        fontWeight: "600",
    },
    savingMetaStrong: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "700",
    },
    actionColumn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#4A6B2A",
        alignItems: "center",
        justifyContent: "center",
    },
    deleteActionButton: {
        backgroundColor: "#A23A3A",
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
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
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    addSavingModal: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
    },
    addSavingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    addSavingTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
    },
    addSavingClose: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    noGoalsText: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        marginVertical: 24,
    },
    addSavingError: {
        color: "#DC2626",
        fontSize: 12,
        width: "100%",
        marginTop: -2,
        marginBottom: 12,
    },
    fullWidthDropdown: {
        width: "100%",
        marginBottom: 0,
    },
    addSavingButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#E0F07D",
        alignItems: "center",
        justifyContent: "center",
    },
    modalButtonDisabled: {
        opacity: 0.5,
    },
    modalCancelButton: {
        backgroundColor: "#F3F4F6",
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    modalCancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
    },
});
