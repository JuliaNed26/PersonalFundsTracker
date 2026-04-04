import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import type { lineDataItem } from "react-native-gifted-charts";
import DropdownList from "./components/DropdownList";
import { currencyMap } from "../src/models/constants/CurrencyList";
import { Currency } from "../src/models/enums/Currency";
import { getExpenseTrendsAsync } from "../src/services/ExpenseTypesService";
import type { ExpenseTrendSeries } from "../src/services/ExpenseTypesService";
import { getDefaultCurrencySetting } from "../src/services/async-storage/AsyncStorageService";

const TOTAL_SERIES_ID = -1;
const MONTHS_TO_SHOW = 6;
const CHART_POINT_SPACING = 44;
const CHART_SIDE_SPACING = 20;
const CHART_EDGE_SPACING = 16;

type PickerOption = {
    key: number;
    value: string;
};

function formatSum(sum: number): string {
    return sum.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function ExpenseAnalyticsScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [series, setSeries] = useState<ExpenseTrendSeries[]>([]);
    const [selectedSeriesId, setSelectedSeriesId] = useState<number>(TOTAL_SERIES_ID);
    const [defaultCurrencySymbol, setDefaultCurrencySymbol] = useState<string>(currencyMap.get(Currency.UAH) || "");
    const [chartAreaWidth, setChartAreaWidth] = useState<number>(0);

    const loadAnalytics = useCallback(async () => {
        try {
            setIsLoading(true);
            const [trends, defaultCurrency] = await Promise.all([
                getExpenseTrendsAsync(MONTHS_TO_SHOW),
                getDefaultCurrencySetting(),
            ]);

            const allSeries = [trends.totalSeries, ...trends.expenseSeries];
            setSeries(allSeries);
            setSelectedSeriesId(trends.totalSeries.id);
            setDefaultCurrencySymbol(currencyMap.get(defaultCurrency) || "");
        } catch (error) {
            console.error("Failed to load expense analytics", error);
            setSeries([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAnalytics();
        }, [loadAnalytics])
    );

    const pickerData = useMemo<PickerOption[]>(
        () => series.map((currentSeries) => ({ key: currentSeries.id, value: currentSeries.name })),
        [series]
    );

    const selectedSeries = useMemo<ExpenseTrendSeries | null>(() => {
        if (series.length === 0) {
            return null;
        }

        return (
            series.find((currentSeries) => currentSeries.id === selectedSeriesId) ??
            series.find((currentSeries) => currentSeries.id === TOTAL_SERIES_ID) ??
            series[0]
        );
    }, [series, selectedSeriesId]);

    const chartData = useMemo<lineDataItem[]>(
        () =>
            selectedSeries
                ? selectedSeries.points.map((point) => ({
                    value: point.sum,
                    label: point.monthLabel,
                }))
                : [],
        [selectedSeries]
    );

    const chartWidth = Math.max(0, chartAreaWidth - CHART_SIDE_SPACING * 2);
    const chartSpacing = useMemo<number>(() => {
        if (chartData.length <= 1) {
            return CHART_POINT_SPACING;
        }

        const availableWidth = Math.max(1, chartWidth - CHART_EDGE_SPACING * 2);
        return Math.max(1, Math.min(CHART_POINT_SPACING, availableWidth / chartData.length));
    }, [chartData.length, chartWidth]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.navigationContainer}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Image style={styles.backIcon} source={require("./assets/arrow-back.png")} />
                    </Pressable>
                </View>
                <Text style={styles.headerTitle}>Expense Analytics</Text>
            </View>

            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#237F46" />
                </View>
            ) : !selectedSeries ? (
                <View style={styles.loaderContainer}>
                    <Text style={styles.emptyText}>No expense data yet.</Text>
                </View>
            ) : (
                <View style={styles.content}>
                    <DropdownList
                        data={pickerData}
                        defaultOption={pickerData.find((option) => option.key === selectedSeries.id)}
                        setSelected={(selectedKey) => setSelectedSeriesId(Number(selectedKey))}
                        placeholder="Select expense type"
                        label="Expense type"
                    />

                    <View style={styles.chartCard}>
                        <View style={styles.chartTitleContainer}>
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={[styles.chartTitle, { color: selectedSeries.color }]}>
                                {selectedSeries.name}
                            </Text>
                        </View>
                        <View
                            style={styles.chartArea}
                            onLayout={(event) => setChartAreaWidth(event.nativeEvent.layout.width)}>
                            {chartWidth > 0 && (
                                <LineChart
                                    data={chartData}
                                    width={chartWidth}
                                    color={selectedSeries.color}
                                    thickness={3}
                                    spacing={chartSpacing}
                                    initialSpacing={CHART_EDGE_SPACING}
                                    endSpacing={CHART_EDGE_SPACING}
                                    yAxisThickness={0}
                                    yAxisLabelWidth={0}
                                    yAxisColor="transparent"
                                    xAxisColor="#9CA3AF"
                                    rulesColor="#E5E7EB"
                                    hideYAxisText
                                    noOfSections={4}
                                    isAnimated
                                    dataPointsColor={selectedSeries.color}
                                    dataPointsRadius={4}
                                    xAxisLabelTextStyle={styles.monthLabel}
                                    pointerConfig={{
                                        showPointerStrip: true,
                                        pointerStripUptoDataPoint: true,
                                        pointerStripColor: "#9CA3AF",
                                        pointerStripWidth: 1,
                                        pointerColor: selectedSeries.color,
                                        radius: 5,
                                        activatePointersOnLongPress: false,
                                        activatePointersInstantlyOnTouch: true,
                                        autoAdjustPointerLabelPosition: true,
                                        pointerLabelWidth: 140,
                                        pointerLabelHeight: 64,
                                        pointerLabelComponent: (items: lineDataItem[]) => {
                                            const selectedPoint = items?.[0];
                                            if (!selectedPoint) {
                                                return null;
                                            }

                                            const value = typeof selectedPoint.value === "number" ? selectedPoint.value : 0;
                                            return (
                                                <View style={styles.pointerLabel}>
                                                    <Text style={styles.pointerMonth}>{selectedPoint.label}</Text>
                                                    <Text style={styles.pointerValue}>{`${formatSum(value)} ${defaultCurrencySymbol}`}</Text>
                                                </View>
                                            );
                                        },
                                    }}
                                />
                            )}
                        </View>
                        <Text style={styles.helperText}>Slide on the line to see monthly sum.</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    header: {
        alignItems: "center",
        justifyContent: "flex-start",
        height: 200,
        paddingHorizontal: 28,
        paddingTop: 40,
        paddingBottom: 24,
        backgroundColor: "#E0F07D",
    },
    navigationContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    headerTitle: {
        marginTop: 24,
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        textAlign: "center",
    },
    loaderContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#6B7280",
    },
    content: {
        flex: 1,
        alignItems: "center",
        paddingTop: 16,
        gap: 12,
    },
    chartCard: {
        width: "94%",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 10,
        paddingVertical: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    chartTitleContainer: {
        height: 24,
        justifyContent: "center",
        marginBottom: 8,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
    },
    chartArea: {
        width: "100%",
        paddingHorizontal: CHART_SIDE_SPACING,
        overflow: "hidden",
    },
    monthLabel: {
        color: "#6B7280",
        fontSize: 12,
    },
    helperText: {
        marginTop: 8,
        fontSize: 12,
        textAlign: "center",
        color: "#6B7280",
    },
    pointerLabel: {
        backgroundColor: "#E0F07D",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        justifyContent: "center",
    },
    pointerMonth: {
        textAlign: "center",
        fontSize: 12,
        color: "#111827",
        fontWeight: "600",
    },
    pointerValue: {
        marginTop: 4,
        textAlign: "center",
        fontSize: 13,
        color: "#111827",
        fontWeight: "700",
    },
});
