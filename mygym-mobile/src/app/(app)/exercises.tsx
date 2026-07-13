import { useEffect, useEffectEvent, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { CardText, ResourceCard } from '@/components/resource-card';
import { Card, Header, Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/state-view';
import {
  createExercise,
  deleteExercise,
  listExercises,
  updateExercise,
  type Exercise,
  type ExerciseInput,
} from '@/services/mygymApi';

const initialForm = { description: '', muscle_group: '', name: '', repetitions: '10', sets: '3' };

export default function ExercisesScreen() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const exerciseInput = (): ExerciseInput => ({
    description: form.description,
    muscle_group: form.muscle_group,
    name: form.name,
    repetitions: Number.parseInt(form.repetitions, 10) || 0,
    sets: Number.parseInt(form.sets, 10) || 0,
  });

  const loadExercises = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setExercises(await listExercises());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error(String(caughtError)));
    } finally {
      setIsLoading(false);
    }
  };

  const loadExercisesOnMount = useEffectEvent(loadExercises);

  const submitExercise = async () => {
    setIsSaving(true);
    setError(null);

    try {
      if (editingId) {
        await updateExercise(editingId, exerciseInput());
      } else {
        await createExercise(exerciseInput());
      }
      setForm(initialForm);
      setEditingId(null);
      await loadExercises();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error(String(caughtError)));
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setForm({
      description: exercise.description || '',
      muscle_group: exercise.muscle_group || '',
      name: exercise.name,
      repetitions: String(exercise.repetitions),
      sets: String(exercise.sets),
    });
  };

  const removeExercise = async (id: string) => {
    setError(null);
    try {
      await deleteExercise(id);
      await loadExercises();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error(String(caughtError)));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadExercisesOnMount();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen>
      <Header subtitle="Exercicios" title="Cadastro e listagem" />

      <Card>
        <Text style={styles.formTitle}>{editingId ? 'Editar exercicio' : 'Novo exercicio'}</Text>
        {error && <ErrorState message={error.message} />}
        <FormField label="Nome" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
        <FormField
          label="Descricao"
          value={form.description}
          onChangeText={(description) => setForm({ ...form, description })}
        />
        <FormField
          label="Grupo muscular"
          value={form.muscle_group}
          onChangeText={(muscle_group) => setForm({ ...form, muscle_group })}
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
        <ActionButton disabled={isSaving} onPress={() => void submitExercise()}>
          {isSaving ? 'Salvando...' : editingId ? 'Salvar alteracoes' : 'Criar exercicio'}
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
        <Text style={styles.formTitle}>Seus exercicios</Text>
        {isLoading && <LoadingState message="Carregando exercicios..." />}
        {!isLoading && exercises.length === 0 && <EmptyState message="Nenhum exercicio cadastrado." />}
        {exercises.map((exercise) => (
          <ResourceCard key={exercise.id} title={exercise.name} meta={exercise.muscle_group || 'Sem grupo'}>
            <CardText>{exercise.description || 'Sem descricao'}</CardText>
            <CardText>
              {exercise.sets} series x {exercise.repetitions} repeticoes
            </CardText>
            <View style={styles.actions}>
              <ActionButton onPress={() => startEditing(exercise)} variant="secondary">
                Editar
              </ActionButton>
              <ActionButton onPress={() => void removeExercise(exercise.id)} variant="danger">
                Excluir
              </ActionButton>
            </View>
          </ResourceCard>
        ))}
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  smallInput: {
    minWidth: 120,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
});
