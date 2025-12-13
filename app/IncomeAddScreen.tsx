import { View } from "react-native"
import TextInputField from "./components/TextInputField";

export default function IncomeAddScreen() {
    return (
        <View>
            <TextInputField label="Income type name" placeholder="Enter name" />
            <TextInputField label="Balance" placeholder="0" />
        </View>
    );
}