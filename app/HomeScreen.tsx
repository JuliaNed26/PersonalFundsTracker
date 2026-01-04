import { View, ScrollView, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { AccountEntity } from '../src/models/entities/AccountEntity';
import { IncomeEntity } from '../src/models/entities/IncomeEntity';
import { ExpenseEntity } from '../src/models/entities/ExpenseEntity';
import HeaderCards from './HomeScreen/components/HeaderCards';
import IncomeSection from './HomeScreen/components/IncomeSection';
import AccountsSection from './HomeScreen/components/AccountsSection';
import ExpensesSection from './HomeScreen/components/ExpensesSection';
import { getAllIncomesAsync } from '../src/db/Repositories/IncomeRepository';
import { useFocusEffect } from 'expo-router';
import { getAllAccountsAsync } from '../src/db/Repositories/AccountRepositiory';

export default function HomeScreen() {
  const [incomes, setIncomes] = useState<IncomeEntity[]>([]);
  const [accounts, setAccounts] = useState<AccountEntity[]>([]);

  const expenses: ExpenseEntity[] = [];

  const totalAccounts = accounts.reduce(
    (sum, item) => (item.includeToTotalBalance ? sum + item.balance : sum),
    0,
  );
  const totalExpenses = expenses.reduce((sum, item) => sum + item.balance, 0);
  const totalPlanned = expenses.reduce((sum, item) => sum + (item.limit || 0), 0);

  const fetchIncomes = useCallback(async (): Promise<IncomeEntity[]> => {
    return await getAllIncomesAsync();
  }, []);
  
  const fetchAccounts = useCallback(async (): Promise<AccountEntity[]> => {
    return await getAllAccountsAsync();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          const incomesList = await fetchIncomes();
          const accountsList = await fetchAccounts();
          if (isActive) {
            setIncomes(incomesList);
            setAccounts(accountsList);
          }
        } catch (err) {
          console.error('Failed to load incomes', err);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [fetchIncomes, fetchAccounts]),
  );

  async function handleOnRefresh()
  {
    try 
    { 
      const incomesList = await fetchIncomes();
      const accountsList = await fetchAccounts();
      setIncomes(incomesList);
      setAccounts(accountsList);
    } 
    catch (err) 
    { 
      console.error('Failed to refresh incomes', err);
    }
  }
  
  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCD34D" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <HeaderCards balance={totalAccounts} expenses={totalExpenses} planned={totalPlanned} />
        </View>

        <View style={styles.contentContainer}>
          <IncomeSection incomes={incomes} onRefresh={handleOnRefresh} />
          <AccountsSection accounts={accounts} onRefresh={handleOnRefresh}/>
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
