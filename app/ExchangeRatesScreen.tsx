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
import ExchangeRateEditModal from "./components/ExchangeRateEditModal";
import { currencyMap } from "../src/models/constants/CurrencyList";
import ExchangeRateListItemData from "../src/models/data/ExchangeRateListItemData";
import ExchangeRateUpdateData from "../src/models/data/ExchangeRateUpdateData";
import {
    getExchangeRatesAsync,
    updateExchangeRateAsync as updateExchangeRateInServiceAsync,
} from "../src/services/ExchangeRateService";

function formatRate(rate: number): string {
    return rate.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function ExchangeRatesScreen() {
    const router = useRouter();
    const [exchangeRates, setExchangeRates] = useState<ExchangeRateListItemData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedRate, setSelectedRate] = useState<ExchangeRateListItemData | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

    const loadExchangeRates = useCallback(async () => {
        try {
            setIsLoading(true);
            const foundExchangeRates = await getExchangeRatesAsync();
            setExchangeRates(foundExchangeRates);
            setErrorMessage(null);
        } catch (error) {
            console.error("Failed to load exchange rates", error);
            setExchangeRates([]);

            if (error instanceof Error && error.message.includes("support only UAH as pivot currency")) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Failed to load exchange rates.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            void loadExchangeRates();
        }, [loadExchangeRates])
    );

    function handleOpenEditModal(exchangeRate: ExchangeRateListItemData) {
        if (errorMessage) {
            return;
        }

        setSelectedRate(exchangeRate);
        setIsEditModalVisible(true);
    }

    function handleCloseEditModal(visible: boolean) {
        setIsEditModalVisible(visible);

        if (!visible) {
            setSelectedRate(null);
        }
    }

    async function handleUpdateExchangeRate(nextExchangeRate: ExchangeRateUpdateData): Promise<void> {
        await updateExchangeRateInServiceAsync(nextExchangeRate);
        await loadExchangeRates();
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Exchange rates</Text>
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
                    <Text style={styles.helperText}>All rates are shown against UAH</Text>

                    {errorMessage ? (
                        <View style={styles.messageCard}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : exchangeRates.length === 0 ? (
                        <View style={styles.messageCard}>
                            <Text style={styles.emptyStateText}>No exchange rates found.</Text>
                        </View>
                    ) : (
                        <View style={styles.tableCard}>
                            <View style={[styles.row, styles.headerRow]}>
                                <Text style={[styles.headerCell, styles.currencyCell]}>Currency</Text>
                                <Text style={[styles.headerCell, styles.rateCell]}>Purchase</Text>
                                <Text style={[styles.headerCell, styles.rateCell]}>Sell</Text>
                                <Text style={[styles.headerCell, styles.editCell]}>Edit</Text>
                            </View>

                            {exchangeRates.map((exchangeRate, index) => (
                                <View
                                    key={exchangeRate.targetCurrency}
                                    style={[
                                        styles.row,
                                        index < exchangeRates.length - 1 ? styles.rowBorder : null,
                                    ]}>
                                    <Text style={[styles.currencyText, styles.currencyCell]}>
                                        {currencyMap.get(exchangeRate.targetCurrency) ?? exchangeRate.targetCurrency}
                                    </Text>
                                    <Text style={[styles.rateText, styles.rateCell]}>
                                        {formatRate(exchangeRate.purchaseRate)}
                                    </Text>
                                    <Text style={[styles.rateText, styles.rateCell]}>
                                        {formatRate(exchangeRate.sellRate)}
                                    </Text>
                                    <Pressable
                                        hitSlop={8}
                                        onPress={() => handleOpenEditModal(exchangeRate)}
                                        style={styles.editCell}>
                                        <Ionicons name="create-outline" size={18} color="#374151" />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}

            <ExchangeRateEditModal
                visible={isEditModalVisible}
                setIsVisible={handleCloseEditModal}
                exchangeRate={selectedRate}
                onSubmit={handleUpdateExchangeRate}
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
        paddingBottom: 48,
    },
    helperText: {
        marginBottom: 16,
        fontSize: 14,
        color: "#6B7280",
    },
    messageCard: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 20,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    errorText: {
        fontSize: 16,
        lineHeight: 22,
        color: "#991B1B",
        textAlign: "center",
    },
    emptyStateText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
    },
    tableCard: {
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 58,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
    },
    headerRow: {
        minHeight: 52,
        backgroundColor: "#F9FAFB",
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    currencyCell: {
        flex: 1.1,
    },
    rateCell: {
        flex: 1,
        textAlign: "right",
    },
    editCell: {
        width: 44,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
    headerCell: {
        fontSize: 13,
        fontWeight: "700",
        color: "#6B7280",
    },
    currencyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    rateText: {
        fontSize: 15,
        color: "#111827",
    },
});
