import { ReactNode } from "react";
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

type Props = {
    label: string;
    onPress: () => void;
    icon?: ReactNode;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
};

export default function ContextMenuButton({
    label,
    onPress,
    icon,
    disabled = false,
    style,
    textStyle,
}: Props) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                pressed && !disabled ? styles.pressed : null,
                disabled ? styles.disabled : null,
                style,
            ]}>
            <View style={styles.content}>
                {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
                <Text style={[styles.text, textStyle]}>{label}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: "100%",
        minHeight: 60,
        borderRadius: 16,
        backgroundColor: "#D5E86E",
        justifyContent: "center",
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    pressed: {
        opacity: 0.75,
    },
    disabled: {
        opacity: 0.5,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 22,
        alignItems: "center",
    },
    text: {
        flex: 1,
        fontSize: 28 / 2,
        fontWeight: "700",
        color: "#1F2937",
    },
});
