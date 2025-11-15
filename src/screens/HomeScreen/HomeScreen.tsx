import { useState } from 'react';
import { View, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import IncomeSection from './components/IncomeSection';
import { StyleSheet } from 'react-native';
import HeaderCards from './components/HeaderCards';
import AccountsSection from './components/AccountsSection';
import ExpensesSection from './components/ExpensesSection';

export default function HomeScreen() {
  const [incomes, setIncomes] = useState([
    { id: '1', name: 'Salary', balance: 20000, currencyId: 'UAH' },
    { id: '2', name: 'Scholarship', balance: 2000, currencyId: 'UAH' },
  ]);

  const [accounts, setAccounts] = useState([
    { id: '1', name: 'UAN Cash', balance: 2000, currencyId: 'UAH', includeToTotalBalance: true },
    { id: '2', name: 'Mono card', balance: 20000, currencyId: 'UAH', includeToTotalBalance: true },
    { id: '3', name: 'Privat card', balance: 3000, currencyId: 'UAH', includeToTotalBalance: true },
    { id: '4', name: 'UAN Cash 2', balance: 4000, currencyId: 'UAH', includeToTotalBalance: true },
    {
      id: '5',
      name: 'Mono card 2',
      balance: 23000,
      currencyId: 'UAH',
      includeToTotalBalance: true,
    },
    {
      id: '6',
      name: 'Privat card 2',
      balance: 5000,
      currencyId: 'UAH',
      includeToTotalBalance: true,
    },
  ]);

  const [expenses, setExpenses] = useState([
    {
      id: '1',
      name: 'Groceries',
      balance: 13645.95,
      limit: 12000,
      currencyId: 'UAH',
    },
    { id: '2', name: 'House', balance: 3000, limit: 4000, currencyId: 'UAH' },
    { id: '3', name: 'Entertainment', balance: 0, currencyId: 'UAH' },
    { id: '4', name: 'Transport', balance: 1450, limit: 1000, currencyId: 'UAH' },
    { id: '5', name: 'Eating outside', balance: 250, currencyId: 'UAH' },
    { id: '6', name: 'Health', balance: 0, limit: 5000, currencyId: 'UAH' },
    {
      id: '7',
      name: 'Groceries',
      balance: 13645.95,
      limit: 12000,
      currencyId: 'UAH',
    },
    { id: '8', name: 'House', balance: 3000, limit: 4000, currencyId: 'UAH' },
    { id: '9', name: 'Entertainment', balance: 0, currencyId: 'UAH' },
    { id: '10', name: 'Transport', balance: 1450, limit: 1000, currencyId: 'UAH' },
    {
      id: '11',
      name: 'Eating outside',
      balance: 250,
      currencyId: 'UAH',
    },
    { id: '12', name: 'Health', balance: 0, limit: 5000, currencyId: 'UAH' },
  ]);

  const totalAccounts = accounts.reduce(
    (sum, item) => (item.includeToTotalBalance ? sum + item.balance : sum),
    0,
  );
  const totalExpenses = expenses.reduce((sum, item) => sum + item.balance, 0);
  const totalPlanned = expenses.reduce((sum, item) => sum + (item.limit || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
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
    </SafeAreaView>
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
    backgroundColor: '#FCD34D',
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
