import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
            <Stack.Screen name="IncomeAddScreen" options={{ headerShown: false }} />
            <Stack.Screen name="IncomeUpdateScreen" options={{ headerShown: false }} />
            <Stack.Screen name="IncomeTransactionsScreen" options={{ headerShown: false }} />
            <Stack.Screen name="AccountAddScreen" options={{ headerShown: false }} />
            <Stack.Screen name="AccountUpdateScreen" options={{ headerShown: false }} />
            <Stack.Screen name="AccountTransactionsScreen" options={{ headerShown: false }} />
            <Stack.Screen name="AccountSavingsScreen" options={{ headerShown: false }} />
            <Stack.Screen name="ExpenseTypeAddScreen" options={{ headerShown: false }} />
            <Stack.Screen name="ExpenseTypeUpdateScreen" options={{ headerShown: false }} />
            <Stack.Screen name="ExpenseTransactionsScreen" options={{ headerShown: false }} />
            <Stack.Screen name="ContextMenuScreen" options={{ headerShown: false }} />
            <Stack.Screen name="ExpenseAnalyticsScreen" options={{ headerShown: false }} />
            <Stack.Screen name="SavingGoalsScreen" options={{ headerShown: false }} />
            <Stack.Screen name="SavingGoalAddScreen" options={{ headerShown: false }} />
            <Stack.Screen name="SavingGoalUpdateScreen" options={{ headerShown: false }} />
        </Stack>
    )
}
