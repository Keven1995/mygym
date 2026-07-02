import type { Auth, OAuthCredential, UserCredential } from 'firebase/auth';

import type { AuthSessionResult } from 'expo-auth-session';
import type { GoogleAuthRequestConfig } from 'expo-auth-session/providers/google';

type GoogleClientIds = {
  webClientId?: string;
  androidClientId?: string;
  iosClientId?: string;
};

export type GoogleSignInDependencies = {
  credential: (idToken: string) => OAuthCredential;
  signIn: (auth: Auth, credential: OAuthCredential) => Promise<UserCredential>;
};

export const missingGoogleWebClientId = 'missing-google-web-client-id';

export const buildGoogleAuthRequestConfig = (
  googleClientIds: GoogleClientIds
): Partial<GoogleAuthRequestConfig> => ({
  webClientId: googleClientIds.webClientId ?? missingGoogleWebClientId,
  androidClientId: googleClientIds.androidClientId,
  iosClientId: googleClientIds.iosClientId,
  scopes: ['profile', 'email'],
  selectAccount: true,
});

export const signInWithGoogleIdToken = (
  idToken: string,
  auth: Auth,
  dependencies: GoogleSignInDependencies
): Promise<UserCredential> => {
  const credential = dependencies.credential(idToken);

  return dependencies.signIn(auth, credential);
};

export const handleGoogleAuthSessionResponse = async (
  response: AuthSessionResult,
  auth: Auth,
  dependencies: GoogleSignInDependencies
): Promise<UserCredential | null> => {
  if (response.type === 'cancel' || response.type === 'dismiss') {
    return null;
  }

  if (response.type !== 'success') {
    throw new Error('Google authentication failed.');
  }

  const idToken = response.params.id_token;

  if (!idToken) {
    throw new Error('Google authentication did not return an ID token.');
  }

  return signInWithGoogleIdToken(idToken, auth, dependencies);
};
