import { View, Text, Pressable, StyleSheet } from 'react-native';
import { currencyMap } from '../../../src/models/constants/CurrencyList';

interface CircleItemProps {
  name: string;
  balance?: number;
  secondaryBalance?: number;
  currency?: number;
  color: 'green' | 'orange' | 'gray' | 'red' | 'darkGreen' | 'darkOrange' | 'darkGray';
  showLimit?: boolean;
  limit?: number;
}

function formatBalance(balance: number, currency?: number): string {
  return `${balance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency !== undefined && currencyMap.get(currency) || ''}`;
}

export default function CircleItem({ name, balance, secondaryBalance, currency, color, showLimit, limit }: CircleItemProps) {
  const colorStyle = {
    green: styles.circleGreen,
    orange: styles.circleOrange,
    gray: styles.circleGray,
    red: styles.circleRed,
    darkGreen: styles.circleDarkGreen,
    darkOrange: styles.circleDarkOrange,
    darkGray: styles.circleDarkGray,
  };

  const iconColor = {
    green: styles.iconWhite,
    orange: styles.iconWhite,
    gray: styles.iconGray,
    red: styles.iconWhite,
    darkGreen: styles.iconWhite,
    darkOrange: styles.iconWhite,
    darkGray: styles.iconWhite,
  };

  return (
    <View style={styles.container}>
      <View style={styles.circleWrapper}>
        <View style={[styles.circle, colorStyle[color]]}>
          <Text style={[styles.icon, iconColor[color]]}>●</Text>
        </View>
      </View>

      <Text style={styles.name}>{name}</Text>

      {balance !== undefined && (
        secondaryBalance !== undefined ? (
          <View style={styles.balanceContainer}>
            <Text style={styles.balance}>{`Available: ${formatBalance(balance, currency)}`}</Text>
            <Text style={styles.secondaryBalance}>{`Total: ${formatBalance(secondaryBalance, currency)}`}</Text>
          </View>
        ) : (
          <Text style={styles.balance}>
            {formatBalance(balance, currency)}
          </Text>
        )
      )}

      {showLimit && limit !== undefined && <Text style={styles.limit}>{limit}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
    marginRight: 12,
    marginBottom: 12,
  },
  circleWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  circleGreen: {
    backgroundColor: '#4ADE80',
  },
  circleOrange: {
    backgroundColor: '#FB923C',
  },
  circleGray: {
    backgroundColor: '#D1D5DB',
  },
  circleRed: {
    backgroundColor: '#d00000',
  },
  circleDarkGreen: {
    backgroundColor: '#237f46',
  },
  circleDarkOrange: {
    backgroundColor: '#b64a25',
  },
  circleDarkGray: {
    backgroundColor: '#67707c',
  },
  icon: {
    fontSize: 28,
  },
  iconWhite: {
    color: '#FFFFFF',
  },
  iconGray: {
    color: '#9CA3AF',
  },
  menuDots: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    maxWidth: 60,
  },
  balance: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  balanceContainer: {
    alignItems: 'center',
    gap: 2,
  },
  secondaryBalance: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4B5563',
  },
  limit: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '500',
  },
});
