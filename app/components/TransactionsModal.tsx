import { ModalProps, Pressable, Modal as RNModal, StyleSheet, Text, View } from "react-native"
import TextInputField from "./TextInputField";
import { useState } from "react";

type Props = {
    visible: boolean,
    setIsVisible: (visible: boolean) => void,
    text?: string,
    buttonText: string,
    buttonAction: (sum: string) => void | Promise<void>,
    onClose?: () => void,
}

export default function TransactionsModal({
    visible, 
    setIsVisible, 
    text,
    buttonText,
    buttonAction,
    onClose}: Props) {
    
    const [sum, setSum] = useState('');

    const handleClose = () => {
        setIsVisible(false);
        setSum('');
        onClose?.();
    };

    const handleButtonPress = () => {
        buttonAction(sum);
        setSum('');
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
                        label="Sum:"
                        placeholder="0.00" 
                        keyboardType="numeric" 
                        value={sum}
                        onChangeText={(value) => setSum(value)}
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
