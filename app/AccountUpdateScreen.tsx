import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getAccountByIdAsync, insertAccountAsync, updateAccountAsync } from "../src/db/Repositories/AccountRepositiory";
import { StyleSheet, Switch, Text, View } from "react-native";
import HeaderForEditScreens from "./components/HeaderForEditScreens";
import TextInputField from "./components/TextInputField";
import SubmitButton from "./components/SubmitButton";
import { AccountFormErrors } from "./AccountFormScreens/Errors";
import { AccountUpdateEntity } from "../src/models/entities/AccountUpdateEntity";
import Toggle from "./components/Toggle";


export default function AccountUpdateScreen() {
    const router = useRouter();
    const accountIdParam = useLocalSearchParams().accountId as string | undefined;
    const [accountToUpdate, setAccountToUpdate] = useState<AccountUpdateEntity>({
        id: 0,
        name: "",
        balance: 0,
        includeToTotalBalance: true,
    } as AccountUpdateEntity);
    const [errors, setErrors] = useState<AccountFormErrors>({});

    useEffect(() => {

        if (accountIdParam === undefined || Number.isNaN(accountIdParam)) {
            console.error('IncomeId is missing or invalid in route params');
            return;
        }
        var accountId = parseInt(accountIdParam);
        
        (async () => {
            try {
                var account = await getAccountByIdAsync(accountId);
                if (!account)
                {
                    console.error(`Account with id ${accountId} was not found`);
                    return;
                }
                var mappedAccount = {
                    id: account.id,
                    name: account.name,
                    balance: account.balance,
                    includeToTotalBalance: account.includeToTotalBalance
                } as AccountUpdateEntity;
                setAccountToUpdate(mappedAccount);
            }
            catch {
                console.error('Error when retrieving account');
                return;
            }
        })();
    }, [accountIdParam]);

    async function handleSubmit() {
        var isValid = validate();
        if (!isValid) 
        {
            return;
        }
        
        try {
            await updateAccountAsync(accountToUpdate!);
        }
        catch (err) {
            console.error('Failed to update account', err);
        }

        router.back();
    }

    function validate() : boolean {
        const name = accountToUpdate.name.trim();
        let isValid = true;
        if (!name)
        {
            setErrors((prev) => ({ ...prev, nameErrorMessage: "Name is required" }));
            isValid = false;
        }

        if (Number.isNaN(accountToUpdate.balance)) 
        {
            setErrors((prev) => ({ ...prev, balanceErrorMessage: "Balance must be a number" }));
            isValid = false;
        }

        return isValid;
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