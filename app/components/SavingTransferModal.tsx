import { useEffect, useState } from "react";
import { Modal as RNModal, Pressable, StyleSheet, Text, View } from "react-native";
import { currencyMap } from "../../src/models/constants/CurrencyList";
import TextInputField from "./TextInputField";

type Props = {
    visible: boolean;
    setIsVisible: (visible: boolean) => void;
    title: string;
    buttonText: string;
    currency: number;
    maxAmount: number;
    onSubmit: (amount: number) => Promise<void> | void;
};

export default function SavingTransferModal({
    visible,
    setIsVisible,
    title,
    buttonText,
    currency,
    maxAmount,
    onSubmit,
}: Props) {
    const [amount, setAmount] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    useEffect(() => {
        if (!visible) {
            setAmount("");
            setErrorMessage(undefined);
        }
    }, [visible]);

    function handleClose() {
        setIsVisible(false);
        setAmount("");
        setErrorMessage(undefined);
    }

    async function handleSubmit() {
        const parsedAmount = parseFloat(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setErrorMessage("Amount must be greater than 0");
            return;
        }

        if (parsedAmount > maxAmount) {
            setErrorMessage(
                `Amount cannot exceed ${maxAmount.toFixed(2)} ${currencyMap.get(currency) ?? ""}`
            );
            return;
        }

        try {
            await onSubmit(parsedAmount);
            handleClose();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to save transfer");
        }
    }

    return (
        <RNModal
            visible={visible}
            transparent
            statusBarTranslucent
            animationType="slide"
            onRequestClose={handleClose}>
            <View style={styles.backdrop}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <Pressable onPress={handleClose} hitSlop={8}>
                            <Text style={styles.closeText}>X</Text>
                        </Pressable>
                    </View>

                    <TextInputField
                        label={`Amount (${currencyMap.get(currency) ?? currency})`}
                        placeholder="0.00"
                        value={amount}
                        compact
                        containerStyle={styles.fullWidthField}
                        onChangeText={(value) => {
                            setAmount(value);
                            setErrorMessage(undefined);
                        }}
                        errorMessage={errorMessage}
                        dotDecimalOnly
                    />

                    <Text style={styles.maxAmountText}>
                        {`Available limit: ${maxAmount.toFixed(2)} ${currencyMap.get(currency) ?? ""}`}
                    </Text>

                    <View style={styles.buttonsRow}>
                        <Pressable style={[styles.button, styles.cancelButton]} onPress={handleClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>{buttonText}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 36,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    title: {
        flex: 1,
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginRight: 12,
    },
    closeText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    maxAmountText: {
        fontSize: 12,
        color: "#6B7280",
        width: "100%",
        marginTop: -2,
        marginBottom: 16,
    },
    fullWidthField: {
        width: "100%",
        marginBottom: 0,
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#E0F07D",
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#F3F4F6",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
    },
});
