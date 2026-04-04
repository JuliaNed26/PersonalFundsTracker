import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface HeaderCardsProps {
    balance: number;
    expenses: number;
    planned: number;
    defaultCurrencySymbol: string;
    onMenuPress: () => void;
}

export default function HeaderCards({
    balance,
    expenses,
    planned,
    defaultCurrencySymbol,
    onMenuPress,
}: HeaderCardsProps) {
    const cards = [
        { key: "balance", label: "Balance", value: balance },
        { key: "expenses", label: "Expenses", value: expenses },
        { key: "planned", label: "Planned", value: planned },
    ];

    const format = (val: number) =>
        val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <View style={styles.container}>
            <View style={styles.cardsWrapper}>
                {cards.map((card, index) => (
                    <LinearGradient
                        key={card.key}
                        colors={["#B4C15F", "#7F8943"]}
                        style={[styles.card, index !== cards.length - 1 && styles.cardSpacing]}>
                        <Text style={styles.cardLabel}>{card.label}</Text>
                        <Text style={styles.cardValue}>{`${format(card.value)} ${defaultCurrencySymbol}`}</Text>
                    </LinearGradient>
                ))}
            </View>

            <Pressable style={styles.menuIcon} onPress={onMenuPress} hitSlop={8}>
                <Ionicons name="menu" size={24} color="#1F2937" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    cardsWrapper: {
        flex: 1,
        flexDirection: "row",
    },
    card: {
        flex: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardSpacing: {
        marginRight: 8,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#000000",
    },
    menuIcon: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
});
