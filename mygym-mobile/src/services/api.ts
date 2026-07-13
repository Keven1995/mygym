import * as axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { Auth } from 'firebase/auth';

import { env } from './env';
import { firebaseAuth } from './firebaseConfig';

type ApiErrorBody = {
  error?: string;
  message?: string;
  details?: unknown;
};

export class ApiError extends Error {
  code?: string;
  details?: unknown;
  status?: number;

  constructor(message: string, options: { code?: string; details?: unknown; status?: number } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code;
    this.details = options.details;
    this.status = options.status;
  }
}

export const toApiError = (error: unknown): ApiError => {
  if (!axios.isAxiosError(error)) {
    return error instanceof ApiError ? error : new ApiError('Unexpected API error');
  }

  const axiosError = error as AxiosError<ApiErrorBody>;

  if (axiosError.response) {
    const { data, status } = axiosError.response;

    return new ApiError(data?.message || 'API request failed', {
      code: data?.error,
      details: data?.details,
      status,
    });
  }

  return new ApiError(axiosError.message || 'Network request failed', {
    code: 'network_error',
  });
};

export const createApiClient = (
  auth: Auth = firebaseAuth,
  createClient: typeof axios.create = axios.create
): AxiosInstance => {
  const client = createClient({
    baseURL: env.apiUrl,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await auth.currentUser?.getIdToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(toApiError(error))
  );

  return client;
};

export const api = createApiClient();
