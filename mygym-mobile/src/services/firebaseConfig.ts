import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';

import { env } from './env';

export const firebaseApp = getApps().length ? getApp() : initializeApp(env.firebase);

const initializeFirebaseAuth = () => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error) {
      const { code } = error as { code?: string };

      if (code === 'auth/already-initialized') {
        return getAuth(firebaseApp);
      }
    }

    throw error;
  }
};

export const firebaseAuth = initializeFirebaseAuth();
