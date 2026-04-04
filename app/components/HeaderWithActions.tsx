import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
};

export default function HeaderWithActions({ title, onClose, onSubmit }: Props) {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.actionsRow}>
                <Pressable onPress={onClose} hitSlop={8} style={styles.iconButton}>
                    <Ionicons name="close" size={28} color="#333333" />
                </Pressable>
                <Pressable onPress={onSubmit} hitSlop={8} style={styles.iconButton}>
                    <Ionicons name="checkmark" size={28} color="#4A5F1A" />
                </Pressable>
            </View>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        height: 200,
        paddingTop: 52,
        paddingBottom: 36,
        paddingHorizontal: 20,
        backgroundColor: "#E0F07D",
        justifyContent: "space-between",
    },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    iconButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 26,
        lineHeight: 34,
        fontWeight: "700",
        textAlign: "center",
        color: "#333333",
    },
});
