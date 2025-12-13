import { View, Text, ScrollView, StyleSheet } from 'react-native';
import CircleItem from './CircleItem';
import AddButton from './AddButton';
import { IncomeSourceData } from '../../../src/types/IncomeSourceData';

interface IncomeSectionProps {
  incomes: IncomeSourceData[];
}

export default function IncomeSection({ incomes }: IncomeSectionProps) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Incomes</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {incomes.map((income) => (
          <CircleItem key={income.id} name={income.name} balance={income.balance} color="green" />
        ))}
        <AddButton linkToAddPage="/IncomeAddScreen" />
      </ScrollView>

      <View style={styles.divider} />
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
    paddingTop: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    marginHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingRight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
