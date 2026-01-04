import { View, Switch, Text, SwitchProps, StyleSheet } from "react-native";

type Props = {
    text: string
} & SwitchProps;

export default function Toggle({value, onValueChange, text}: Props)
{
    return <View style={styles.switchContainer}>
                {text ? <Text style={styles.label}>{text}</Text> : <></>}
                <Switch 
                    style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: "#DBDDD6", true: "#E0F07D" }}
                    thumbColor={value ? "#848E46" : "#7A7C78"}
                />
            </View>
}

const styles = StyleSheet.create({
    switchContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "80%",
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        color: "#333333",
    }
});