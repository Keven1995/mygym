import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  const userName = user?.displayName || user?.email || 'usuario MyGym';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {user?.photoURL && <Image source={{ uri: user.photoURL }} style={styles.avatar} />}
        <Text style={styles.eyebrow}>Sessao ativa</Text>
        <Text style={styles.title}>Bem-vindo, {userName}</Text>
        <Text style={styles.description}>
          Sua sessao Firebase foi restaurada automaticamente. As proximas tarefas vao conectar
          esta Home aos dados da API.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={signOut}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Sair</Text>
        </Pressable>
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  eyebrow: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
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
    backgroundColor: '#DC2626',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
