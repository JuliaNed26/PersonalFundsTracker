import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function AddButton() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button}>
        <Text style={styles.plus}>+</Text>
      </Pressable>
      <Text style={styles.label}>Add new</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
    marginRight: 12,
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
