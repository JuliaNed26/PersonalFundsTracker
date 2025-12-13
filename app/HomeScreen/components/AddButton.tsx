import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

type Props = {
    linkToAddPage: string;
};

export default function AddButton({ linkToAddPage }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <Link href={linkToAddPage}>
          <Text style={styles.plus}>+</Text>
        </Link>
      </View>
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
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  plus: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    maxWidth: 60,
  },
});
