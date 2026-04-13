import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart, PieChart } from "react-native-gifted-charts";
import type { lineDataItem, pieDataItem } from "react-native-gifted-charts";
import DropdownList from "./components/DropdownList";
import { currencyMap } from "../src/models/constants/CurrencyList";
import { Currency } from "../src/models/enums/Currency";
import { getExpenseTrendsAsync } from "../src/services/ExpenseTypesService";
import type { ExpenseTrendSeries } from "../src/services/ExpenseTypesService";
import { getDefaultCurrencySetting } from "../src/services/async-storage/AsyncStorageService";
import { getMonthlyExpenseComparisonAsync } from "../src/services/MonthlyExpenseComparisonService";
import type { MonthlyExpenseComparisonData } from "../src/models/data/MonthlyExpenseComparisonData";

const TOTAL_SERIES_ID = -1;
const MONTHS_TO_SHOW = 6;
const CHART_POINT_SPACING = 44;
const CHART_SIDE_SPACING = 20;
const CHART_EDGE_SPACING = 16;
const DONUT_RADIUS = 72;
const DONUT_INNER_RADIUS = 46;
const EMPTY_DONUT_COLOR = "#E5E7EB";

function hslToHex(h: number, s: number, l: number): string {
    const sl = s / 100;
    const ll = l / 100;
    const a = sl * Math.min(ll, 1 - ll);
    const channel = (n: number) => {
        const k = (n + h / 30) % 12;
        const value = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * value).toString(16).padStart(2, "0");
    };
    return `#${channel(0)}${channel(8)}${channel(4)}`;
}

function generateDistinctColors(count: number): string[] {
    if (count === 0) return [];
    return Array.from({ length: count }, (_, i) => {
        const hue = (i * 360) / count;
        return hslToHex(hue, 65, 42);
    });
}

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

