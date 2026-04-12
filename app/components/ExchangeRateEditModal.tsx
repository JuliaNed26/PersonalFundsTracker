import { useEffect, useState } from "react";
import { Modal as RNModal, Pressable, StyleSheet, Text, View } from "react-native";
import { currencyMap } from "../../src/models/constants/CurrencyList";
import ExchangeRateListItemData from "../../src/models/data/ExchangeRateListItemData";
import ExchangeRateUpdateData from "../../src/models/data/ExchangeRateUpdateData";
import ExchangeRateValidationResult from "../../src/models/data/ExchangeRateValidationResult";
import { Currency } from "../../src/models/enums/Currency";
import {
    formatDotDecimalInput,
    parseDotDecimalInput,
} from "../../src/services/DotDecimalInputService";
import { validateExchangeRateUpdateData } from "../../src/services/ExchangeRateValidationService";
import TextInputField from "./TextInputField";

type Props = {
    visible: boolean;
    setIsVisible: (visible: boolean) => void;
    exchangeRate: ExchangeRateListItemData | null;
    onSubmit: (data: ExchangeRateUpdateData) => Promise<void>;
};

function getCurrencyLabel(currency: number | undefined): string {
    if (currency === undefined) {
        return "";
    }

    return currencyMap.get(currency) ?? currency.toString();
}

export default function ExchangeRateEditModal({
    visible,
    setIsVisible,
    exchangeRate,
    onSubmit,
}: Props) {
    const [purchaseInput, setPurchaseInput] = useState("");
    const [sellInput, setSellInput] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | undefined>();
    const [validationResult, setValidationResult] = useState<ExchangeRateValidationResult>({
        isValid: true,
    });

    function resetState() {
        setPurchaseInput("");
        setSellInput("");
        setErrorMessage(undefined);
        setValidationResult({ isValid: true });
    }

    useEffect(() => {
        if (!visible || !exchangeRate) {
            resetState();
            return;
        }

        setPurchaseInput(formatDotDecimalInput(exchangeRate.purchaseRate));
        setSellInput(formatDotDecimalInput(exchangeRate.sellRate));
        setErrorMessage(undefined);
        setValidationResult({ isValid: true });
    }, [exchangeRate, visible]);

    function handleClose() {
        setIsVisible(false);
        resetState();
    }

    function handlePurchaseChange(value: string) {
        setPurchaseInput(value);
        setErrorMessage(undefined);
        setValidationResult((currentValidationResult) => ({
            ...currentValidationResult,
            isValid: true,
            purchaseRateErrorMessage: undefined,
        }));
    }

    function handleSellChange(value: string) {
        setSellInput(value);
        setErrorMessage(undefined);
        setValidationResult((currentValidationResult) => ({
            ...currentValidationResult,
            isValid: true,
            sellRateErrorMessage: undefined,
        }));
    }

    async function handleSubmit() {
        if (!exchangeRate) {
            setErrorMessage("Exchange rate is not selected.");
            return;
        }

        const parsedPurchaseRate = parseDotDecimalInput(purchaseInput) ?? Number.NaN;
        const parsedSellRate = parseDotDecimalInput(sellInput) ?? Number.NaN;
        const nextExchangeRate: ExchangeRateUpdateData = {
            targetCurrency: exchangeRate.targetCurrency,
            purchaseRate: parsedPurchaseRate,
            sellRate: parsedSellRate,
        };
        const nextValidationResult = validateExchangeRateUpdateData(nextExchangeRate);
        setValidationResult(nextValidationResult);

        if (!nextValidationResult.isValid) {
            setErrorMessage(undefined);
            return;
        }

        try {
            await onSubmit(nextExchangeRate);
            handleClose();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to update exchange rate");
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
                        <Text style={styles.title}>Edit exchange rate</Text>
                        <Pressable onPress={handleClose} hitSlop={8}>
                            <Text style={styles.closeText}>X</Text>
                        </Pressable>
                    </View>

                    <View style={styles.currencyContext}>
                        <Text style={styles.contextLabel}>
                            {`Source currency: ${getCurrencyLabel(Currency.UAH)}`}
                        </Text>
                        <Text style={styles.contextLabel}>
                            {`Target currency: ${getCurrencyLabel(exchangeRate?.targetCurrency)}`}
                        </Text>
                    </View>

                    <TextInputField
                        label="Purchase rate"
                        placeholder="0.00"
                        value={purchaseInput}
                        compact
                        containerStyle={styles.fullWidthField}
                        onChangeText={handlePurchaseChange}
                        errorMessage={validationResult.purchaseRateErrorMessage}
                        dotDecimalOnly
                    />

                    <TextInputField
                        label="Sell rate"
                        placeholder="0.00"
                        value={sellInput}
                        compact
                        containerStyle={styles.fullWidthField}
                        onChangeText={handleSellChange}
                        errorMessage={validationResult.sellRateErrorMessage}
                        dotDecimalOnly
                    />

                    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                    <View style={styles.buttonsRow}>
                        <Pressable style={[styles.button, styles.cancelButton]} onPress={handleClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Update</Text>
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
    currencyContext: {
        gap: 4,
        marginBottom: 16,
    },
    contextLabel: {
        fontSize: 14,
        color: "#4B5563",
    },
    fullWidthField: {
        width: "100%",
        marginBottom: 0,
    },
    errorText: {
        marginTop: 8,
        fontSize: 13,
        color: "#B91C1C",
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 16,
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
