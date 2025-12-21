import { View, ScrollView, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { AccountEntity } from '../src/models/entities/AccountEntity';
import { IncomeEntity } from '../src/models/entities/IncomeEntity';
import { ExpenseEntity } from '../src/models/entities/ExpenseEntity';
import HeaderCards from './HomeScreen/components/HeaderCards';
import IncomeSection from './HomeScreen/components/IncomeSection';
import AccountsSection from './HomeScreen/components/AccountsSection';
import ExpensesSection from './HomeScreen/components/ExpensesSection';

export default function HomeScreen() {
  const [incomes, setIncomes] = useState<IncomeEntity[]>([]);


  const accounts: AccountEntity[] = [];
  const expenses: ExpenseEntity[] = [];

  const totalAccounts = accounts.reduce(
    (sum, item) => (item.includeToTotalBalance ? sum + item.balance : sum),
    0,
  );
  const totalExpenses = expenses.reduce((sum, item) => sum + item.balance, 0);
  const totalPlanned = expenses.reduce((sum, item) => sum + (item.limit || 0), 0);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCD34D" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <HeaderCards balance={totalAccounts} expenses={totalExpenses} planned={totalPlanned} />
        </View>

        <View style={styles.contentContainer}>
          <IncomeSection incomes={incomes} />
          <AccountsSection accounts={accounts} />
          <ExpensesSection expenses={expenses} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#E0F07D',
    paddingTop: 32,
    paddingBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    marginTop: -16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#F3F4F6',
    paddingTop: 16,
  },
});
