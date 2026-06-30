const requiredEnv = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const optionalEnv = (value: string | undefined) => value || undefined;

export const env = {
  apiUrl: requiredEnv(process.env.EXPO_PUBLIC_API_URL, 'EXPO_PUBLIC_API_URL'),
  firebase: {
    apiKey: requiredEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY, 'EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: requiredEnv(
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'
    ),
    projectId: requiredEnv(
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID'
    ),
    storageBucket: requiredEnv(
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'
    ),
    messagingSenderId: requiredEnv(
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
    ),
    appId: requiredEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID, 'EXPO_PUBLIC_FIREBASE_APP_ID'),
    measurementId: optionalEnv(process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID),
  },
};
