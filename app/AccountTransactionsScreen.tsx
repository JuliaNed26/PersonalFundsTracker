import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import TransactionNoteModal from "./components/TransactionNoteModal";
import IncomeTransactionListItem from "../src/models/data/IncomeTransactionListItem";
import { AccountTransferListItem } from "../src/models/data/AccountTransferListItem";
import ExpenseTransactionListItem from "../src/models/data/ExpenseTransactionListItem";
import { currencyMap } from "../src/models/constants/CurrencyList";
import {
    deleteIncomeTransactionAsync,
    getIncomeTransactionsForAccountAsync,
    updateIncomeTransactionNoteAsync
} from "../src/services/IncomeTransactionService";
import {
    deleteTransferTransactionAsync,
    getTransferTransactionsForAccountAsync
} from "../src/services/AccountTransferService";
import {
    deleteExpenseTransactionAsync,
    getExpenseTransactionsForAccountAsync,
    updateExpenseTransactionNoteAsync
} from "../src/services/ExpenseTransactionService";

type AccountTransactionListItem = {
    key: string;
    type: "income" | "transfer" | "expense";
    date: string;
    amount: number;
    accountCurrency: number;
    title: string;
    note?: string;
    incomeTransaction?: IncomeTransactionListItem;
    transferTransaction?: AccountTransferListItem;
    expenseTransaction?: ExpenseTransactionListItem;
};

type AccountTransactionDateSection = {
    date: string;
    transactions: AccountTransactionListItem[];
};

type EditableTransaction =
    | { type: "income"; transaction: IncomeTransactionListItem }
    | { type: "expense"; transaction: ExpenseTransactionListItem };

