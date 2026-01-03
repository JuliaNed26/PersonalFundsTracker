import { TouchableOpacity, Text, StyleSheet, View, StyleProp, ViewStyle, GestureResponderEvent } from "react-native";

type Props = {
    onHandleSubmit?: (event: GestureResponderEvent) => void,
};

export default function SubmitButton({ onHandleSubmit }: Props) {
    return <TouchableOpacity onPress={onHandleSubmit} style={style.button}>
            <Text style={style.buttonText}>Submit</Text>
        </TouchableOpacity>;
}

const style = StyleSheet.create({
    button: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 48,
        borderRadius: 11,
        backgroundColor: "#DEEF75",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333333",
    }
});