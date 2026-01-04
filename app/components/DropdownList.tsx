import { StyleSheet, Text, View } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';

type Props = {
    data: { key: number; value: string }[];
    defaultOption?: { key: number; value: string };
    setSelected: (key: number) => void;
    placeholder: string;
    label?: string;
};

export default function DropdownList({ data, defaultOption, setSelected, placeholder, label }: Props) {
    return <View style={style.container}>
            {label ? <Text style={style.label}>{label}</Text> : null}
            <SelectList 
                data={data} 
                setSelected={setSelected} 
                placeholder={placeholder}
                search={false}
                boxStyles={style.dropdownBox}
                dropdownStyles={style.dropdown}
                defaultOption={defaultOption} />
        </View>;
}

const style = StyleSheet.create({
    container: {
        width: "80%",
        height: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around"
    },
    dropdownBox: {
        borderColor: "#4D4D4D",
        borderWidth: 1,
        borderRadius: 8,
        height: 50
    },
    dropdown: {
        backgroundColor: '#f2f2f2',
        zIndex: 1000,
        elevation: 1000
    },
    label: {
        fontSize: 18,
        color: "#333333",
    },
});