function formatSumShort(sum: number): string {
    if (sum >= 1_000_000) {
        return `${(sum / 1_000_000).toFixed(1)}M`;
    }
    if (sum >= 1_000) {
        return `${(sum / 1_000).toFixed(1)}k`;
    }
    return sum.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function ExpenseAnalyticsScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [series, setSeries] = useState<ExpenseTrendSeries[]>([]);
    const [selectedSeriesId, setSelectedSeriesId] = useState<number>(TOTAL_SERIES_ID);
    const [defaultCurrencySymbol, setDefaultCurrencySymbol] = useState<string>(currencyMap.get(Currency.UAH) || "");
    const [chartAreaWidth, setChartAreaWidth] = useState<number>(0);
    const [comparison, setComparison] = useState<MonthlyExpenseComparisonData | null>(null);
    const [selectedCurrentIndex, setSelectedCurrentIndex] = useState<number | null>(null);
    const [selectedPreviousIndex, setSelectedPreviousIndex] = useState<number | null>(null);

    const loadAnalytics = useCallback(async () => {
        try {
            setIsLoading(true);
            const [trends, defaultCurrency, comparisonData] = await Promise.all([
                getExpenseTrendsAsync(MONTHS_TO_SHOW),
                getDefaultCurrencySetting(),
                getMonthlyExpenseComparisonAsync(),
            ]);

            const allSeries = [trends.totalSeries, ...trends.expenseSeries];
            setSeries(allSeries);
            setSelectedSeriesId(trends.totalSeries.id);
            setDefaultCurrencySymbol(currencyMap.get(defaultCurrency) || "");
            setComparison(comparisonData);
            setSelectedCurrentIndex(null);
            setSelectedPreviousIndex(null);
        } catch (error) {
            console.error("Failed to load expense analytics", error);
            setSeries([]);
            setComparison(null);
            setSelectedCurrentIndex(null);
            setSelectedPreviousIndex(null);
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

    const colorMap = useMemo<Map<number, string>>(() => {
        if (!comparison) return new Map();
        const sorted = [...comparison.byType].sort((a, b) =>
            a.expenseName.localeCompare(b.expenseName)
        );
        const colors = generateDistinctColors(sorted.length);
        return new Map(
            sorted.map((item, index) => [item.expenseId, colors[index]])
        );
    }, [comparison]);

    const currentPieData = useMemo<pieDataItem[]>(() => {
        if (!comparison) return [{ value: 1, color: EMPTY_DONUT_COLOR }];
        const slices = comparison.byType
            .filter((item) => item.currentMonthSum > 0)
            .map((item, index) => ({
                value: item.currentMonthSum,
                color: colorMap.get(item.expenseId) ?? "#9CA3AF",
                onPress: () => setSelectedCurrentIndex((prev) => (prev === index ? null : index)),
            }));
        return slices.length > 0 ? slices : [{ value: 1, color: EMPTY_DONUT_COLOR }];
    }, [comparison, colorMap]);

    const previousPieData = useMemo<pieDataItem[]>(() => {
        if (!comparison) return [{ value: 1, color: EMPTY_DONUT_COLOR }];
        const slices = comparison.byType
            .filter((item) => item.previousMonthSum > 0)
            .map((item, index) => ({
                value: item.previousMonthSum,
                color: colorMap.get(item.expenseId) ?? "#9CA3AF",
                onPress: () => setSelectedPreviousIndex((prev) => (prev === index ? null : index)),
            }));
        return slices.length > 0 ? slices : [{ value: 1, color: EMPTY_DONUT_COLOR }];
    }, [comparison, colorMap]);

    const selectedCurrentInfo = useMemo(() => {
        if (selectedCurrentIndex === null || !comparison) return null;
        const items = comparison.byType.filter((item) => item.currentMonthSum > 0);
        const item = items[selectedCurrentIndex];
        if (!item || comparison.currentMonthTotal === 0) return null;
        return {
            name: item.expenseName,
            percent: (item.currentMonthSum / comparison.currentMonthTotal) * 100,
        };
    }, [selectedCurrentIndex, comparison]);

    const selectedPreviousInfo = useMemo(() => {
        if (selectedPreviousIndex === null || !comparison) return null;
        const items = comparison.byType.filter((item) => item.previousMonthSum > 0);
        const item = items[selectedPreviousIndex];
        if (!item || comparison.previousMonthTotal === 0) return null;
        return {
            name: item.expenseName,
            percent: (item.previousMonthSum / comparison.previousMonthTotal) * 100,
        };
    }, [selectedPreviousIndex, comparison]);

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
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    {comparison && (
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>This Month vs Last Month</Text>
                            <View style={styles.donutRow}>
                                <View style={styles.donutWrapper}>
                                    <Text style={styles.donutPeriodLabel}>This month</Text>
                                    <PieChart
                                        donut
                                        focusOnPress
                                        toggleFocusOnPress
                                        data={currentPieData}
                                        radius={DONUT_RADIUS}
                                        innerRadius={DONUT_INNER_RADIUS}
                                        centerLabelComponent={() =>
                                            selectedCurrentInfo ? (
                                                <View style={styles.donutCenter}>
                                                    <Text style={styles.donutCenterPercent}>
                                                        {`${selectedCurrentInfo.percent.toFixed(1)}%`}
                                                    </Text>
                                                    <Text style={styles.donutCenterName} numberOfLines={1}>
                                                        {selectedCurrentInfo.name}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View style={styles.donutCenter}>
                                                    <Text style={styles.donutCenterValue}>
                                                        {formatSumShort(comparison.currentMonthTotal)}
                                                    </Text>
                                                    <Text style={styles.donutCenterCurrency}>
                                                        {defaultCurrencySymbol}
                                                    </Text>
                                                </View>
                                            )
                                        }
                                    />
                                </View>
                                <View style={styles.donutWrapper}>
                                    <Text style={styles.donutPeriodLabel}>Last month</Text>
                                    <PieChart
                                        donut
                                        focusOnPress
                                        toggleFocusOnPress
                                        data={previousPieData}
                                        radius={DONUT_RADIUS}
                                        innerRadius={DONUT_INNER_RADIUS}
                                        centerLabelComponent={() =>
                                            selectedPreviousInfo ? (
                                                <View style={styles.donutCenter}>
                                                    <Text style={styles.donutCenterPercent}>
                                                        {`${selectedPreviousInfo.percent.toFixed(1)}%`}
                                                    </Text>
                                                    <Text style={styles.donutCenterName} numberOfLines={1}>
                                                        {selectedPreviousInfo.name}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View style={styles.donutCenter}>
                                                    <Text style={styles.donutCenterValue}>
                                                        {formatSumShort(comparison.previousMonthTotal)}
                                                    </Text>
                                                    <Text style={styles.donutCenterCurrency}>
                                                        {defaultCurrencySymbol}
                                                    </Text>
                                                </View>
                                            )
                                        }
                                    />
                                </View>
                            </View>
                        </View>
                    )}

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
                </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    content: {
        alignItems: "center",
        paddingTop: 16,
        paddingBottom: 24,
        gap: 12,
    },
    sectionCard: {
        width: "94%",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        textAlign: "center",
        marginBottom: 16,
    },
    donutRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    donutWrapper: {
        alignItems: "center",
        gap: 8,
    },
    donutPeriodLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
    },
    donutCenter: {
        alignItems: "center",
        justifyContent: "center",
    },
    donutCenterValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },
    donutCenterCurrency: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6B7280",
    },
    donutCenterPercent: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        textAlign: "center",
    },
    donutCenterName: {
        fontSize: 10,
        fontWeight: "500",
        color: "#6B7280",
        textAlign: "center",
        width: DONUT_INNER_RADIUS * 2 - 8,
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
