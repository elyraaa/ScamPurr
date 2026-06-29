import { useEffect, useState, type ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { api, setAuthToken } from '../lib/axios';
import { DEMO_MODE, DEMO_TOKEN, auth } from '../lib/firebase';
import type { User } from '../types';
import { AuthContext } from './authContextValue';

function getStoredDemoToken() {
  if (typeof window === 'undefined' || !DEMO_MODE) return null;
  return sessionStorage.getItem('scampurr_token');
}

async function verifyWithBackend(idToken: string): Promise<User> {
  const response = await api.post<{ user: User }>('/auth/verify', { id_token: idToken });
  return response.data.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredDemoToken());
  const [loading, setLoading] = useState(() => (DEMO_MODE ? Boolean(getStoredDemoToken()) : Boolean(auth)));

  useEffect(() => {
    if (!DEMO_MODE || !token) return;
    setAuthToken(token);
    verifyWithBackend(token)
      .then(setUser)
      .catch(() => {
        sessionStorage.removeItem('scampurr_token');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (DEMO_MODE) return;
    const firebaseAuth = auth;
    if (!firebaseAuth) return;

    let unsubscribe: (() => void) | undefined;
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
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
    } catch {
      // Backend not up yet; create a local demo user object.
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
