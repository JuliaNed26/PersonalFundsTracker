import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import ContextMenuButton from "./components/ContextMenuButton";

export default function ContextMenuScreen() {
    const router = useRouter();

    function handleOpenOptimalLimitsCalculator() {
        return;
    }

    function handleOpenExpenseStatistics() {
        router.push("/ExpenseAnalyticsScreen");
    }

    function handleOpenSavingGoals() {
        router.push("/SavingGoalsScreen");
    }

    function handleOpenExchangeRates() {
        router.push("/ExchangeRatesScreen");
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.navigationContainer}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Image style={styles.backIcon} source={require("./assets/arrow-back.png")} />
                    </Pressable>
                </View>

                <View style={styles.buttonsContainer}>
                    <ContextMenuButton
                        label="Optimal expense limits calculator"
                        onPress={handleOpenOptimalLimitsCalculator}
                        icon={<Ionicons name="wallet-outline" size={22} color="#111827" />}
                    />
                    <ContextMenuButton
                        label="Expense statistics"
                        onPress={handleOpenExpenseStatistics}
                        icon={<Ionicons name="stats-chart-outline" size={22} color="#111827" />}
                    />
                    <ContextMenuButton
                        label="Saving goals"
                        onPress={handleOpenSavingGoals}
                        icon={<MaterialCommunityIcons name="stairs-up" size={22} color="#111827" />}
                    />
                    <ContextMenuButton
                        label="Exchange rates"
                        onPress={handleOpenExchangeRates}
                        icon={<Ionicons name="swap-horizontal-outline" size={22} color="#111827" />}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    container: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 40,
    },
    navigationContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#2F343B",
        alignItems: "center",
        justifyContent: "center",
    },
    backIcon: {
        width: 20,
        height: 20,
        tintColor: "#E0F07D",
        resizeMode: "contain",
    },
    buttonsContainer: {
        marginTop: 56,
        gap: 20,
    },
});
