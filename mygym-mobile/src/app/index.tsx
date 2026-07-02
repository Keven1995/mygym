import { useState } from 'react';

import type { User } from 'firebase/auth';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGoogleSignIn } from '@/hooks/use-google-sign-in';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const { error, isLoading, isReady, signInWithGoogle } = useGoogleSignIn();

  const handleGoogleSignIn = async () => {
    const credential = await signInWithGoogle();

    if (credential?.user) {
      setUser(credential.user);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>MyGym</Text>
        <Text style={styles.title}>Entre para organizar seus treinos</Text>
        <Text style={styles.description}>
          Use sua conta Google para autenticar com Firebase e liberar o acesso seguro a API.
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={!isReady || isLoading}
          onPress={handleGoogleSignIn}
          style={({ pressed }) => [
            styles.button,
            (!isReady || isLoading) && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Entrar com Google</Text>
          )}
        </Pressable>

        {user && (
          <Text style={styles.successText}>
            Autenticado como {user.displayName || user.email || 'usuario MyGym'}.
          </Text>
        )}

        {error && <Text style={styles.errorText}>{error.message}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0F172A',
  },
  card: {
    gap: 18,
    padding: 24,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  eyebrow: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0F172A',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  description: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#2563EB',
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successText: {
    color: '#15803D',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
  },
});
