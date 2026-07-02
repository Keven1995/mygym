import type { Auth, OAuthCredential, UserCredential } from 'firebase/auth';
import type { AuthSessionResult } from 'expo-auth-session';

import type { GoogleSignInDependencies } from '@/services/googleAuth';
import {
  buildGoogleAuthRequestConfig,
  handleGoogleAuthSessionResponse,
  signInWithGoogleIdToken,
} from '@/services/googleAuth';

const googleCredential = { providerId: 'google.com' } as unknown as OAuthCredential;

const mockCredential = jest.fn(() => googleCredential);
const mockSignInWithCredential = jest.fn();

const googleAuthDependencies: GoogleSignInDependencies = {
  credential: mockCredential,
  signIn: mockSignInWithCredential,
};

const successResponse = (params: Record<string, string>): AuthSessionResult => ({
  type: 'success',
  params,
  errorCode: null,
  authentication: null,
  url: 'mygymmobile://auth',
});

describe('Google auth service', () => {
  beforeEach(() => {
    mockCredential.mockClear();
    mockSignInWithCredential.mockClear();
    mockSignInWithCredential.mockResolvedValue({
      user: { uid: 'firebase-uid' },
    } as unknown as UserCredential);
  });

  it('builds the Google auth request config from environment values', () => {
    expect(
      buildGoogleAuthRequestConfig({
        webClientId: 'web-client-id',
        androidClientId: 'android-client-id',
        iosClientId: 'ios-client-id',
      })
    ).toEqual({
      webClientId: 'web-client-id',
      androidClientId: 'android-client-id',
      iosClientId: 'ios-client-id',
      scopes: ['profile', 'email'],
      selectAccount: true,
    });
  });

  it('uses a harmless placeholder when the Google web client ID is missing', () => {
    expect(
      buildGoogleAuthRequestConfig({
        androidClientId: 'android-client-id',
      })
    ).toEqual({
      webClientId: 'missing-google-web-client-id',
      androidClientId: 'android-client-id',
      iosClientId: undefined,
      scopes: ['profile', 'email'],
      selectAccount: true,
    });
  });

  it('signs in to Firebase using the Google id token', async () => {
    const auth = { name: 'firebase-auth' } as unknown as Auth;

    await expect(
      signInWithGoogleIdToken('google-id-token', auth, googleAuthDependencies)
    ).resolves.toEqual({
      user: { uid: 'firebase-uid' },
    });

    expect(mockCredential).toHaveBeenCalledWith('google-id-token');
    expect(mockSignInWithCredential).toHaveBeenCalledWith(auth, googleCredential);
  });

  it('signs in when the auth session response returns an id token', async () => {
    const auth = { name: 'firebase-auth' } as unknown as Auth;

    await handleGoogleAuthSessionResponse(
      successResponse({ id_token: 'google-id-token' }),
      auth,
      googleAuthDependencies
    );

    expect(mockCredential).toHaveBeenCalledWith('google-id-token');
    expect(mockSignInWithCredential).toHaveBeenCalledWith(auth, googleCredential);
  });

  it('returns null when the user cancels or dismisses Google auth', async () => {
    const auth = { name: 'firebase-auth' } as unknown as Auth;

    await expect(
      handleGoogleAuthSessionResponse({ type: 'cancel' }, auth, googleAuthDependencies)
    ).resolves.toBeNull();
    await expect(
      handleGoogleAuthSessionResponse({ type: 'dismiss' }, auth, googleAuthDependencies)
    ).resolves.toBeNull();

    expect(mockSignInWithCredential).not.toHaveBeenCalled();
  });

  it('raises a clear error when Google auth succeeds without an id token', async () => {
    const auth = { name: 'firebase-auth' } as unknown as Auth;

    await expect(
      handleGoogleAuthSessionResponse(successResponse({}), auth, googleAuthDependencies)
    ).rejects.toThrow('Google authentication did not return an ID token.');
  });
});
