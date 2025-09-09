// Firebase configuration
// Replace these values with your actual Firebase project configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
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
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;