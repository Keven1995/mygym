import { useEffect, useEffectEvent, useState } from 'react';

import { Image, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { CardText, ResourceCard } from '@/components/resource-card';
import { Card, Header, Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/state-view';
import { useAuth } from '@/contexts/auth-context';
import { getTodayWorkout, type Workout, weekdayLabel } from '@/services/mygymApi';

export default function HomeScreen() {
  const { backendUser, isSyncing, refreshBackendUser, signOut, syncError, user } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const userName = backendUser?.name || user?.displayName || user?.email || 'usuario MyGym';

  const loadTodayWorkout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getTodayWorkout();
      setWorkout(response.workout);
      setMessage(response.message || null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error(String(caughtError)));
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodayWorkoutOnMount = useEffectEvent(loadTodayWorkout);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTodayWorkoutOnMount();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen>
      <Header subtitle="Sessao ativa" title={`Bem-vindo, ${userName}`} />

      <Card>
        <View style={styles.userRow}>
          {user?.photoURL && <Image source={{ uri: user.photoURL }} style={styles.avatar} />}
          <View style={styles.userText}>
            <Text style={styles.cardTitle}>{backendUser?.email || user?.email}</Text>
            <Text style={styles.description}>
              {isSyncing ? 'Sincronizando usuario...' : 'Usuario autenticado com Firebase.'}
            </Text>
          </View>
        </View>
        {syncError && <ErrorState message={syncError.message} />}
        <ActionButton onPress={() => void refreshBackendUser()} variant="secondary">
          Sincronizar usuario
        </ActionButton>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Treino do dia</Text>
        {isLoading && <LoadingState message="Buscando treino de hoje..." />}
        {error && <ErrorState message={error.message} />}
        {!isLoading && !error && !workout && (
          <EmptyState message={message || 'Nenhum treino cadastrado para hoje.'} />
        )}
        {workout && (
          <ResourceCard title={workout.name} meta={weekdayLabel(workout.weekday)}>
            {workout.exercises.map((exercise, index) => (
              <CardText key={`${exercise.name}-${index}`}>
                {exercise.name} - {exercise.sets || 0}x{exercise.repetitions || 0}
              </CardText>
            ))}
          </ResourceCard>
        )}
        <ActionButton onPress={() => void loadTodayWorkout()} variant="secondary">
          Atualizar treino do dia
        </ActionButton>
      </Card>

      <ActionButton onPress={signOut} variant="danger">
        Sair
      </ActionButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  userText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
});
