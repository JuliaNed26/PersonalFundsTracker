import { StyleSheet, View } from "react-native"
import TextInputField from "./components/TextInputField";
import HeaderForEditScreens from "./components/HeaderForEditScreens";
import { useState } from "react";
import SubmitButton from "./components/SubmitButton";
import { useRouter } from "expo-router";

export default function IncomeAddScreen() {
    const router = useRouter();
    const [incomeTypeName, setIncomeTypeName] = useState("");
    const [balance, setBalance] = useState("");

    function handleSubmit() {
        console.log(`${incomeTypeName}, ${balance}`);
        router.back();
    }

    return (
        <View>
            <HeaderForEditScreens text="Add Income" />
            <View style={styles.formContainer}>
                <View style={styles.inputsContainer}>
                    <TextInputField 
                        label="Income type name"
                        placeholder="Enter name" 
                        value={incomeTypeName}
                        onChangeText={setIncomeTypeName}/>
                    <TextInputField 
                        label="Balance" 
                        placeholder="0"
                        value={balance}
                        onChangeText={setBalance} />
                </View>
                <View style={styles.submitButton}>
                    <SubmitButton onHandleSubmit={handleSubmit}/>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 50,
        height: "60%",
    },
    inputsContainer: {
        width: "100%",
        height: "80%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    submitButton: {
        width: "80%",
        marginTop: 40,
    },
});