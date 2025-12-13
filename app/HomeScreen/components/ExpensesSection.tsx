import { View, Text, StyleSheet } from 'react-native';
import CircleItem from './CircleItem';
import AddButton from './AddButton';
import { ExpensesData } from '../../../src/types/ExpensesData';

interface ExpensesSectionProps {
  expenses: ExpensesData[];
}

export default function ExpensesSection({ expenses }: ExpensesSectionProps) {
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
        {expenses.map((expense) => (
          <CircleItem
            key={expense.id}
            name={expense.name}
            balance={expense.balance}
            color={
              getExpenseColor(expense.balance, expense.limit) as 'green' | 'red' | 'gray' | 'orange'
            }
            showLimit={expense.limit !== undefined}
            limit={expense.limit}
          />
        ))}
        <AddButton linkToAddPage="/IncomeAddScreen"/>
      </View>
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
