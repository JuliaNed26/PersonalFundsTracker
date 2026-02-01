import { View, ScrollView, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import HeaderCards from './HomeScreen/components/HeaderCards';
import IncomeSection from './HomeScreen/components/IncomeSection';
import AccountsSection from './HomeScreen/components/AccountsSection';
import ExpensesSection from './HomeScreen/components/ExpensesSection';
import { useFocusEffect } from 'expo-router';
import { AccountListData } from '../src/models/data/AccountListData';
import { getAccountsListAsync } from '../src/services/AccountService';
import { currencyMap } from '../src/models/constants/CurrencyList';
import { Currency } from '../src/models/enums/Currency';
import { getDefaultCurrencySetting } from '../src/services/async-storage/AsyncStorageService';
import { IncomeSourceData } from '../src/models/data/IncomeSourceData';
import { getIncomesAsync } from '../src/services/IncomeService';
import ExpenseTypeData from '../src/models/data/ExpenseTypeData';
import { getAllExpensesForCurrentMonthAsync } from '../src/services/ExpenseTypesService';
import { AccountData } from '../src/models/data/AccountData';
import TransactionsModal from './components/TransactionsModal';
import { addIncomeTransactionAsync } from '../src/services/IncomeTransactionService';

export default function HomeScreen() {
  const [defaultCurrencySymbol, setDefaultCurrencySymbol] = useState<string>(currencyMap.get(Currency.UAH) || '');
  const [incomes, setIncomes] = useState<IncomeSourceData[]>([]);
  const [accountsList, setAccountsList] = useState<AccountListData>({
    accounts: [],
    totalBalance: 0
  });
  const [expenseTypes, setExpenseTypes] = useState<ExpenseTypeData[]>([]);

  const [selectedIncome, setSelectedIncome] = useState<IncomeSourceData | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseTypeData | null>(null);
  const [incomeToAccountModalVisible, setIncomeToAccountModalVisible] = useState<boolean>(false);

  // ToDo: implement total planned calculation
  const totalExpenses = expenseTypes.reduce((sum, item) => sum + item.balance, 0);
  const totalPlanned = expenseTypes.reduce((sum, item) => sum + (item.limit || 0), 0);

  const fetchIncomes = useCallback(async (): Promise<IncomeSourceData[]> => {
    return await getIncomesAsync();
  }, []);
  
  const fetchAccounts = useCallback(async (): Promise<AccountListData> => {
    return await getAccountsListAsync();
  }, []);

  const fetchExpenseTypes = useCallback(async (): Promise<ExpenseTypeData[]> => {
    return await getAllExpensesForCurrentMonthAsync();
  }, []);

  const getDefaultCurrencySymbol = useCallback(async (): Promise<string> => {
    var defaultCurrency = await getDefaultCurrencySetting();
    return currencyMap.get(defaultCurrency) || '';
  }, []);

  async function submitIncomeTransaction(transferredSum: number, sumAddToAccount: number, note?: string) {
    if (!selectedIncome || !selectedAccount || !transferredSum || !sumAddToAccount) {
      return;
    }

    try {

      await addIncomeTransactionAsync({
        incomeId: selectedIncome.id,
        accountId: selectedAccount.id,
        sum: transferredSum,
        currency: selectedIncome.currency,
        date: new Date().toISOString().split('T')[0],
        note: note
      }, 
      selectedAccount,
      sumAddToAccount);

      setIncomeToAccountModalVisible(false);
      setSelectedAccount(null);
      setSelectedIncome(null);
      await handleOnRefresh();
    } catch (err) {
      console.error('Failed to add income transaction', err);
    }
  }

  function onIncomePress(pressedIncome: IncomeSourceData | null){ 
    setSelectedIncome(pressedIncome);

    if (selectedExpenseType)
    {
      setSelectedExpenseType(null);
    }

    if (selectedAccount)
    {
      setSelectedAccount(null);
    }
  }

  function onAccountPress(pressedAccount: AccountData | null){
    setSelectedAccount(pressedAccount);

    if (pressedAccount)
    {
      if (selectedIncome)
      {
        setIncomeToAccountModalVisible(true);
      }

      if (selectedExpenseType)
      {
        setSelectedExpenseType(null);
      }
    }
  }

  function onExpenseTypePress(pressedExpenseType: ExpenseTypeData){
    if ((selectedExpenseType && selectedExpenseType.id === pressedExpenseType.id)
        || selectedIncome || !selectedAccount)
    {
      setSelectedExpenseType(null);
      return;
    }

    setSelectedExpenseType(pressedExpenseType);
  }

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => await handleOnRefresh())();

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
      const expenseTypesList = await fetchExpenseTypes();
      setIncomes(incomesList);
      setAccountsList(accountsList);
      setExpenseTypes(expenseTypesList);
      setSelectedAccount(null);
      setSelectedExpenseType(null);
      const currencySymbol = await getDefaultCurrencySymbol();
      setDefaultCurrencySymbol(currencySymbol);
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
          <IncomeSection incomes={incomes} selectedIncome={selectedIncome} setSelectedIncome={onIncomePress} onRefresh={handleOnRefresh} />
          <AccountsSection accounts={accountsList.accounts} selectedAccount={selectedAccount} setSelectedAccount={onAccountPress} onRefresh={handleOnRefresh}/>
          <ExpensesSection expenses={expenseTypes} onRefresh={handleOnRefresh}/>
        </View>
      </ScrollView>
      <TransactionsModal
        visible={incomeToAccountModalVisible}
        setIsVisible={setIncomeToAccountModalVisible}
        text={`Add transaction from ${selectedIncome?.name} to ${selectedAccount?.name}?`}
        buttonText="Add Transaction >>>"
        sourceCurrency={selectedIncome?.currency || Currency.UAH}
        targetCurrency={selectedAccount?.currency || Currency.UAH}
        buttonAction={submitIncomeTransaction}
        onClose={() => {
          setSelectedAccount(null);
          setSelectedIncome(null);
          setSelectedExpenseType(null);
        }}/>
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
