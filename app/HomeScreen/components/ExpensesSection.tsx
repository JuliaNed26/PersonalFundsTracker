import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import CircleItem from './CircleItem';
import AddButton from './AddButton';
import ExpenseTypeData from '../../../src/models/data/ExpenseTypeData';
import Modal from '../../components/Modal';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { deleteExpenseAsync } from '../../../src/services/ExpenseTypesService';

interface ExpensesSectionProps {
  expenses: ExpenseTypeData[];
  onRefresh?: () => Promise<void> | void;
  selectedExpenseType: ExpenseTypeData | null;
  setSelectedExpenseType: (expenseType: ExpenseTypeData | null) => void;
}

export default function ExpensesSection({
  expenses,
  onRefresh,
  selectedExpenseType,
  setSelectedExpenseType,
}: ExpensesSectionProps) {
  const router = useRouter();
  const [expenseTypeModalOpen, setExpenseTypeModalOpen] = useState(false);
  const [deleteExpenseTypeModalOpen, setDeleteExpenseTypeModalOpen] = useState(false);
  const [pressedExpenseType, setPressedExpenseType] = useState<ExpenseTypeData | null>(null);

  async function handleOnLongPress(expenseType: ExpenseTypeData) {
    setExpenseTypeModalOpen(true);
    setPressedExpenseType(expenseType);
  }

  async function handleDeleteActionAccepted() {
    setExpenseTypeModalOpen(false);
    setDeleteExpenseTypeModalOpen(true); 
  }

  async function handleDeleteExpenseType() {
    if (pressedExpenseType)
    {
      try 
      {
        await deleteExpenseAsync(pressedExpenseType.id);
        setDeleteExpenseTypeModalOpen(false);
        if (onRefresh) await onRefresh();
      } 
      catch (err) 
      {
        console.error('Failed to delete expense type', err);
      }
    }
  }

  async function handleUpdateExpenseType() {
    setExpenseTypeModalOpen(false);
    router.push({
      pathname: '/ExpenseTypeUpdateScreen',
      params: { expenseTypeId: pressedExpenseType?.id }
    });
  }

  async function handleWatchTransactions() {
    if (!pressedExpenseType) {
      return;
    }

    setExpenseTypeModalOpen(false);
    router.push({
      pathname: '/ExpenseTransactionsScreen',
      params: { expenseTypeId: pressedExpenseType.id }
    });
  }

  function handleExpenseTypePress(expenseType: ExpenseTypeData) {
    if (selectedExpenseType?.id === expenseType.id) {
      setSelectedExpenseType(null);
      return;
    }

    setSelectedExpenseType(expenseType);
  }

  const getExpenseColor = (balance: number, limit?: number) => {
    if (balance <= 0) return 'darkGray';
    if (limit === undefined || limit <= 0) return 'darkGreen';
    if (balance > limit) return 'red';
    if (balance > limit * 0.75) return 'darkOrange';
    return 'darkGreen';
  };

  const itemWidth = 100;
  const gridWidth = itemWidth * 4 + 48;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
      </View>

      <View style={[styles.grid, { width: gridWidth }]}>
        {expenses.map((expenseType) => (
          <Pressable
            key={expenseType.id}
            onLongPress={() => handleOnLongPress(expenseType)}
            onPress={() => handleExpenseTypePress(expenseType)}
            style={selectedExpenseType?.id === expenseType.id ? styles.highlightedItem : null}>
            <CircleItem
              name={expenseType.name}
              balance={expenseType.balance}
              color={getExpenseColor(expenseType.balance, expenseType.limit)}
              showLimit={expenseType.limit !== undefined}
              limit={expenseType.limit}
            />
          </Pressable>
        ))}
        <AddButton linkToAddPage="/ExpenseTypeAddScreen"/>
      </View>
    
      <Modal
        visible={expenseTypeModalOpen}
        setIsVisible={setExpenseTypeModalOpen} 
        text={`What do you want to do with the expense type ${pressedExpenseType?.name}?`} 
        firstButtonText='Watch Transactions'
        firstButtonAction={handleWatchTransactions}
        firstButtonIcon={<Ionicons name="swap-horizontal-outline" size={18} color="#111827" />}
        secondButtonText='Update'
        secondButtonAction={handleUpdateExpenseType}
        secondButtonIcon={<Ionicons name="create-outline" size={18} color="#111827" />}
        thirdButtonText='Delete'
        thirdButtonAction={handleDeleteActionAccepted}
        thirdButtonIcon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
        thirdButtonStyle={styles.deleteButton}
        thirdButtonTextStyle={styles.deleteButtonText}/>
      
      <Modal
        visible={deleteExpenseTypeModalOpen}
        setIsVisible={setDeleteExpenseTypeModalOpen}
        text={`Are you sure you want to delete expense type ${pressedExpenseType?.name}? All transactions associated with this expense type will also be deleted.`} 
        firstButtonText='Cancel'
        firstButtonAction={() => {setDeleteExpenseTypeModalOpen(false)}}
        secondButtonText='Yes'
        secondButtonAction={handleDeleteExpenseType}/>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingRight: 20,
    paddingBottom: 12,
  },
  highlightedItem: {
    opacity: 0.6,
  },
  deleteButton: {
    backgroundColor: '#6B7280',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
});
