import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';

type Props = {
    data: { key: number; value: string }[];
    defaultOption?: { key: number; value: string };
    setSelected: (key: number) => void;
    placeholder: string;
    label?: string;
    compact?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    boxStyle?: StyleProp<ViewStyle>;
};

export default function DropdownList({
    data,
    defaultOption,
    setSelected,
    placeholder,
    label,
    compact = false,
    containerStyle,
    labelStyle,
    boxStyle,
}: Props) {
    return <View style={[style.container, compact && style.containerCompact, containerStyle]}>
            {label ? <Text style={[style.label, compact && style.labelCompact, labelStyle]}>{label}</Text> : null}
            <SelectList 
                data={data} 
                setSelected={setSelected} 
                placeholder={placeholder}
                search={false}
                boxStyles={StyleSheet.flatten([style.dropdownBox, compact && style.dropdownBoxCompact, boxStyle])}
                dropdownStyles={style.dropdown}
                defaultOption={defaultOption} />
        </View>;
}

const style = StyleSheet.create({
    container: {
        width: "80%",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginBottom: 12,
    },
    containerCompact: {
        gap: 6,
        marginBottom: 8,
    },
    dropdownBox: {
        borderColor: "#4D4D4D",
        borderWidth: 1,
        borderRadius: 8,
        height: 50
    },
    dropdownBoxCompact: {
        height: 48,
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
    labelCompact: {
        fontSize: 16,
    },
});
