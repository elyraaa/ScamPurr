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
console.log('VITE_DEMO_MODE =', import.meta.env.VITE_DEMO_MODE);
console.log('DEMO_MODE =', DEMO_MODE);
console.log('Firebase Config =', firebaseConfig);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (!DEMO_MODE) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
}

export { auth, DEMO_MODE };
export const DEMO_TOKEN = import.meta.env.VITE_DEMO_TOKEN || 'demo-user-1';
