import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
            <Stack.Screen name="IncomeAddScreen" options={{ headerShown: false }} />
            <Stack.Screen name="IncomeUpdateScreen" options={{ headerShown: false }} />
        </Stack>
    )
}