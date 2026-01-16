import { useRouter } from "expo-router";
import { useState } from "react";
import { AccountEntity } from "../src/models/entities/AccountEntity";
import { StyleSheet, View } from "react-native";
import HeaderForEditScreens from "./components/HeaderForEditScreens";
import TextInputField from "./components/TextInputField";
import DropdownList from "./components/DropdownList";
import { currencyDropdownData } from "../src/models/constants/CurrencyList";
import SubmitButton from "./components/SubmitButton";
import { AccountFormErrors } from "./AccountFormScreens/Errors";
import Toggle from "./components/Toggle";
import { addAccountAsync } from "../src/services/AccountService";
import { AccountData } from "../src/models/data/AccountData";
import { validateAccountData } from "../src/services/AccountValidationService";

export default function AccountAddScreen() {
    const router = useRouter();
    const [accountToAdd, setAccountToAdd] = useState<AccountData>({
        id: 0,
        name: "",
        currency: 0,
        balance: 0,
        includeToTotalBalance: true,
    } as AccountData);
    const [errors, setErrors] = useState<AccountFormErrors>({});

    async function handleSubmit() {
        var isValid = validate();
        if (!isValid) 
        {
            return;
        }

        await addAccountAsync(accountToAdd); 
        
        router.back();
    }

    function validate() : boolean {
        const validationResult = validateAccountData(accountToAdd);
        if (validationResult.isValid) {
            return true;
        }

        if (validationResult.nameErrorMessage) {
            setErrors((prev) => ({ ...prev, nameErrorMessage: validationResult.nameErrorMessage }));
        }

        if (validationResult.balanceErrorMessage) {
            setErrors((prev) => ({ ...prev, balanceErrorMessage: validationResult.balanceErrorMessage }));
        }

        return false;
    }

    return (
        <View style={styles.screenContainer}>
            <HeaderForEditScreens text="Add Account" />
            <View style={styles.formContainer}>
                <View style={styles.inputsContainer}>
                    <TextInputField 
                        label="Account name"
                        placeholder="Enter name" 
                        value={accountToAdd.name}
                        onChangeText={(text) => setAccountToAdd((prev) => ({ ...prev, name: text }))}
                        errorMessage={errors.nameErrorMessage}/>
                    <TextInputField 
                        label="Balance" 
                        placeholder="0"
                        value={accountToAdd.balance.toString()}
                        onChangeText={(text) => setAccountToAdd((prev) => ({ ...prev, balance: parseFloat(text) || 0 }))}
                        errorMessage={errors.balanceErrorMessage}/>
                    <DropdownList
                        data={currencyDropdownData}
                        defaultOption={currencyDropdownData[0]}
                        setSelected={(option) => setAccountToAdd((prev) => ({ ...prev, currency: option }))}
                        placeholder="Select currency"
                        label="Choose currency"/>
                    <Toggle 
                        value={accountToAdd.includeToTotalBalance}
                        onValueChange={(value) => setAccountToAdd((prev) => ({ ...prev, includeToTotalBalance: value }))}
                        text="Include into total balance"
                    />
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
        marginTop: 20,
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
    }
});