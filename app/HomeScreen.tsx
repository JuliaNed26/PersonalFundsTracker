import { View, ScrollView, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import HeaderCards from './HomeScreen/components/HeaderCards';
import IncomeSection from './HomeScreen/components/IncomeSection';
import AccountsSection from './HomeScreen/components/AccountsSection';
import ExpensesSection from './HomeScreen/components/ExpensesSection';
import { useFocusEffect, useRouter } from 'expo-router';
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
import { addTransferTransactionAsync } from '../src/services/AccountTransferService';
import { addExpenseTransactionAsync } from '../src/services/ExpenseTransactionService';
import { getTodayLocalDate } from '../src/services/DateService';

export default function HomeScreen() {
  const router = useRouter();
  const [defaultCurrency, setDefaultCurrency] = useState<number>(Currency.UAH);
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
  const [accountToAccountModalVisible, setAccountToAccountModalVisible] = useState<boolean>(false);
  const [accountToExpenseModalVisible, setAccountToExpenseModalVisible] = useState<boolean>(false);
  const [sourceAccountForTransfer, setSourceAccountForTransfer] = useState<AccountData | null>(null);
  const [targetAccountForTransfer, setTargetAccountForTransfer] = useState<AccountData | null>(null);

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

  const getDefaultCurrency = useCallback(async (): Promise<number> => {
    return await getDefaultCurrencySetting();
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
        date: getTodayLocalDate(),
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

  async function submitTransferTransaction(transferredSum: number, sumAddToAccount: number) {
    if (!sourceAccountForTransfer || !targetAccountForTransfer || !transferredSum || !sumAddToAccount) {
      return;
    }

    try {
      await addTransferTransactionAsync(
        {
          sourceAccountId: sourceAccountForTransfer.id,
          targetAccountId: targetAccountForTransfer.id,
          sumSent: transferredSum,
          sumReceived: sumAddToAccount,
          date: getTodayLocalDate()
        },
        sourceAccountForTransfer,
        targetAccountForTransfer
      );

      setAccountToAccountModalVisible(false);
      setSelectedAccount(null);
      setSourceAccountForTransfer(null);
      setTargetAccountForTransfer(null);
      await handleOnRefresh();
    } catch (err) {
      console.error('Failed to add account transfer transaction', err);
    }
  }

  async function submitExpenseTransaction(transferredSum: number, sumReceived: number, note?: string) {
    if (!selectedAccount || !selectedExpenseType || !transferredSum || !sumReceived) {
      return;
    }

    try {
      await addExpenseTransactionAsync(
        {
          accountId: selectedAccount.id,
          expenseId: selectedExpenseType.id,
          sumSent: transferredSum,
          sumReceived: sumReceived,
          date: getTodayLocalDate(),
          note,
        },
        selectedAccount
      );

      setAccountToExpenseModalVisible(false);
      setSelectedExpenseType(null);
      setSelectedAccount(null);
      await handleOnRefresh();
    } catch (err) {
      console.error('Failed to add expense transaction', err);
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
    if (!pressedAccount) {
      setSelectedAccount(null);
      return;
    }

    if (selectedIncome) {
      setSelectedAccount(pressedAccount);
      setIncomeToAccountModalVisible(true);
      if (selectedExpenseType) {
        setSelectedExpenseType(null);
      }
      return;
    }

    if (selectedAccount && selectedAccount.id !== pressedAccount.id) {
      setSourceAccountForTransfer(selectedAccount);
      setTargetAccountForTransfer(pressedAccount);
      setAccountToAccountModalVisible(true);
      return;
    }

    setSelectedAccount(pressedAccount);

    if (selectedExpenseType)
    {
      setSelectedExpenseType(null);
    }
  }

  function onExpenseTypePress(pressedExpenseType: ExpenseTypeData | null){
    if (!pressedExpenseType)
    {
      setSelectedExpenseType(null);
      return;
    }

    if ((selectedExpenseType && selectedExpenseType.id === pressedExpenseType.id) || selectedIncome || !selectedAccount)
    {
      setSelectedExpenseType(null);
      return;
    }

    setSelectedExpenseType(pressedExpenseType);
    setAccountToExpenseModalVisible(true);
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
      const currentDefaultCurrency = await getDefaultCurrency();
      setDefaultCurrency(currentDefaultCurrency);
      const currencySymbol = currencyMap.get(currentDefaultCurrency) || '';
      setDefaultCurrencySymbol(currencySymbol);
    } 
    catch (err) 
    { 
      console.error('Failed to refresh incomes', err);
    }
  }

  function handleOpenContextMenu() {
    router.push('/ContextMenuScreen');
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
            defaultCurrencySymbol={defaultCurrencySymbol}
            onMenuPress={handleOpenContextMenu} />
        </View>

        <View style={styles.contentContainer}>
          <IncomeSection incomes={incomes} selectedIncome={selectedIncome} setSelectedIncome={onIncomePress} onRefresh={handleOnRefresh} />
          <AccountsSection accounts={accountsList.accounts} selectedAccount={selectedAccount} setSelectedAccount={onAccountPress} onRefresh={handleOnRefresh}/>
          <ExpensesSection
            expenses={expenseTypes}
            selectedExpenseType={selectedExpenseType}
            setSelectedExpenseType={onExpenseTypePress}
            onRefresh={handleOnRefresh}/>
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
      <TransactionsModal
        visible={accountToAccountModalVisible}
        setIsVisible={setAccountToAccountModalVisible}
        text={`Transfer from ${sourceAccountForTransfer?.name} to ${targetAccountForTransfer?.name}?`}
        buttonText="Transfer >>>"
        sourceCurrency={sourceAccountForTransfer?.currency || Currency.UAH}
        targetCurrency={targetAccountForTransfer?.currency || Currency.UAH}
        buttonAction={submitTransferTransaction}
        maxSourceAmount={sourceAccountForTransfer?.availableBalance}
        showNote={false}
        onClose={() => {
          setSelectedAccount(null);
          setSelectedIncome(null);
          setSelectedExpenseType(null);
          setSourceAccountForTransfer(null);
          setTargetAccountForTransfer(null);
        }}/>
      <TransactionsModal
        visible={accountToExpenseModalVisible}
        setIsVisible={setAccountToExpenseModalVisible}
        text={`Add transaction from ${selectedAccount?.name} to ${selectedExpenseType?.name}?`}
        buttonText="Add Transaction >>>"
        sourceCurrency={selectedAccount?.currency || Currency.UAH}
        targetCurrency={defaultCurrency}
        buttonAction={submitExpenseTransaction}
        maxSourceAmount={selectedAccount?.availableBalance}
        showNote={true}
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
