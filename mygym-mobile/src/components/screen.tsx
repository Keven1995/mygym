import type { PropsWithChildren } from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function Header({ subtitle, title }: { subtitle?: string; title: string }) {
  return (
    <View style={styles.header}>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    gap: 6,
  },
  subtitle: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  card: {
    gap: 14,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
});
