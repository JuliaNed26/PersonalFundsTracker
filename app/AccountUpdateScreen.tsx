import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import HeaderForEditScreens from "./components/HeaderForEditScreens";
import TextInputField from "./components/TextInputField";
import SubmitButton from "./components/SubmitButton";
import { AccountFormErrors } from "./AccountFormScreens/Errors";
import Toggle from "./components/Toggle";
import { getAccountAsync, updateAccountAsync } from "../src/services/AccountService";
import AccountUpdateData from "../src/models/data/AccountUpdateData";
import { mapAccountDataToAccountUpdateEntity } from "../src/services/MapService";
import { validateAccountUpdateData } from "../src/services/AccountValidationService";


export default function AccountUpdateScreen() {
    const router = useRouter();
    const accountIdParam = useLocalSearchParams().accountId as string | undefined;
    const [accountToUpdate, setAccountToUpdate] = useState<AccountUpdateData>({
        id: 0,
        name: "",
        balance: 0,
        includeToTotalBalance: true,
    } as AccountUpdateData);
    const [errors, setErrors] = useState<AccountFormErrors>({});

    useEffect(() => {

        if (accountIdParam === undefined || Number.isNaN(accountIdParam)) {
            throw new Error('IncomeId is missing or invalid in route params');
        }
        var accountId = parseInt(accountIdParam);
        
        (async () => {
            var account = await getAccountAsync(accountId); 
            setAccountToUpdate(mapAccountDataToAccountUpdateEntity(account)); 
        })();
    }, [accountIdParam]);

    async function handleSubmit() {
        var isValid = validate();
        if (!isValid) 
        {
            return;
        }
        
        await updateAccountAsync(accountToUpdate); 

        router.back();
    }

    function validate() : boolean {
        const validationResult = validateAccountUpdateData(accountToUpdate);
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
            <HeaderForEditScreens text="Update Account" />
            <View style={styles.formContainer}>
                <View style={styles.inputsContainer}>
                    <TextInputField 
                        label="Account name"
                        placeholder={accountToUpdate.name}
                        value={accountToUpdate.name}
                        onChangeText={(text) => setAccountToUpdate((prev) => ({ ...prev, name: text }))}
                        errorMessage={errors.nameErrorMessage}/>
                    <TextInputField 
                        label="Balance" 
                        placeholder={accountToUpdate.balance.toString()}
                        value={accountToUpdate.balance.toString()}
                        onChangeText={(text) => setAccountToUpdate((prev) => ({ ...prev, balance: parseFloat(text) || 0 }))}
                        errorMessage={errors.balanceErrorMessage}/>
                    <Toggle 
                        value={accountToUpdate.includeToTotalBalance}
                        onValueChange={(value) => setAccountToUpdate((prev) => ({ ...prev, includeToTotalBalance: value }))}
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