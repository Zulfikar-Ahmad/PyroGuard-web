import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (fbUser) => {
      // Accounts whose email is not verified yet are treated as signed out.
      if (fbUser && fbUser.emailVerified) {
        setUser({
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email || 'User',
          email: fbUser.email || '',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
