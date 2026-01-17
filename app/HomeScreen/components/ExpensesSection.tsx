import { View, Text, StyleSheet, Pressable } from 'react-native';
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
}

export default function ExpensesSection({ expenses, onRefresh }: ExpensesSectionProps) {
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
  const getExpenseColor = (balance: number, limit?: number) => {
    if (balance === 0) return 'gray';
    if (limit && balance > limit) return 'red';
    return 'green';
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
            onLongPress={() => handleOnLongPress(expenseType)}>
            <CircleItem
              name={expenseType.name}
              balance={expenseType.balance}
              color={
                getExpenseColor(expenseType.balance, expenseType.limit) as 'green' | 'red' | 'gray' | 'orange'
              }
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
        firstButtonText='Update'
        firstButtonAction={handleUpdateExpenseType}
        secondButtonText='Delete'
        secondButtonAction={handleDeleteActionAccepted}/>
      
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
});
