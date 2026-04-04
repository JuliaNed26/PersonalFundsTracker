import { Pressable, Modal as RNModal, StyleSheet, Text, View } from "react-native";
import TextInputField from "./TextInputField";

type Props = {
    visible: boolean;
    setIsVisible: (visible: boolean) => void;
    text?: string;
    note: string;
    onChangeNote: (value: string) => void;
    onSave: () => void | Promise<void>;
    onDelete: () => void | Promise<void>;
    onClose?: () => void;
};

export default function TransactionNoteModal({
    visible,
    setIsVisible,
    text,
    note,
    onChangeNote,
    onSave,
    onDelete,
    onClose,
}: Props) {
    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
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
                            <Text style={style.crossButtonText}>X</Text>
                        </Pressable>
                    </View>
                    {text ? <Text style={style.mainText}>{text}</Text> : null}
                    <TextInputField
                        label="Note:"
                        placeholder="Note"
                        value={note}
                        onChangeText={onChangeNote}
                    />
                    <View style={style.buttonsContainer}>
                        <Pressable style={style.primaryButton} onPress={onSave}>
                            <Text style={style.buttonText}>Save</Text>
                        </Pressable>
                        <Pressable style={style.deleteButton} onPress={onDelete}>
                            <Text style={style.buttonText}>Delete</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </RNModal>
    );
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
        justifyContent: 'space-between',
        alignContent: 'center',
        width: '80%',
        marginTop: 20,
    },
    primaryButton: {
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        width: 120,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#E0F07D',
    },
    deleteButton: {
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        width: 120,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 16,
        color: '#111827'
    }
});
