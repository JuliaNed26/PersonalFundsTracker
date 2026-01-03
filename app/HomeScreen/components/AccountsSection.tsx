import { View, Text, ScrollView, StyleSheet } from 'react-native';
import CircleItem from './CircleItem';
import AddButton from './AddButton';
import { AccountData } from '../../../src/types/AccountData';

interface AccountsSectionProps {
  accounts: AccountData[];
}

export default function AccountsSection({ accounts }: AccountsSectionProps) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {accounts.map((account) => (
          <CircleItem
            key={account.id}
            name={account.name}
            balance={account.balance}
            color="orange"
          />
        ))}
        <AddButton linkToAddPage="/IncomeAddScreen"/>
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
