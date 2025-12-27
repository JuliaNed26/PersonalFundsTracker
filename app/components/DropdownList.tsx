import { StyleSheet, Text, View } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';

type Props = {
    data: { key: number; value: string }[];
    setSelected: (key: number) => void;
    placeholder: string;
    label?: string;
};

export default function DropdownList({ data, setSelected, placeholder, label }: Props) {
    return <View style={style.container}>
            {label ? <Text style={style.label}>{label}</Text> : null}
            <SelectList 
                data={data} 
                setSelected={setSelected} 
                placeholder={placeholder}
                search={false}
                boxStyles={style.dropdown} />
        </View>;
}

const style = StyleSheet.create({
    container: {
        width: "80%",
        height: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
    },
    dropdown: {
        borderColor: "#4D4D4D",
        borderWidth: 1,
        borderRadius: 8,
        height: 50,
    },
    label: {
        fontSize: 18,
        color: "#333333",
    },
});