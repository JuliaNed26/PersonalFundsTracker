import {
    View,
    ViewStyle,
    Text,
    TextStyle,
    TextInput, 
    TextInputProps,
    StyleSheet,
    StyleProp,
    Platform,
} from "react-native";

const DOT_DECIMAL_PATTERN = /^\d*\.?\d*$/;
const DOT_DECIMAL_KEYBOARD_TYPE = Platform.select<TextInputProps["keyboardType"]>({
    ios: "numbers-and-punctuation",
    default: "default",
}) ?? "default";

type Props = {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    errorMessage?: string;
    dotDecimalOnly?: boolean;
    compact?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    inputStyle?: StyleProp<TextStyle>;
} & TextInputProps;

export default function TextInputField({
    label,
    placeholder,
    value,
    onChangeText,
    errorMessage,
    dotDecimalOnly = false,
    compact = false,
    containerStyle,
    labelStyle,
    inputStyle,
    ...textInputProps
}: Props) {
    function handleChangeText(nextValue: string) {
        if (dotDecimalOnly && !DOT_DECIMAL_PATTERN.test(nextValue)) {
            return;
        }

        onChangeText(nextValue);
    }

    return (
        <View style={[styles.container, compact && styles.containerCompact, containerStyle]}>
            {label ? <Text style={[styles.label, compact && styles.labelCompact, labelStyle]}>{label}</Text> : null}
            <TextInput style={[
                styles.textInput,
                compact && styles.textInputCompact,
                errorMessage && styles.textInputError,
                inputStyle,
            ]}
                placeholder={placeholder}
                value={value}
                {...textInputProps}
                autoCorrect={dotDecimalOnly ? false : textInputProps.autoCorrect}
                keyboardType={dotDecimalOnly ? DOT_DECIMAL_KEYBOARD_TYPE : textInputProps.keyboardType}
                onChangeText={handleChangeText}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "80%",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginBottom: 12,
    },
    containerCompact: {
        gap: 6,
        marginBottom: 8,
    },
    label: {
        fontSize: 18,
        color: "#333333",
    },
    labelCompact: {
        fontSize: 16,
    },
    textInput: {
        height: 50,
        borderColor: "#4D4D4D",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    textInputCompact: {
        height: 48,
    },
    textInputError: { borderColor: "red" },
    errorText: { color: "red", fontSize: 12 },
});
