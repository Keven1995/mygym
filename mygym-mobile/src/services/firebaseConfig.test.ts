import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@/services/env', () => ({
  env: {
    firebase: {
      apiKey: 'api-key',
      authDomain: 'mygym.firebaseapp.com',
      projectId: 'mygym',
      storageBucket: 'mygym.appspot.com',
      messagingSenderId: '123',
      appId: 'app-id',
    },
  },
}));

jest.mock('firebase/app', () => ({
  getApp: jest.fn(),
  getApps: jest.fn(),
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  initializeAuth: jest.fn(),
}));

const getAppsMock = jest.mocked(getApps);
const getAppMock = jest.mocked(getApp);
const initializeAppMock = jest.mocked(initializeApp);
const getAuthMock = jest.mocked(getAuth);
const getReactNativePersistenceMock = jest.mocked(getReactNativePersistence);
const initializeAuthMock = jest.mocked(initializeAuth);

describe('firebaseConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes Firebase Auth with AsyncStorage persistence for Expo Go', () => {
    const app = { name: 'mygym-app' };
    const persistence = { type: 'LOCAL' };
    const auth = { app };

    getAppsMock.mockReturnValue([]);
    initializeAppMock.mockReturnValue(app as never);
    getReactNativePersistenceMock.mockReturnValue(persistence as never);
    initializeAuthMock.mockReturnValue(auth as never);

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const config = require('@/services/firebaseConfig');

      expect(config.firebaseApp).toBe(app);
      expect(config.firebaseAuth).toBe(auth);
    });

    expect(initializeAppMock).toHaveBeenCalledWith({
      apiKey: 'api-key',
      authDomain: 'mygym.firebaseapp.com',
      projectId: 'mygym',
      storageBucket: 'mygym.appspot.com',
      messagingSenderId: '123',
      appId: 'app-id',
    });
    expect(getReactNativePersistenceMock).toHaveBeenCalledWith(AsyncStorage);
    expect(initializeAuthMock).toHaveBeenCalledWith(app, { persistence });
  });

  it('reuses an existing Firebase app before initializing Auth', () => {
    const existingApp = { name: 'existing-app' };
    const persistence = { type: 'LOCAL' };
    const auth = { app: existingApp };

    getAppsMock.mockReturnValue([existingApp] as never);
    getAppMock.mockReturnValue(existingApp as never);
    getReactNativePersistenceMock.mockReturnValue(persistence as never);
    initializeAuthMock.mockReturnValue(auth as never);

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const config = require('@/services/firebaseConfig');

      expect(config.firebaseApp).toBe(existingApp);
      expect(config.firebaseAuth).toBe(auth);
    });

    expect(getAppMock).toHaveBeenCalledTimes(1);
    expect(initializeAppMock).not.toHaveBeenCalled();
    expect(initializeAuthMock).toHaveBeenCalledWith(existingApp, { persistence });
  });

  it('reuses existing Auth when Firebase Auth was already initialized', () => {
    const existingApp = { name: 'existing-app' };
    const persistence = { type: 'LOCAL' };
    const auth = { app: existingApp };

    getAppsMock.mockReturnValue([existingApp] as never);
    getAppMock.mockReturnValue(existingApp as never);
    getReactNativePersistenceMock.mockReturnValue(persistence as never);
    initializeAuthMock.mockImplementation(() => {
      throw { code: 'auth/already-initialized' };
    });
    getAuthMock.mockReturnValue(auth as never);

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const config = require('@/services/firebaseConfig');

      expect(config.firebaseApp).toBe(existingApp);
      expect(config.firebaseAuth).toBe(auth);
    });

    expect(getAuthMock).toHaveBeenCalledWith(existingApp);
  });
});
