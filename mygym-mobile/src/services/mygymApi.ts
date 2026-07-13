import type { AxiosInstance } from 'axios';
import type { User } from 'firebase/auth';

import { api } from './api';

export type BackendUser = {
  id: string;
  name: string;
  email: string;
  photo_url?: string | null;
  firebase_uid: string;
};

export type Exercise = {
  id: string;
  name: string;
  description?: string | null;
  muscle_group?: string | null;
  sets: number;
  repetitions: number;
};

export type ExerciseInput = {
  name: string;
  description?: string;
  muscle_group?: string;
  sets: number;
  repetitions: number;
};

export type WorkoutExercise = {
  name: string;
  description?: string | null;
  muscle_group?: string | null;
  sets?: number;
  repetitions?: number;
};

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type Workout = {
  id: string;
  name: string;
  weekday: Weekday;
  exercises: WorkoutExercise[];
};

export type WorkoutInput = {
  name: string;
  weekday: Weekday;
  exercises: WorkoutExercise[];
};

type UserResponse = { user: BackendUser };
type ExercisesResponse = { exercises: Exercise[] };
type ExerciseResponse = { exercise: Exercise };
type WorkoutsResponse = { workouts: Workout[] };
type WorkoutResponse = { workout: Workout };
type TodayWorkoutResponse = { workout: Workout | null; message?: string };

const userPayload = (user: User) => ({
  user: {
    name: user.displayName || user.email || '',
    email: user.email || '',
    photo_url: user.photoURL || undefined,
  },
});

export const syncUser = async (user: User, client: AxiosInstance = api) => {
  const response = await client.post<UserResponse>('/api/users/sync', userPayload(user));

  return response.data.user;
};

export const getMe = async (client: AxiosInstance = api) => {
  const response = await client.get<UserResponse>('/api/me');

  return response.data.user;
};

export const updateMe = async (user: Partial<Pick<BackendUser, 'name' | 'email' | 'photo_url'>>, client: AxiosInstance = api) => {
  const response = await client.put<UserResponse>('/api/me', { user });

  return response.data.user;
};

export const listExercises = async (client: AxiosInstance = api) => {
  const response = await client.get<ExercisesResponse>('/api/exercises');

  return response.data.exercises;
};

export const createExercise = async (exercise: ExerciseInput, client: AxiosInstance = api) => {
  const response = await client.post<ExerciseResponse>('/api/exercises', { exercise });

  return response.data.exercise;
};

export const updateExercise = async (id: string, exercise: ExerciseInput, client: AxiosInstance = api) => {
  const response = await client.put<ExerciseResponse>(`/api/exercises/${id}`, { exercise });

  return response.data.exercise;
};

export const deleteExercise = (id: string, client: AxiosInstance = api) =>
  client.delete(`/api/exercises/${id}`);

export const listWorkouts = async (client: AxiosInstance = api) => {
  const response = await client.get<WorkoutsResponse>('/api/workouts');

  return response.data.workouts;
};

export const getWorkout = async (id: string, client: AxiosInstance = api) => {
  const response = await client.get<WorkoutResponse>(`/api/workouts/${id}`);

  return response.data.workout;
};

export const createWorkout = async (workout: WorkoutInput, client: AxiosInstance = api) => {
  const response = await client.post<WorkoutResponse>('/api/workouts', { workout });

  return response.data.workout;
};

export const updateWorkout = async (id: string, workout: WorkoutInput, client: AxiosInstance = api) => {
  const response = await client.put<WorkoutResponse>(`/api/workouts/${id}`, { workout });

  return response.data.workout;
};

export const deleteWorkout = (id: string, client: AxiosInstance = api) =>
  client.delete(`/api/workouts/${id}`);

export const getTodayWorkout = async (client: AxiosInstance = api) => {
  const response = await client.get<TodayWorkoutResponse>('/api/workouts/today');

  return response.data;
};

export const weekdays: { value: Weekday; label: string }[] = [
  { value: 'monday', label: 'Segunda' },
  { value: 'tuesday', label: 'Terca' },
  { value: 'wednesday', label: 'Quarta' },
  { value: 'thursday', label: 'Quinta' },
  { value: 'friday', label: 'Sexta' },
  { value: 'saturday', label: 'Sabado' },
  { value: 'sunday', label: 'Domingo' },
];

export const weekdayLabel = (weekday: Weekday) =>
  weekdays.find((item) => item.value === weekday)?.label || weekday;
