import { View, ScrollView, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import IncomeSection from './components/IncomeSection';
import { StyleSheet } from 'react-native';
import HeaderCards from './components/HeaderCards';
import AccountsSection from './components/AccountsSection';
import ExpensesSection from './components/ExpensesSection';
import { getAllIncomesAsync, insertIncomeAsync } from '../../db/IncomeRepository';
import { AccountEntity } from '../../models/AccountEntity';
import { ExpenseEntity } from '../../models/ExpenseEntity';
import { useEffect, useState } from 'react';
import { IncomeEntity } from '../../models/IncomeEntity';

export default function HomeScreen() {
  const [incomes, setIncomes] = useState<IncomeEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await insertIncomeAsync({ name: 'Salary', currency: 0 });
        await insertIncomeAsync({ name: 'Scholarship', currency: 0 });

        const data = await getAllIncomesAsync();
        if (!cancelled) {
          setIncomes(data);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error loading incomes', e);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const accounts: AccountEntity[] = [];
  const expenses: ExpenseEntity[] = [];

  if (loading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

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
