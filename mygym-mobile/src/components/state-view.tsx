import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingState({ message = 'Carregando...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#2563EB" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <Text style={styles.text}>{message}</Text>;
}

export function ErrorState({ message }: { message: string }) {
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  text: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
  },
  error: {
    color: '#B91C1C',
    fontSize: 15,
    lineHeight: 22,
  },
});
