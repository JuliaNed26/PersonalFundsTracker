import { Pressable, Modal as RNModal, StyleSheet, Text, View } from "react-native"
import TextInputField from "./TextInputField";
import { useState } from "react";
import { validateTransactionData } from "../../src/services/TransactionValidationService";
import TransactionValidationResult from "../../src/models/data/TransactionValidationResult";
import { convertSumToCurrencyAsync } from "../../src/services/ExchangeRateService";
import { currencyMap } from "../../src/models/constants/CurrencyList";

type Props = {
    visible: boolean,
    setIsVisible: (visible: boolean) => void,
    text?: string,
    buttonText: string,
    sourceCurrency: number,
    targetCurrency: number,
    buttonAction: (transferredSum: number,sumAddToAccount: number, note?: string) => void | Promise<void>,
    onClose?: () => void,
}

export default function TransactionsModal({
    visible, 
    setIsVisible, 
    text,
    buttonText,
    sourceCurrency,
    targetCurrency,
    buttonAction,
    onClose}: Props) {
    
    const [transactionSum, setTransactionSum] = useState('');
    const [sumAddToAccount, setSumAddToAccount] = useState('');
    const [note, setNote] = useState('');
    const [errors, setErrors] = useState<TransactionValidationResult>({ isValid: true });

    let sourceCurrencyLabel = currencyMap.get(sourceCurrency) || '';
    let targetCurrencyLabel = currencyMap.get(targetCurrency) || '';

    const handleClose = () => {
        setIsVisible(false);
        setTransactionSum('');
        setSumAddToAccount('');
        setNote('');
        setErrors({ isValid: true });
        onClose?.();
    };
    
    async function handleTransferredSumChange(
    value: string,
    sourceCurrency: number,
    targetCurrency: number,
    setTransactionSum: (value: string) => void,
    setSumAddToAccount: (value: string) => void
    ): Promise<void> {
        setTransactionSum(value);

        if(targetCurrency === sourceCurrency) {
            setSumAddToAccount(value);
            return;
        }

        try {
            if (!value) {
                setSumAddToAccount('');
                return;
            }
            const numValue = parseFloat(value);
            const convertedSum = await convertSumToCurrencyAsync(numValue, sourceCurrency, targetCurrency);
            setSumAddToAccount(convertedSum.toFixed(2));
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
        await buttonAction(parsedTransferredSum, parsedSumAddToAccount, note);
        setTransactionSum('');
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
                        keyboardType="numeric" 
                        value={transactionSum}
                        errorMessage={errors.transferredSumErrorMessage}
                        onChangeText={(value) => handleTransferredSumChange(
                            value,
                            sourceCurrency,
                            targetCurrency,
                            setTransactionSum,
                            setSumAddToAccount
                        )}
                    />
                    {
                        targetCurrency != sourceCurrency
                        ? <TextInputField
                            label={`Sum ${targetCurrencyLabel}:`}
                            placeholder="0.00"
                            keyboardType="numeric" 
                            value={sumAddToAccount}
                            errorMessage={errors.sumAddToAccountErrorMessage}
                            onChangeText={value => setSumAddToAccount(value)}
                        />
                        : null
                    }
                    <TextInputField
                        label="Note:"
                        placeholder="Note" 
                        value={note}
                        onChangeText={(value) => setNote(value)}
                    />
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