export default function AccountTransactionsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const accountIdParam = params.accountId;
    const accountId = typeof accountIdParam === "string"
        ? parseInt(accountIdParam, 10)
        : Array.isArray(accountIdParam)
            ? parseInt(accountIdParam[0], 10)
            : NaN;

    const [transactions, setTransactions] = useState<AccountTransactionListItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [selectedEditableTransaction, setSelectedEditableTransaction] = useState<EditableTransaction | null>(null);
    const [note, setNote] = useState<string>("");

    const loadTransactions = useCallback(async () => {
        if (Number.isNaN(accountId)) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const [incomeTransactions, transferTransactions, expenseTransactions] = await Promise.all([
                getIncomeTransactionsForAccountAsync(accountId),
                getTransferTransactionsForAccountAsync(accountId),
                getExpenseTransactionsForAccountAsync(accountId),
            ]);

            const incomeItems: AccountTransactionListItem[] = incomeTransactions.map((transaction, index) => {
                const sumForAccount = transaction.sumForAccount ?? transaction.sumAddedToAccount ?? transaction.sum;
                return {
                    key: `income-${transaction.accountId}-${transaction.incomeId}-${transaction.date}-${transaction.sum}-${index}`,
                    type: "income",
                    date: transaction.date,
                    amount: sumForAccount,
                    accountCurrency: transaction.accountCurrency,
                    title: transaction.incomeName,
                    note: transaction.note,
                    incomeTransaction: transaction,
                };
            });

            const transferItems: AccountTransactionListItem[] = transferTransactions.map((transaction, index) =>
                mapTransferTransactionToListItem(transaction, index)
            );

            const expenseItems: AccountTransactionListItem[] = expenseTransactions.map((transaction, index) => ({
                key: `expense-${transaction.accountId}-${transaction.expenseId}-${transaction.date}-${transaction.sumSent}-${transaction.sumReceived}-${index}`,
                type: "expense",
                date: transaction.date,
                amount: -transaction.sumSent,
                accountCurrency: transaction.accountCurrency,
                title: transaction.expenseName,
                note: transaction.note,
                expenseTransaction: transaction,
            }));

            const merged = [...incomeItems, ...transferItems, ...expenseItems].sort((left, right) => {
                if (left.date === right.date) {
                    return right.key.localeCompare(left.key);
                }
                return right.date.localeCompare(left.date);
            });

            setTransactions(merged);
        } catch (error) {
            console.error("Failed to load transactions", error);
        } finally {
            setIsLoading(false);
        }
    }, [accountId]);

    useFocusEffect(
        useCallback(() => {
            loadTransactions();
        }, [loadTransactions])
    );

    function formatSum(sum: number) {
        if (Number.isInteger(sum)) {
            return sum.toString();
        }
        return sum.toFixed(2);
    }

    function formatSignedSum(sum: number) {
        const sign = sum >= 0 ? "+" : "-";
        return `${sign} ${formatSum(Math.abs(sum))}`;
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
            "December"
        ];

        if (Number.isNaN(year) || Number.isNaN(monthIndex) || Number.isNaN(day) || monthIndex < 0 || monthIndex > 11) {
            return dateString;
        }

        return `${day} ${monthNames[monthIndex]} ${year}`;
    }

    function handleEditIncomeNotePress(transaction: IncomeTransactionListItem) {
        setSelectedEditableTransaction({
            type: "income",
            transaction,
        });
        setNote(transaction.note || "");
        setEditModalVisible(true);
    }

    function handleEditExpenseNotePress(transaction: ExpenseTransactionListItem) {
        setSelectedEditableTransaction({
            type: "expense",
            transaction,
        });
        setNote(transaction.note || "");
        setEditModalVisible(true);
    }

    async function handleSaveNote() {
        if (!selectedEditableTransaction) {
            return;
        }

        try {
            if (selectedEditableTransaction.type === "income") {
                await updateIncomeTransactionNoteAsync(selectedEditableTransaction.transaction, note);
            } else {
                await updateExpenseTransactionNoteAsync(selectedEditableTransaction.transaction, note);
            }
            setEditModalVisible(false);
            setSelectedEditableTransaction(null);
            setNote("");
            await loadTransactions();
        } catch (error) {
            console.error("Failed to update note", error);
        }
    }

    async function handleDeleteIncomeTransaction(transaction: IncomeTransactionListItem) {
        try {
            await deleteIncomeTransactionAsync(transaction);
            if (selectedEditableTransaction?.type === "income") {
                setEditModalVisible(false);
                setSelectedEditableTransaction(null);
                setNote("");
            }
            await loadTransactions();
        } catch (error) {
            console.error("Failed to delete transaction", error);
        }
    }

    async function handleDeleteExpenseTransaction(transaction: ExpenseTransactionListItem) {
        try {
            await deleteExpenseTransactionAsync(transaction);
            if (selectedEditableTransaction?.type === "expense") {
                setEditModalVisible(false);
                setSelectedEditableTransaction(null);
                setNote("");
            }
            await loadTransactions();
        } catch (error) {
            console.error("Failed to delete expense transaction", error);
        }
    }

    async function handleDeleteTransferTransaction(transaction: AccountTransferListItem) {
        try {
            await deleteTransferTransactionAsync(transaction);
            await loadTransactions();
        } catch (error) {
            console.error("Failed to delete transfer transaction", error);
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
                            {section.transactions.map((transaction) => {
                                const currencyLabel = currencyMap.get(transaction.accountCurrency) || "";
                                return (
                                    <View key={transaction.key}>
                                        <View style={styles.transactionRow}>
                                            <Text
                                                style={[
                                                    styles.amountText,
                                                    transaction.amount >= 0 ? styles.positiveAmountText : styles.negativeAmountText,
                                                ]}
                                            >
                                                {`${formatSignedSum(transaction.amount)} ${currencyLabel}`}
                                            </Text>
                                            <View style={styles.rightColumn}>
                                                <View style={styles.incomeRow}>
                                                    {transaction.type === "income" || transaction.type === "expense" ? (
                                                        <>
                                                            <Text style={styles.noteText}>
                                                                {transaction.note ? transaction.note : ""}
                                                            </Text>
                                                            <View style={styles.actionsRow}>
                                                                <Pressable
                                                                    style={styles.actionButton}
                                                                    onPress={() => {
                                                                        if (transaction.type === "income" && transaction.incomeTransaction) {
                                                                            handleEditIncomeNotePress(transaction.incomeTransaction);
                                                                            return;
                                                                        }

                                                                        if (transaction.type === "expense" && transaction.expenseTransaction) {
                                                                            handleEditExpenseNotePress(transaction.expenseTransaction);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Text style={styles.actionText}>Edit</Text>
                                                                </Pressable>
                                                                <Pressable
                                                                    style={[styles.actionButton, styles.deleteActionButton]}
                                                                    onPress={() => {
                                                                        if (transaction.type === "income" && transaction.incomeTransaction) {
                                                                            handleDeleteIncomeTransaction(transaction.incomeTransaction);
                                                                            return;
                                                                        }

                                                                        if (transaction.type === "expense" && transaction.expenseTransaction) {
                                                                            handleDeleteExpenseTransaction(transaction.expenseTransaction);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Text style={[styles.actionText, styles.deleteActionText]}>Delete</Text>
                                                                </Pressable>
                                                            </View>
                                                        </>
                                                    ) : (
                                                        <View style={styles.actionsRow}>
                                                            <Pressable
                                                                style={[styles.actionButton, styles.deleteActionButton]}
                                                                onPress={() => {
                                                                    if (transaction.transferTransaction) {
                                                                        handleDeleteTransferTransaction(transaction.transferTransaction);
                                                                    }
                                                                }}
                                                            >
                                                                <Text style={[styles.actionText, styles.deleteActionText]}>Delete</Text>
                                                            </Pressable>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.incomeText}>{transaction.title}</Text>
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
                    if (!selectedEditableTransaction) {
                        return;
                    }

                    if (selectedEditableTransaction.type === "income") {
                        handleDeleteIncomeTransaction(selectedEditableTransaction.transaction);
                        return;
                    }

                    handleDeleteExpenseTransaction(selectedEditableTransaction.transaction);
                }}
                onClose={() => {
                    setSelectedEditableTransaction(null);
                    setNote("");
                }}
            />
        </SafeAreaView>
    );
}

function mapTransferTransactionToListItem(
    transaction: AccountTransferListItem,
    index: number
): AccountTransactionListItem {
    return {
        key: `transfer-${transaction.sourceAccountId}-${transaction.targetAccountId}-${transaction.date}-${transaction.sumSent}-${transaction.sumReceived}-${index}`,
        type: "transfer",
        date: transaction.date,
        amount: transaction.sumForAccount,
        accountCurrency: transaction.accountCurrency,
        title: transaction.isOutgoing
            ? `Transfer to ${transaction.counterpartAccountName}`
            : `Transfer from ${transaction.counterpartAccountName}`,
        transferTransaction: transaction,
    };
}

function groupTransactionsByDate(
    transactions: AccountTransactionListItem[]
): AccountTransactionDateSection[] {
    const sections: AccountTransactionDateSection[] = [];

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
        fontWeight: "700",
        fontSize: 16,
    },
    positiveAmountText: {
        color: "#16A34A",
    },
    negativeAmountText: {
        color: "#DC2626",
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
