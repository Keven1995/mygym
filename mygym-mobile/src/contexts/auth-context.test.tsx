import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Component, type ReactNode } from 'react';
import { Text, Pressable } from 'react-native';

import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { firebaseAuth } from '@/services/firebaseConfig';
import { syncUser } from '@/services/mygymApi';
import { AuthProvider, useAuth } from './auth-context';

jest.mock('@/services/firebaseConfig', () => ({
  firebaseAuth: { name: 'firebase-auth', currentUser: null },
}));

jest.mock('@/services/mygymApi', () => ({
  syncUser: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

const onAuthStateChangedMock = jest.mocked(onAuthStateChanged);
const signOutMock = jest.mocked(signOut);
const syncUserMock = jest.mocked(syncUser);

class ErrorBoundary extends Component<
  { children: ReactNode },
  { errorMessage: string | null }
> {
  state = { errorMessage: null };

  static getDerivedStateFromError(error: Error) {
    return { errorMessage: error.message };
  }

  render() {
    if (this.state.errorMessage) {
      return <Text testID="error-boundary">{this.state.errorMessage}</Text>;
    }

    return this.props.children;
  }
}

const renderProbe = async () => {
  const unsubscribe = jest.fn();
  let authStateListener: ((user: User | null) => void) | null = null;

  onAuthStateChangedMock.mockImplementation((_auth, listener) => {
    authStateListener = listener as (user: User | null) => void;

    return unsubscribe;
  });

  function Probe() {
    const { backendUser, isInitializing, isSyncing, syncError, user, signOut: signOutCurrentUser } = useAuth();

    return (
      <>
        <Text testID="loading-state">{isInitializing ? 'loading' : 'ready'}</Text>
        <Text testID="sync-state">{isSyncing ? 'syncing' : 'synced'}</Text>
        <Text testID="user-state">{user?.email ?? 'anonymous'}</Text>
        <Text testID="backend-user-state">{backendUser?.email ?? 'no-backend-user'}</Text>
        <Text testID="sync-error-state">{syncError?.message ?? 'no-sync-error'}</Text>
        <Pressable accessibilityRole="button" onPress={signOutCurrentUser}>
          <Text>Sair</Text>
        </Pressable>
      </>
    );
  }

  const result = await render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(authStateListener).toBeTruthy();
  });

  return {
    renderResult: result,
    authStateListener: authStateListener as unknown as (user: User | null) => void,
    unsubscribe,
  };
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    signOutMock.mockResolvedValue(undefined);
    syncUserMock.mockResolvedValue({
      id: 'backend-user-id',
      name: 'Keven',
      email: 'keven@example.com',
      firebase_uid: 'firebase-uid',
    });
    (firebaseAuth as unknown as { currentUser: User | null }).currentUser = null;
  });

  it('starts in a loading state until Firebase returns the first auth state', async () => {
    await renderProbe();

    expect(onAuthStateChangedMock).toHaveBeenCalledWith(firebaseAuth, expect.any(Function));
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');
    expect(screen.getByTestId('user-state')).toHaveTextContent('anonymous');
  });

  it('stores the restored user and finishes initialization', async () => {
    const user = { email: 'keven@mygym.test' } as User;
    (firebaseAuth as unknown as { currentUser: User | null }).currentUser = user;
    const { authStateListener } = await renderProbe();

    await act(async () => {
      authStateListener(user);
    });

    expect(screen.getByTestId('loading-state')).toHaveTextContent('ready');
    expect(screen.getByTestId('user-state')).toHaveTextContent('keven@mygym.test');
    await waitFor(() => {
      expect(screen.getByTestId('backend-user-state')).toHaveTextContent('keven@example.com');
    });
  });

  it('finishes initialization without a user when the session is absent', async () => {
    const { authStateListener } = await renderProbe();

    await act(async () => {
      authStateListener(null);
    });

    expect(screen.getByTestId('loading-state')).toHaveTextContent('ready');
    expect(screen.getByTestId('user-state')).toHaveTextContent('anonymous');
    expect(syncUserMock).not.toHaveBeenCalled();
  });

  it('stores sync errors when backend user sync fails', async () => {
    const user = { email: 'keven@mygym.test' } as User;
    (firebaseAuth as unknown as { currentUser: User | null }).currentUser = user;
    syncUserMock.mockRejectedValue(new Error('API offline'));
    const { authStateListener } = await renderProbe();

    await act(async () => {
      authStateListener(user);
    });

    await waitFor(() => {
      expect(screen.getByTestId('sync-error-state')).toHaveTextContent('API offline');
    });
  });

  it('delegates sign out to Firebase Auth', async () => {
    const { authStateListener } = await renderProbe();

    await act(async () => {
      authStateListener({ email: 'keven@mygym.test' } as User);
    });

    fireEvent.press(screen.getByText('Sair'));

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledWith(firebaseAuth);
    });
  });

  it('unsubscribes from Firebase Auth state changes on unmount', async () => {
    const { renderResult, unsubscribe } = await renderProbe();

    await renderResult.unmount();

    await waitFor(() => {
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  it('throws when useAuth is rendered outside AuthProvider', async () => {
    function ProbeOutsideProvider() {
      useAuth();

      return null;
    }

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await render(
      <ErrorBoundary>
        <ProbeOutsideProvider />
      </ErrorBoundary>,
    );

    expect(result.getByTestId('error-boundary')).toHaveTextContent(
      'useAuth must be used inside AuthProvider.',
    );
    consoleError.mockRestore();
  });
});
