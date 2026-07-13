import type { PropsWithChildren } from 'react';

import { Pressable, StyleSheet, Text } from 'react-native';

type ActionButtonProps = PropsWithChildren<{
  disabled?: boolean;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
}>;

export function ActionButton({ children, disabled, onPress, variant = 'primary' }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  primary: {
    backgroundColor: '#2563EB',
  },
  danger: {
    backgroundColor: '#DC2626',
  },
  secondary: {
    backgroundColor: '#E2E8F0',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryText: {
    color: '#0F172A',
  },
});
