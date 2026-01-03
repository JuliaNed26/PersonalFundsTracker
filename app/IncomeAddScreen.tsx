import { StyleSheet, View } from "react-native"
import TextInputField from "./components/TextInputField";
import HeaderForEditScreens from "./components/HeaderForEditScreens";
import { useState } from "react";
import SubmitButton from "./components/SubmitButton";
import { useRouter } from "expo-router";
import DropdownList from "./components/DropdownList";
import { currencyDropdownData } from "../src/models/constants/CurrencyList";
import { insertIncomeAsync } from "../src/db/IncomeRepository";
import { IncomeFormErrors } from "./IncomeFormScreens/models/Errors";

export default function IncomeAddScreen() {
    const router = useRouter();
    const [incomeTypeName, setIncomeTypeName] = useState("");
    const [balance, setBalance] = useState("0");
    const [currency, setCurrency] = useState(0);
    const [errors, setErrors] = useState<IncomeFormErrors>({});
    
    async function handleSubmit() {
        var isValid = validate();
        if (!isValid) 
        {
            return;
        }
        const name = incomeTypeName.trim();
        const parsedBalance = parseFloat(balance || "0") || 0;
        if (!name) return;

        try {
            await insertIncomeAsync({ name, balance: parsedBalance, currency });
        } catch (err) {
            console.error('Failed to insert income', err);
        }

        router.back();
    }

    function validate() : boolean {
        const name = incomeTypeName.trim();
        let isValid = true;
        if (!name)
        {
            setErrors((prev) => ({ ...prev, nameErrorMessage: "Name is required" }));
            isValid = false;
        }

        if (Number.isNaN(parseFloat(balance))) 
        {
            setErrors((prev) => ({ ...prev, balanceErrorMessage: "Balance must be a number" }));
            isValid = false;
        }

        return isValid;
    }

    return (
        <View style={styles.screenContainer}>
            <HeaderForEditScreens text="Add Income" />
            <View style={styles.formContainer}>
                <View style={styles.inputsContainer}>
                    <TextInputField 
                        label="Income type name"
                        placeholder="Enter name" 
                        value={incomeTypeName}
                        onChangeText={setIncomeTypeName}
                        errorMessage={errors.nameErrorMessage}/>
                    <TextInputField 
                        label="Balance" 
                        placeholder="0"
                        value={balance}
                        onChangeText={setBalance}
                        errorMessage={errors.balanceErrorMessage}/>
                    <DropdownList
                        data={currencyDropdownData}
                        defaultOption={currencyDropdownData[0]}
                        setSelected={(key) => setCurrency(key)}
                        placeholder="Select currency"
                        label="Choose currency"/>
                </View>
                <View style={styles.submitButton}>
                    <SubmitButton onHandleSubmit={handleSubmit}/>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
    },
    formContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
        marginTop: 100,
    },
});