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
import { AccountListData } from '../src/models/data/AccountListData';
import { getAccountsList as getAccountsListAsync } from '../src/services/AccountService';
import { currencyMap } from '../src/models/constants/CurrencyList';
import { Currency } from '../src/models/enums/Currency';
import { getDefaultCurrencySetting } from '../src/services/async-storage/AsyncStorageService';

export default function HomeScreen() {
  const [defaultCurrencySymbol, setDefaultCurrencySymbol] = useState<string>(currencyMap.get(Currency.UAH) || '');
  const [incomes, setIncomes] = useState<IncomeEntity[]>([]);
  const [accountsList, setAccountsList] = useState<AccountListData>({
    accounts: [],
    totalBalance: 0
  });

  const expenses: ExpenseEntity[] = [];

  const totalExpenses = expenses.reduce((sum, item) => sum + item.balance, 0);
  const totalPlanned = expenses.reduce((sum, item) => sum + (item.limit || 0), 0);

  const fetchIncomes = useCallback(async (): Promise<IncomeEntity[]> => {
    return await getAllIncomesAsync();
  }, []);
  
  const fetchAccounts = useCallback(async (): Promise<AccountListData> => {
    return await getAccountsListAsync();
  }, []);

  const getDefaultCurrencySymbol = useCallback(async (): Promise<string> => {
    var defaultCurrency = await getDefaultCurrencySetting();
    return currencyMap.get(defaultCurrency) || '';
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          const incomesList = await fetchIncomes();
          const accountsList = await fetchAccounts();
          const defafaultCurrencySymbol = await getDefaultCurrencySymbol();
          if (isActive) {
            setIncomes(incomesList);
            setAccountsList(accountsList);
            setDefaultCurrencySymbol(defafaultCurrencySymbol);
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
      setAccountsList(accountsList);
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
          <HeaderCards 
            balance={accountsList.totalBalance} 
            expenses={totalExpenses} 
            planned={totalPlanned} 
            defaultCurrencySymbol={defaultCurrencySymbol} />
        </View>

        <View style={styles.contentContainer}>
          <IncomeSection incomes={incomes} onRefresh={handleOnRefresh} />
          <AccountsSection accounts={accountsList.accounts} onRefresh={handleOnRefresh}/>
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
