import { View, Text, StyleSheet } from 'react-native';

interface HeaderCardsProps {
  balance: number;
  expenses: number;
  planned: number;
}

export default function HeaderCards({ balance, expenses, planned }: HeaderCardsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.cardsWrapper}>
        <View style={[styles.card, styles.balanceCard]}>
          <Text style={styles.cardLabel}>Balance</Text>
          <Text style={styles.cardValue}>{balance.toLocaleString()} UAN</Text>
        </View>

        <View style={[styles.card, styles.expensesCard]}>
          <Text style={styles.cardLabel}>Expenses</Text>
          <Text style={styles.cardValue}>
            {`${expenses.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} UAN`}
          </Text>
        </View>

        <View style={[styles.card, styles.plannedCard]}>
          <Text style={styles.cardLabel}>Planned</Text>
          <Text style={styles.cardValue}>{planned.toLocaleString()} UAN</Text>
        </View>
      </View>

      <View style={styles.menuIcon}>
        <Text style={styles.burgerMenu}>☰</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  cardsWrapper: {
    flex: 1,
    gap: 8,
    flexDirection: 'row',
  },
  card: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceCard: {
    backgroundColor: '#CA8A04',
  },
  expensesCard: {
    backgroundColor: '#CA8A04',
  },
  plannedCard: {
    backgroundColor: '#CA8A04',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  menuIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  burgerMenu: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});
