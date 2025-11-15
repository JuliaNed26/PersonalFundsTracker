import { View, Text, Pressable, StyleSheet } from 'react-native';

interface CircleItemProps {
  name: string;
  balance?: number;
  color: 'green' | 'orange' | 'gray' | 'red';
  showLimit?: boolean;
  limit?: number;
}

export default function CircleItem({ name, balance, color, showLimit, limit }: CircleItemProps) {
  const colorStyle = {
    green: styles.circleGreen,
    orange: styles.circleOrange,
    gray: styles.circleGray,
    red: styles.circleRed,
  };

  const iconColor = {
    green: styles.iconWhite,
    orange: styles.iconWhite,
    gray: styles.iconGray,
    red: styles.iconWhite,
  };

  return (
    <View style={styles.container}>
      <View style={styles.circleWrapper}>
        <View style={[styles.circle, colorStyle[color]]}>
          <Text style={[styles.icon, iconColor[color]]}>●</Text>
        </View>
        <Pressable style={styles.menuButton}>
          <Text style={styles.menuDots}>⋮</Text>
        </Pressable>
      </View>

      <Text style={styles.name}>{name}</Text>

      {balance !== undefined && (
        <Text style={styles.balance}>
          {`${balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} UAN`}
        </Text>
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
    backgroundColor: '#EF4444',
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
  menuButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
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
  limit: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '500',
  },
});
