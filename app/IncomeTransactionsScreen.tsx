import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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
import TransactionNoteModal from "./components/TransactionNoteModal";
import { currencyMap } from "../src/models/constants/CurrencyList";
import IncomeTransactionListItem from "../src/models/data/IncomeTransactionListItem";
import {
    deleteIncomeTransactionAsync,
    getIncomeTransactionsForIncomeAsync,
    updateIncomeTransactionNoteAsync,
} from "../src/services/IncomeTransactionService";

type IncomeTransactionDateSection = {
    date: string;
    transactions: IncomeTransactionListItem[];
};

export default function IncomeTransactionsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const incomeIdParam = params.incomeId;
    const incomeId = typeof incomeIdParam === "string"
        ? parseInt(incomeIdParam, 10)
        : Array.isArray(incomeIdParam)
            ? parseInt(incomeIdParam[0], 10)
            : NaN;

    const [transactions, setTransactions] = useState<IncomeTransactionListItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<IncomeTransactionListItem | null>(null);
    const [note, setNote] = useState<string>("");

    const loadTransactions = useCallback(async () => {
        if (Number.isNaN(incomeId)) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const list = await getIncomeTransactionsForIncomeAsync(incomeId);
            setTransactions(list);
        } catch (error) {
            console.error("Failed to load income transactions", error);
        } finally {
            setIsLoading(false);
        }
    }, [incomeId]);

    useFocusEffect(
        useCallback(() => {
            void loadTransactions();
        }, [loadTransactions])
    );

    function formatSum(sum: number) {
        if (Number.isInteger(sum)) {
            return sum.toString();
        }

        return sum.toFixed(2);
    }

    function formatDateLabel(dateString: string) {
        const parts = dateString.split("-");
        if (parts.length !== 3) {
            return dateString;
        }

        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        if (Number.isNaN(year) || Number.isNaN(monthIndex) || Number.isNaN(day) || monthIndex < 0 || monthIndex > 11) {
            return dateString;
        }

        return `${day} ${monthNames[monthIndex]} ${year}`;
    }

    function handleEditPress(transaction: IncomeTransactionListItem) {
        setSelectedTransaction(transaction);
        setNote(transaction.note || "");
        setEditModalVisible(true);
    }

    async function handleSaveNote() {
        if (!selectedTransaction) {
            return;
        }

        try {
            await updateIncomeTransactionNoteAsync(selectedTransaction, note);
            setEditModalVisible(false);
            setSelectedTransaction(null);
            setNote("");
            await loadTransactions();
        } catch (error) {
            console.error("Failed to update income transaction note", error);
        }
    }

    async function handleDelete(transaction: IncomeTransactionListItem) {
        try {
            await deleteIncomeTransactionAsync(transaction);
            if (selectedTransaction) {
                setEditModalVisible(false);
                setSelectedTransaction(null);
                setNote("");
            }
            await loadTransactions();
        } catch (error) {
            console.error("Failed to delete income transaction", error);
        }
    }

    const dateSections = groupTransactionsByDate(transactions);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Image style={styles.backIcon} source={require("./assets/arrow-back.png")} />
                </Pressable>
            </View>

            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#16A34A" />
                ) : transactions.length === 0 ? (
                    <Text style={styles.emptyText}>No transactions yet.</Text>
                ) : (
                    dateSections.map((section) => (
                        <View key={section.date}>
                            <Text style={styles.dateText}>{formatDateLabel(section.date)}</Text>
                            {section.transactions.map((transaction, index) => {
                                const currencyLabel = currencyMap.get(transaction.currency) || "";

                                return (
                                    <View
                                        key={`${transaction.accountId}-${transaction.incomeId}-${transaction.date}-${transaction.sum}-${transaction.sumAddedToAccount}-${index}`}>
                                        <View style={styles.transactionRow}>
                                            <Text style={styles.amountText}>
                                                {`+ ${formatSum(transaction.sum)} ${currencyLabel}`}
                                            </Text>
                                            <View style={styles.rightColumn}>
                                                <View style={styles.incomeRow}>
                                                    <Text style={styles.noteText}>
                                                        {transaction.note ? transaction.note : ""}
                                                    </Text>
                                                    <View style={styles.actionsRow}>
                                                        <Pressable
                                                            style={styles.actionButton}
                                                            onPress={() => handleEditPress(transaction)}>
                                                            <Text style={styles.actionText}>Edit</Text>
                                                        </Pressable>
                                                        <Pressable
                                                            style={[styles.actionButton, styles.deleteActionButton]}
                                                            onPress={() => handleDelete(transaction)}>
                                                            <Text style={[styles.actionText, styles.deleteActionText]}>Delete</Text>
                                                        </Pressable>
                                                    </View>
                                                </View>
                                                <Text style={styles.incomeText}>
                                                    {transaction.accountName ? `To ${transaction.accountName}` : ""}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.divider} />
                                    </View>
                                );
                            })}
                        </View>
                    ))
                )}
            </ScrollView>

            <TransactionNoteModal
                visible={editModalVisible}
                setIsVisible={setEditModalVisible}
                text="Edit transaction note"
                note={note}
                onChangeNote={setNote}
                onSave={handleSaveNote}
                onDelete={() => {
                    if (selectedTransaction) {
                        void handleDelete(selectedTransaction);
                    }
                }}
                onClose={() => {
                    setSelectedTransaction(null);
                    setNote("");
                }}
            />
        </SafeAreaView>
    );
}

function groupTransactionsByDate(
    transactions: IncomeTransactionListItem[]
): IncomeTransactionDateSection[] {
    const sections: IncomeTransactionDateSection[] = [];

    for (const transaction of transactions) {
        const lastSection = sections[sections.length - 1];
        if (!lastSection || lastSection.date !== transaction.date) {
            sections.push({
                date: transaction.date,
                transactions: [transaction],
            });
            continue;
        }

        lastSection.transactions.push(transaction);
    }

    return sections;
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 16,
        alignItems: "flex-end",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
    },
    backIcon: {
        width: 20,
        height: 20,
        tintColor: "#E0F07D",
        resizeMode: "contain",
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 24,
    },
    transactionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    amountText: {
        color: "#16A34A",
        fontWeight: "700",
        fontSize: 16,
    },
    rightColumn: {
        flex: 1,
        marginLeft: 12,
        alignItems: "flex-end",
    },
    incomeRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        flexWrap: "wrap",
    },
    incomeText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#6B7280",
        marginTop: 4,
        alignSelf: "flex-end",
    },
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        marginLeft: 6,
    },
    actionText: {
        fontSize: 12,
        color: "#111827",
        fontWeight: "600",
    },
    deleteActionButton: {
        borderColor: "#D1D5DB",
    },
    deleteActionText: {
        color: "#111827",
    },
    noteText: {
        fontSize: 14,
        fontWeight: "400",
        color: "#111827",
        marginRight: 10,
    },
    dateText: {
        paddingHorizontal: 16,
        paddingTop: 10,
        fontSize: 13,
        fontWeight: "700",
        color: "#9CA3AF",
    },
    divider: {
        height: 1,
        backgroundColor: "#D1D5DB",
    },
    emptyText: {
        textAlign: "center",
        marginTop: 24,
        color: "#6B7280",
        fontSize: 14,
    },
});
