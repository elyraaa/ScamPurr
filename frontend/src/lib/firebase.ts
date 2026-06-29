import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const app: FirebaseApp | null = DEMO_MODE
  ? null
  : getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];
const auth: Auth | null = app ? getAuth(app) : null;

export { auth, DEMO_MODE };
export const DEMO_TOKEN = import.meta.env.VITE_DEMO_TOKEN || 'demo-user-1';
