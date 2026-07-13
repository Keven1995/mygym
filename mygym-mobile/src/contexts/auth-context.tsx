import { createContext, type PropsWithChildren, use, useEffect, useState } from 'react';

import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

import { firebaseAuth } from '@/services/firebaseConfig';

type AuthContextValue = {
  isInitializing: boolean;
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setIsInitializing(false);
    });
  }, []);

  const signOut = () => firebaseSignOut(firebaseAuth);

  return (
    <AuthContext.Provider value={{ isInitializing, user, signOut }}>
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
