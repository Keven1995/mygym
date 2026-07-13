import type { PropsWithChildren } from 'react';

import { StyleSheet, Text, View } from 'react-native';

type ResourceCardProps = PropsWithChildren<{
  meta?: string;
  title: string;
}>;

export function ResourceCard({ children, meta, title }: ResourceCardProps) {
  return (
    <View style={styles.card}>
      {meta && <Text style={styles.meta}>{meta}</Text>}
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

export function CardText({ children }: PropsWithChildren) {
  return <Text style={styles.text}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  meta: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  text: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
});
