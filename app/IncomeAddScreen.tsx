import { StyleSheet, View } from "react-native"
import TextInputField from "./components/TextInputField";
import HeaderForEditScreens from "./components/HeaderForEditScreens";
import { useState } from "react";
import SubmitButton from "./components/SubmitButton";
import { useRouter } from "expo-router";
import DropdownList from "./components/DropdownList";
import { currencyDropdownData } from "../src/models/constants/CurrencyList";
import { IncomeFormErrors } from "./IncomeFormScreens/models/Errors";
import { validateIncomeSourceData } from "../src/services/IncomeValidationService";
import { IncomeSourceData } from "../src/models/data/IncomeSourceData";
import { addIncomeAsync } from "../src/services/IncomeService";

export default function IncomeAddScreen() {
    const router = useRouter();
    const [incomeSourceData, setIncomeSourceData] = useState<IncomeSourceData>(
        { 
            id: 0, 
            name: "", 
            balance: 0, 
            currency: 0 
        } as IncomeSourceData);
    const [errors, setErrors] = useState<IncomeFormErrors>({});
    
    async function handleSubmit() {
        var isValid = validate();
        if (!isValid) 
        {
            return;
        }

        await addIncomeAsync(incomeSourceData);

        router.back();
    }

    function validate() : boolean {
        const validationResult = validateIncomeSourceData(incomeSourceData);
        if (validationResult.isValid) {
            return true;
        }
        
        if (validationResult.nameErrorMessage) {
            setErrors((prev) => ({ ...prev, nameErrorMessage: validationResult.nameErrorMessage }));
        }

        return false;
    }

    return (
        <View style={styles.screenContainer}>
            <HeaderForEditScreens text="Add Income" />
            <View style={styles.formContainer}>
                <View style={styles.inputsContainer}>
                    <TextInputField 
                        label="Income type name"
                        placeholder="Enter name" 
                        value={incomeSourceData.name}
                        onChangeText={(text) => setIncomeSourceData({ ...incomeSourceData, name: text })}
                        errorMessage={errors.nameErrorMessage}/>
                    <DropdownList
                        data={currencyDropdownData}
                        defaultOption={currencyDropdownData[0]}
                        setSelected={(key) => setIncomeSourceData((prev) => ({ ...prev, currency: key }))}
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
        flex: 1,
        marginTop: 20,
    },
    inputsContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 24,
    },
    submitButton: {
        position: "absolute",
        bottom: 30,
        left: "10%",
        right: "10%",
    }
});
