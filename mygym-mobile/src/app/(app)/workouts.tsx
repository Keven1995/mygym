import { useEffect, useEffectEvent, useState } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { CardText, ResourceCard } from '@/components/resource-card';
import { Card, Header, Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/state-view';
import {
  createWorkout,
  deleteWorkout,
  listWorkouts,
  updateWorkout,
  weekdays,
  weekdayLabel,
  type Weekday,
  type Workout,
  type WorkoutInput,
} from '@/services/mygymApi';

const initialForm = {
  exerciseName: '',
  name: '',
  repetitions: '10',
  sets: '3',
  weekday: 'monday' as Weekday,
};

export default function WorkoutsScreen() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const workoutInput = (): WorkoutInput => ({
    name: form.name,
    weekday: form.weekday,
    exercises: [
      {
        name: form.exerciseName,
        repetitions: Number.parseInt(form.repetitions, 10) || 0,
        sets: Number.parseInt(form.sets, 10) || 0,
      },
    ],
  });

  const loadWorkouts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setWorkouts(await listWorkouts());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error(String(caughtError)));
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkoutsOnMount = useEffectEvent(loadWorkouts);

  const submitWorkout = async () => {
    setIsSaving(true);
    setError(null);

    try {
      if (editingId) {
        await updateWorkout(editingId, workoutInput());
      } else {
        await createWorkout(workoutInput());
      }
      setEditingId(null);
      setForm(initialForm);
      await loadWorkouts();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error(String(caughtError)));
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (workout: Workout) => {
    const firstExercise = workout.exercises[0];
    setEditingId(workout.id);
    setForm({
      exerciseName: firstExercise?.name || '',
      name: workout.name,
      repetitions: String(firstExercise?.repetitions || 0),
      sets: String(firstExercise?.sets || 0),
      weekday: workout.weekday,
    });
  };

  const removeWorkout = async (id: string) => {
    setError(null);
    try {
      await deleteWorkout(id);
      await loadWorkouts();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error(String(caughtError)));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadWorkoutsOnMount();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen>
      <Header subtitle="Treinos" title="Semana de treinos" />

      <Card>
        <Text style={styles.formTitle}>{editingId ? 'Editar treino' : 'Novo treino'}</Text>
        {error && <ErrorState message={error.message} />}
        <FormField label="Nome do treino" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
        <View style={styles.weekdays}>
          {weekdays.map((weekday) => (
            <Pressable
              accessibilityRole="button"
              key={weekday.value}
              onPress={() => setForm({ ...form, weekday: weekday.value })}
              style={[styles.weekdayButton, form.weekday === weekday.value && styles.weekdaySelected]}>
              <Text style={[styles.weekdayText, form.weekday === weekday.value && styles.weekdaySelectedText]}>
                {weekday.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <FormField
          label="Exercicio principal"
          value={form.exerciseName}
          onChangeText={(exerciseName) => setForm({ ...form, exerciseName })}
        />
        <View style={styles.row}>
          <FormField
            keyboardType="number-pad"
            label="Series"
            style={styles.smallInput}
            value={form.sets}
            onChangeText={(sets) => setForm({ ...form, sets })}
          />
          <FormField
            keyboardType="number-pad"
            label="Repeticoes"
            style={styles.smallInput}
            value={form.repetitions}
            onChangeText={(repetitions) => setForm({ ...form, repetitions })}
          />
        </View>
        <ActionButton disabled={isSaving} onPress={() => void submitWorkout()}>
          {isSaving ? 'Salvando...' : editingId ? 'Salvar alteracoes' : 'Criar treino'}
        </ActionButton>
        {editingId && (
          <ActionButton
            onPress={() => {
              setEditingId(null);
              setForm(initialForm);
            }}
            variant="secondary">
            Cancelar edicao
          </ActionButton>
        )}
      </Card>

      <Card>
        <Text style={styles.formTitle}>Seus treinos</Text>
        {isLoading && <LoadingState message="Carregando treinos..." />}
        {!isLoading && workouts.length === 0 && <EmptyState message="Nenhum treino cadastrado." />}
        {workouts.map((workout) => {
          const isSelected = selectedWorkoutId === workout.id;

          return (
            <ResourceCard key={workout.id} title={workout.name} meta={weekdayLabel(workout.weekday)}>
              <CardText>{workout.exercises.length} exercicio(s)</CardText>
              {isSelected &&
                workout.exercises.map((exercise, index) => (
                  <CardText key={`${exercise.name}-${index}`}>
                    {exercise.name} - {exercise.sets || 0}x{exercise.repetitions || 0}
                  </CardText>
                ))}
              <View style={styles.actions}>
                <ActionButton
                  onPress={() => setSelectedWorkoutId(isSelected ? null : workout.id)}
                  variant="secondary">
                  {isSelected ? 'Ocultar detalhe' : 'Ver detalhe'}
                </ActionButton>
                <ActionButton onPress={() => startEditing(workout)} variant="secondary">
                  Editar
                </ActionButton>
                <ActionButton onPress={() => void removeWorkout(workout.id)} variant="danger">
                  Excluir
                </ActionButton>
              </View>
            </ResourceCard>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
  },
  weekdays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekdayButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  weekdaySelected: {
    backgroundColor: '#2563EB',
  },
  weekdayText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  weekdaySelectedText: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  smallInput: {
    minWidth: 120,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
