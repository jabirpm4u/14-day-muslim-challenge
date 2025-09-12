// Firebase configuration
// Replace these values with your actual Firebase project configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDaFBZ8j5p3SUFuiOOPinw99z4S-QDcRLQ",
  authDomain: "focus-challenge2.firebaseapp.com",
  projectId: "focus-challenge2",
  storageBucket: "focus-challenge2.firebasestorage.app",
  messagingSenderId: "958055987588",
  appId: "1:958055987588:web:07a27c190756330cf085d1",
  measurementId: "G-EM5K04PT9G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
// Ensure auth state persists across tabs/reloads to avoid first-click failures
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error('Failed to set auth persistence', err);
});
// Use device/browser language for auth UI
try {
  // Some environments might not support useDeviceLanguage; guard just in case
  // @ts-ignore - method exists on Auth instance
  auth.useDeviceLanguage?.();
} catch (_) {}
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;