import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../lib/axios';
import { DEMO_MODE, DEMO_TOKEN, auth } from '../lib/firebase';
import type { User, AuthContextType } from '../types';


const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyWithBackend = async (idToken: string): Promise<User> => {
    const response = await api.post('/auth/verify', { id_token: idToken });
    return response.data.user;
  };

  useEffect(() => {
    if (DEMO_MODE) {
      // Check if already demo-logged in (persisted in sessionStorage)
      const savedToken = sessionStorage.getItem('scampurr_token');
      if (savedToken) {
        setToken(savedToken);
        setAuthToken(savedToken);
        verifyWithBackend(savedToken)
          .then(setUser)
          .catch(() => {
            sessionStorage.removeItem('scampurr_token');
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
      return;
    }

    // Real Firebase auth listener
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(auth!, async (firebaseUser: any) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            setToken(idToken);
            setAuthToken(idToken);
            const dbUser = await verifyWithBackend(idToken);
            setUser(dbUser);
          } catch (e) {
            console.error('Auth error:', e);
            setUser(null);
            setToken(null);
            setAuthToken(null);
          }
        } else {
          setUser(null);
          setToken(null);
          setAuthToken(null);
        }
        setLoading(false);
      });
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const login = async () => {
    if (DEMO_MODE) {
      await demoLogin();
      return;
    }
    if (!auth) return;
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // Auth state change handled by onAuthStateChanged above
  };

  const demoLogin = async () => {
    const demoToken = DEMO_TOKEN;
    setToken(demoToken);
    setAuthToken(demoToken);
    sessionStorage.setItem('scampurr_token', demoToken);
    try {
      const dbUser = await verifyWithBackend(demoToken);
      setUser(dbUser);
    } catch (e) {
      // Backend not up yet — create a local demo user object
      setUser({
        id: 'demo-local',
        firebase_uid: demoToken,
        email: 'demo@scampurr.ai',
        display_name: 'Demo Cat Detective',
        photo_url: null,
        created_at: new Date().toISOString(),
      });
    }
  };

  const logout = async () => {
    if (!DEMO_MODE && auth) {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    }
    setUser(null);
    setToken(null);
    setAuthToken(null);
    sessionStorage.removeItem('scampurr_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
