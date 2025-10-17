import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as api from '../services/firebase';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: (line 19) The onAuthStateChanged function from Firebase v9 requires the auth instance as its first argument.
    const unsubscribe = api.onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await api.getUserById(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // This case might happen if user is in Auth but not in Firestore DB.
            // To prevent an inconsistent state, we sign them out.
            console.warn(`User with UID ${firebaseUser.uid} found in Auth, but not in Firestore. Signing out.`);
            // FIX: (line 29) The signOut function from Firebase v9 requires the auth instance as its argument.
            await api.signOut(auth);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error during auth state change:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, pass: string): Promise<User> => {
    const { user: firebaseUser } = await api.signIn(username, pass);
    const userData = await api.getUserById(firebaseUser.uid);

    if (!userData) {
      throw new Error("Datos del usuario no encontrados en la base de datos.");
    }
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    // FIX: (line 58) The signOut function from Firebase v9 requires the auth instance as its argument.
    await api.signOut(auth);
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
