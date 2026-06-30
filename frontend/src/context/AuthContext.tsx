import { useEffect, useState, type ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { api, setAuthToken } from '../lib/axios';
import { LOCAL_AUTH, auth } from '../lib/firebase';
import type { User } from '../types';
import { AuthContext } from './authContextValue';

const LOCAL_TOKEN_KEY = 'scampurr_local_token';

function getStoredLocalToken() {
  if (typeof window === 'undefined' || !LOCAL_AUTH) return null;
  return sessionStorage.getItem(LOCAL_TOKEN_KEY);
}

function localTokenForEmail(email: string) {
  return `local:${email.trim().toLowerCase()}`;
}

async function verifyWithBackend(idToken: string): Promise<User> {
  const response = await api.post<{ user: User }>('/auth/verify', { id_token: idToken });
  return response.data.user;
}

async function completeFirebaseAuth(firebaseUser: FirebaseUser): Promise<{ user: User; token: string }> {
  const idToken = await firebaseUser.getIdToken();
  setAuthToken(idToken);
  const user = await verifyWithBackend(idToken);
  return { user, token: idToken };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredLocalToken());
  const [loading, setLoading] = useState(() => (LOCAL_AUTH ? Boolean(getStoredLocalToken()) : Boolean(auth)));

  useEffect(() => {
    if (!LOCAL_AUTH || !token) return;
    setAuthToken(token);
    verifyWithBackend(token)
      .then(setUser)
      .catch(() => {
        sessionStorage.removeItem(LOCAL_TOKEN_KEY);
        setToken(null);
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (LOCAL_AUTH) return;
    const firebaseAuth = auth;
    if (!firebaseAuth) return;

    let unsubscribe: (() => void) | undefined;
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            const result = await completeFirebaseAuth(firebaseUser);
            setToken(result.token);
            setUser(result.user);
          } catch {
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
    if (!auth) return;
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (LOCAL_AUTH) {
      const localToken = localTokenForEmail(email);
      setToken(localToken);
      setAuthToken(localToken);
      sessionStorage.setItem(LOCAL_TOKEN_KEY, localToken);
      const dbUser = await verifyWithBackend(localToken);
      setUser(dbUser);
      return;
    }

    if (!auth) return;
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const result = await completeFirebaseAuth(credential.user);
    setToken(result.token);
    setUser(result.user);
  };

  const registerWithEmail = async (email: string, password: string) => {
    if (LOCAL_AUTH) {
      await loginWithEmail(email, password);
      return;
    }

    if (!auth) return;
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const result = await completeFirebaseAuth(credential.user);
    setToken(result.token);
    setUser(result.user);
  };

  const resetPassword = async (email: string) => {
    if (LOCAL_AUTH) return;
    if (!auth) return;
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    if (!LOCAL_AUTH && auth) {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    }
    setUser(null);
    setToken(null);
    setAuthToken(null);
    sessionStorage.removeItem(LOCAL_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, loginWithEmail, registerWithEmail, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
