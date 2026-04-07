import { Pressable, Modal as RNModal, StyleSheet, Text, View } from "react-native"
import TextInputField from "./TextInputField";
import { useState } from "react";
import { validateTransactionData } from "../../src/services/TransactionValidationService";
import TransactionValidationResult from "../../src/models/data/TransactionValidationResult";
import { convertSumToCurrencyAsync } from "../../src/services/ExchangeRateService";
import { currencyMap } from "../../src/models/constants/CurrencyList";
import { parseDotDecimalInput } from "../../src/services/DotDecimalInputService";

type Props = {
    visible: boolean,
    setIsVisible: (visible: boolean) => void,
    text?: string,
    buttonText: string,
    sourceCurrency: number,
    targetCurrency: number,
    buttonAction: (transferredSum: number,sumAddToAccount: number, note?: string) => void | Promise<void>,
    showNote?: boolean,
    onClose?: () => void,
    maxSourceAmount?: number,
}

export default function TransactionsModal({
    visible, 
    setIsVisible, 
    text,
    buttonText,
    sourceCurrency,
    targetCurrency,
    buttonAction,
    showNote = true,
    onClose,
    maxSourceAmount}: Props) {
    
    const [transactionSum, setTransactionSum] = useState('');
    const [sumAddToAccount, setSumAddToAccount] = useState('');
    const [note, setNote] = useState('');
    const [errors, setErrors] = useState<TransactionValidationResult>({ isValid: true });

    let sourceCurrencyLabel = currencyMap.get(sourceCurrency) || '';
    let targetCurrencyLabel = currencyMap.get(targetCurrency) || '';

    const clearErrors = () => setErrors({ isValid: true });

    const handleClose = () => {
        setIsVisible(false);
        setTransactionSum('');
        setSumAddToAccount('');
        setNote('');
        setErrors({ isValid: true });
        onClose?.();
    };
    
    async function handleSourceSumChange(value: string): Promise<void> {
        setTransactionSum(value);
        clearErrors();

        if (sourceCurrency === targetCurrency) {
            setSumAddToAccount(value);
            return;
        }

        const numericValue = parseDotDecimalInput(value);
        if (numericValue === null) {
            setSumAddToAccount('');
            return;
        }

        try {
            const convertedSum = await convertSumToCurrencyAsync(numericValue, sourceCurrency, targetCurrency);
            setSumAddToAccount(convertedSum.toFixed(2));
        } catch (error) {
            console.error('Error converting currency:', error);
        }
    }

    async function handleTargetSumChange(value: string): Promise<void> {
        setSumAddToAccount(value);
        clearErrors();

        if (sourceCurrency === targetCurrency) {
            setTransactionSum(value);
            return;
        }

        const numericValue = parseDotDecimalInput(value);
        if (numericValue === null) {
            setTransactionSum('');
            return;
        }

        try {
            const convertedSum = await convertSumToCurrencyAsync(numericValue, targetCurrency, sourceCurrency);
            setTransactionSum(convertedSum.toFixed(2));
        } catch (error) {
            console.error('Error converting currency:', error);
        }
    }

    const handleButtonPress = async () => {
        let parsedTransferredSum = parseFloat(transactionSum);
        let parsedSumAddToAccount = parseFloat(sumAddToAccount);
        let validationResult = validateTransactionData(parsedTransferredSum, parsedSumAddToAccount);
        if (!validationResult.isValid) {
            setErrors(validationResult);
            return;
        }

        if (maxSourceAmount !== undefined && parsedTransferredSum > maxSourceAmount) {
            setErrors({
                isValid: false,
                transferredSumErrorMessage: "Insufficient available balance",
            });
            return;
        }

        await buttonAction(parsedTransferredSum, parsedSumAddToAccount, showNote ? note : undefined);
        setTransactionSum('');
        setSumAddToAccount('');
        setNote('');
        setErrors({ isValid: true });
    };

    return (
        <RNModal
            visible={visible}
            transparent
            statusBarTranslucent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={style.backdrop}>
                <View style={style.slidingContent}> 
                    <View style={style.header}>
                        <View style={style.headerSpacer} />
                        <Pressable onPress={handleClose}>
                            <Text style={style.crossButtonText}>✕</Text>
                        </Pressable>
                    </View>
                    { text ? <Text style={style.mainText}>{text}</Text> : null }
                    <TextInputField
                        label={`Sum ${sourceCurrencyLabel}:`}
                        placeholder="0.00" 
                        value={transactionSum}
                        errorMessage={errors.transferredSumErrorMessage}
                        onChangeText={handleSourceSumChange}
                        dotDecimalOnly
                    />
                    {
                        targetCurrency != sourceCurrency
                        ? <TextInputField
                            label={`Sum ${targetCurrencyLabel}:`}
                            placeholder="0.00"
                            value={sumAddToAccount}
                            errorMessage={errors.sumAddToAccountErrorMessage}
                            onChangeText={handleTargetSumChange}
                            dotDecimalOnly
                        />
                        : null
                    }
                    {showNote
                        ? <TextInputField
                            label="Note:"
                            placeholder="Note"
                            value={note}
                            onChangeText={(value) => setNote(value)}
                        />
                        : null}
                    <View style={style.buttonsContainer}>
                        <Pressable style={style.button} onPress={handleButtonPress}>
                            <Text style={style.buttonText}>{buttonText}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </RNModal>
    )
}

const style = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    slidingContent: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingBottom: 40,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        height: 40,
        marginBottom: 16,
    },
    headerSpacer: {
        flex: 1,
    },
    crossButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827'
    },
    mainText: {
        marginVertical: 20,
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        color: '#111827'
    },
    buttonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        width: '100%',
        marginTop: 20,
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        width: 200,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#E0F07D',
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 16,
        color: '#111827'
    }
});
