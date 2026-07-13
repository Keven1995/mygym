const mockRequestUse = jest.fn();
const mockResponseUse = jest.fn();
const mockAxiosClient = {
  interceptors: {
    request: { use: mockRequestUse },
    response: { use: mockResponseUse },
  },
};

const mockAxiosCreate = jest.fn(() => mockAxiosClient);

jest.mock('@/services/env', () => ({
  env: {
    apiUrl: 'http://api.mygym.test',
  },
}));

jest.mock('@/services/firebaseConfig', () => ({
  firebaseAuth: {
    currentUser: null,
  },
}));

import type { Auth } from 'firebase/auth';

import { ApiError, createApiClient, toApiError } from '@/services/api';

describe('API service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an Axios client using the configured API URL', () => {
    createApiClient({ currentUser: null } as Auth, mockAxiosCreate as never);

    expect(mockAxiosCreate).toHaveBeenCalledWith({
      baseURL: 'http://api.mygym.test',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  });

  it('adds the Firebase ID token to authenticated requests', async () => {
    const getIdToken = jest.fn().mockResolvedValue('firebase-id-token');
    createApiClient({ currentUser: { getIdToken } } as unknown as Auth, mockAxiosCreate as never);

    const requestInterceptor = mockRequestUse.mock.calls[0][0];
    const config = await requestInterceptor({ headers: {} });

    expect(getIdToken).toHaveBeenCalledTimes(1);
    expect(config.headers.Authorization).toBe('Bearer firebase-id-token');
  });

  it('does not add Authorization when there is no current user', async () => {
    createApiClient({ currentUser: null } as Auth, mockAxiosCreate as never);

    const requestInterceptor = mockRequestUse.mock.calls[0][0];
    const config = await requestInterceptor({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('converts API error responses to ApiError', () => {
    const error = toApiError({
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          error: 'validation_error',
          message: 'Validation failed',
          details: { name: ["can't be blank"] },
        },
      },
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.code).toBe('validation_error');
    expect(error.message).toBe('Validation failed');
    expect(error.details).toEqual({ name: ["can't be blank"] });
  });

  it('converts network errors to ApiError', () => {
    const error = toApiError({
      isAxiosError: true,
      request: {},
      message: 'Network Error',
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('network_error');
    expect(error.message).toBe('Network Error');
  });
});
