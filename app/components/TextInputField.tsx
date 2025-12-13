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
} & TextInputProps;

export default function TextInputField({ label, placeholder }: Props) {
    return (
        <View style={styles.container}>
            {label ? <Text>{label}</Text> : null}
            <TextInput style={styles.textInput}
                placeholder={placeholder}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "80%",
        display: "flex",
        flexDirection: "column",
        height: 60,
        alignContent: "space-between",
        color: "#4D4D4D",
        fontSize: 14
    },
    textInput: {
        borderRadius: 8,
    }
});