import type { User } from 'firebase/auth';

import {
  createExercise,
  createWorkout,
  getTodayWorkout,
  syncUser,
  updateMe,
} from '@/services/mygymApi';

const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@/services/api', () => ({
  api: mockClient,
}));

describe('MyGym API service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('syncs the Firebase user with the backend', async () => {
    mockClient.post.mockResolvedValue({ data: { user: { id: 'user-id' } } });

    await expect(
      syncUser(
        {
          displayName: 'Keven',
          email: 'keven@example.com',
          photoURL: 'https://example.com/photo.jpg',
        } as User,
        mockClient as never
      )
    ).resolves.toEqual({ id: 'user-id' });

    expect(mockClient.post).toHaveBeenCalledWith('/api/users/sync', {
      user: {
        name: 'Keven',
        email: 'keven@example.com',
        photo_url: 'https://example.com/photo.jpg',
      },
    });
  });

  it('updates the current profile', async () => {
    mockClient.put.mockResolvedValue({ data: { user: { id: 'user-id', name: 'Novo' } } });

    await updateMe({ name: 'Novo' }, mockClient as never);

    expect(mockClient.put).toHaveBeenCalledWith('/api/me', { user: { name: 'Novo' } });
  });

  it('creates exercises using the API contract', async () => {
    mockClient.post.mockResolvedValue({ data: { exercise: { id: 'exercise-id' } } });

    await createExercise(
      { name: 'Supino', description: '', muscle_group: 'Peito', sets: 3, repetitions: 10 },
      mockClient as never
    );

    expect(mockClient.post).toHaveBeenCalledWith('/api/exercises', {
      exercise: { name: 'Supino', description: '', muscle_group: 'Peito', sets: 3, repetitions: 10 },
    });
  });

  it('creates workouts using embedded exercises', async () => {
    mockClient.post.mockResolvedValue({ data: { workout: { id: 'workout-id' } } });

    await createWorkout(
      {
        name: 'Treino A',
        weekday: 'monday',
        exercises: [{ name: 'Supino', sets: 3, repetitions: 10 }],
      },
      mockClient as never
    );

    expect(mockClient.post).toHaveBeenCalledWith('/api/workouts', {
      workout: {
        name: 'Treino A',
        weekday: 'monday',
        exercises: [{ name: 'Supino', sets: 3, repetitions: 10 }],
      },
    });
  });

  it('fetches the workout of the day', async () => {
    mockClient.get.mockResolvedValue({ data: { workout: null, message: 'Nenhum treino cadastrado para hoje' } });

    await expect(getTodayWorkout(mockClient as never)).resolves.toEqual({
      workout: null,
      message: 'Nenhum treino cadastrado para hoje',
    });

    expect(mockClient.get).toHaveBeenCalledWith('/api/workouts/today');
  });
});
