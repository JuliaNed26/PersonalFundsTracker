import { useState } from "react";
import { ModalProps, Pressable, Modal as RNModal, StyleSheet, Text, View, ViewStyle } from "react-native"

type Props = ModalProps & {
    visible: boolean,
    setIsVisible: (visible: boolean) => void,
    text?: string,
    firstButtonText: string,
    secondButtonText: string,
    firstButtonAction: () => void,
    secondButtonAction: () => void,
}

export default function Modal({
    visible, 
    setIsVisible, 
    text,
    firstButtonText,
    firstButtonAction,
    secondButtonText,
    secondButtonAction }: Props) {
    return (
        <RNModal
            visible={visible}
            transparent
            statusBarTranslucent
            animationType="fade"
            onRequestClose={() => { setIsVisible(false) }}
        >
            <View style={style.backdrop}>
                <View style={style.modalContent}> 
                    <View style={style.header}>
                        <Pressable onPress={() => setIsVisible(false)}>
                            <Text style={style.crossButtonText}>✕</Text>
                        </Pressable>
                    </View>
                    { text ? <Text style={style.mainText}>{text}</Text> : null }
                    <View style={style.buttonsContainer}>
                        <Pressable style={style.button} onPress={firstButtonAction}>
                            <Text style={style.buttonText}>{firstButtonText}</Text>
                        </Pressable>
                        <Pressable style={style.button} onPress={secondButtonAction}>
                            <Text style={style.buttonText}>{secondButtonText}</Text>
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
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '80%',
        height: '50%',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        alignItems: 'center',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        height: 40,
    },
    crossButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827'
    },
    mainText: {
        marginTop: '30%',
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        color: '#111827'
    },
    buttonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignContent: 'center',
        width: '100%',
        marginTop: '40%',
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        width: 125,
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