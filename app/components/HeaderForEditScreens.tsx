import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import { text } from "drizzle-orm/gel-core";

type Props = {
    text: string;
};
export default function HeaderForEditScreens({ text }: Props) {
    const router = useRouter();

    return <View style={styles.headerBody}>
        <View style={styles.navigationContainer}>
            <TouchableOpacity onPress={() => router.back()}> 
                <Image style={styles.arrowBack} source={require('../assets/arrow-back.png')} />
            </TouchableOpacity>
        </View>
        <Text style={styles.text}>{text}</Text>
    </View>;
}

const styles = StyleSheet.create({
    headerBody: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 50,
        paddingBottom: 50,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: "#E0F07D",
        height: 200,
    },
    text: {
        fontSize: 35,
        fontWeight: "600",
        color: "#333333",
    },
    navigationContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
    },
    arrowBack: {
        width: 35,
        height: 35,
    }
});
