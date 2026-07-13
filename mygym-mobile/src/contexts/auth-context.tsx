import { createContext, type PropsWithChildren, use, useEffect, useState } from 'react';

import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

import { firebaseAuth } from '@/services/firebaseConfig';
import { syncUser, type BackendUser } from '@/services/mygymApi';

type AuthContextValue = {
  backendUser: BackendUser | null;
  isInitializing: boolean;
  isSyncing: boolean;
  refreshBackendUser: () => Promise<BackendUser | null>;
  syncError: Error | null;
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const refreshBackendUser = async () => {
    if (!firebaseAuth.currentUser) {
      setBackendUser(null);
      return null;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const syncedUser = await syncUser(firebaseAuth.currentUser);
      setBackendUser(syncedUser);
      return syncedUser;
    } catch (error) {
      const nextError = error instanceof Error ? error : new Error(String(error));
      setSyncError(nextError);
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setIsInitializing(false);

      if (!nextUser) {
        setBackendUser(null);
        setSyncError(null);
        return;
      }

      void refreshBackendUser();
    });
  }, []);

  const signOut = () => firebaseSignOut(firebaseAuth);

  return (
    <AuthContext.Provider
      value={{
        backendUser,
        isInitializing,
        isSyncing,
        refreshBackendUser,
        signOut,
        syncError,
        user,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = use(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
