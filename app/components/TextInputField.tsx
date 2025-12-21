import React from "react";
import {
    View,
    Text,
    TextInput, 
    TextInputProps,
    StyleSheet,
} from "react-native";

type Props = {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
} & TextInputProps;

export default function TextInputField({ label, placeholder, value, onChangeText }: Props) {
    return (
        <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput style={styles.textInput}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "80%",
        height: 100,
        marginTop: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
    },
    label: {
        fontSize: 18,
        color: "#333333",
    },
    textInput: {
        height: 50,
        borderColor: "#4D4D4D",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    }
});