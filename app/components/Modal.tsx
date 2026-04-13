import type { ReactNode } from "react";
import {
    ModalProps,
    Modal as RNModal,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
    type TextStyle,
} from "react-native";

type Props = ModalProps & {
    visible: boolean;
    setIsVisible: (visible: boolean) => void;
    text?: string;
    firstButtonText: string;
    secondButtonText?: string;
    firstButtonAction: () => void;
    secondButtonAction?: () => void;
    thirdButtonText?: string;
    thirdButtonAction?: () => void;
    fourthButtonText?: string;
    fourthButtonAction?: () => void;
    firstButtonIcon?: ReactNode;
    secondButtonIcon?: ReactNode;
    thirdButtonIcon?: ReactNode;
    fourthButtonIcon?: ReactNode;
    firstButtonStyle?: ViewStyle;
    secondButtonStyle?: ViewStyle;
    thirdButtonStyle?: ViewStyle;
    fourthButtonStyle?: ViewStyle;
    firstButtonTextStyle?: TextStyle;
    secondButtonTextStyle?: TextStyle;
    thirdButtonTextStyle?: TextStyle;
    fourthButtonTextStyle?: TextStyle;
};

export default function Modal({
    visible,
    setIsVisible,
    text,
    firstButtonText,
    firstButtonAction,
    secondButtonText,
    secondButtonAction,
    thirdButtonText,
    thirdButtonAction,
    fourthButtonText,
    fourthButtonAction,
    firstButtonIcon,
    secondButtonIcon,
    thirdButtonIcon,
    fourthButtonIcon,
    firstButtonStyle,
    secondButtonStyle,
    thirdButtonStyle,
    fourthButtonStyle,
    firstButtonTextStyle,
    secondButtonTextStyle,
    thirdButtonTextStyle,
    fourthButtonTextStyle,
}: Props) {
    const buttons = [
        {
            text: firstButtonText,
            action: firstButtonAction,
            icon: firstButtonIcon,
            buttonStyle: firstButtonStyle,
            textStyle: firstButtonTextStyle,
        },
        secondButtonText && secondButtonAction
            ? {
                text: secondButtonText,
                action: secondButtonAction,
                icon: secondButtonIcon,
                buttonStyle: secondButtonStyle,
                textStyle: secondButtonTextStyle,
            }
            : null,
        thirdButtonText && thirdButtonAction
            ? {
                text: thirdButtonText,
                action: thirdButtonAction,
                icon: thirdButtonIcon,
                buttonStyle: thirdButtonStyle,
                textStyle: thirdButtonTextStyle,
            }
            : null,
        fourthButtonText && fourthButtonAction
            ? {
                text: fourthButtonText,
                action: fourthButtonAction,
                icon: fourthButtonIcon,
                buttonStyle: fourthButtonStyle,
                textStyle: fourthButtonTextStyle,
            }
            : null,
    ].filter((button): button is NonNullable<typeof button> => button !== null);

    return (
        <RNModal
            visible={visible}
            transparent
            statusBarTranslucent
            animationType="fade"
            onRequestClose={() => {
                setIsVisible(false);
            }}>
            <View style={style.backdrop}>
                <View style={style.modalContent}>
                    <View style={style.header}>
                        <Pressable onPress={() => setIsVisible(false)}>
                            <Text style={style.crossButtonText}>X</Text>
                        </Pressable>
                    </View>
                    {text ? <Text style={style.mainText}>{text}</Text> : null}
                    <View style={style.buttonsContainer}>
                        {buttons.map((button) => (
                            <Pressable
                                key={button.text}
                                style={[style.button, button.buttonStyle]}
                                onPress={button.action}>
                                <View style={style.buttonContent}>
                                    {button.icon ? <View style={style.iconWrapper}>{button.icon}</View> : null}
                                    <Text style={[style.buttonText, button.textStyle]}>{button.text}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>
        </RNModal>
    );
}

const style = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        maxHeight: "80%",
        padding: 16,
        backgroundColor: "white",
        borderRadius: 12,
        alignItems: "center",
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        width: "100%",
        height: 40,
    },
    crossButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    mainText: {
        marginTop: "30%",
        fontSize: 18,
        fontWeight: "500",
        textAlign: "center",
        color: "#111827",
    },
    buttonsContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginTop: "40%",
    },
    button: {
        display: "flex",
        justifyContent: "center",
        width: "80%",
        height: 50,
        borderRadius: 12,
        backgroundColor: "#E0F07D",
        marginVertical: 6,
        paddingHorizontal: 16,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    iconWrapper: {
        width: 20,
        alignItems: "center",
    },
    buttonText: {
        textAlign: "center",
        fontWeight: "600",
        fontSize: 16,
        color: "#111827",
    },
});
