import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from './config';

export interface UserRole {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'participant';
  joinedAt: any;
  progress: Record<string, boolean>;
  points: Record<string, number>; // New: Points earned for each day
  totalPoints: number; // New: Total points earned
  rank: number; // New: Current leaderboard rank
  updatedAt?: any; // New: Last update timestamp
}

// Ensure the authenticated user has a Firestore user document
export const ensureUserDocument = async (user: User): Promise<UserRole> => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    // Create minimal participant profile so rules pass get() checks
    const initialProgress: Record<string, boolean> = {};
    const initialPoints: Record<string, number> = {};
    for (let i = 0; i <= 14; i++) {
      initialProgress[`day${i}`] = false;
      initialPoints[`day${i}`] = 0;
    }
    const userRole: UserRole = {
      uid: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      role: 'participant',
      joinedAt: serverTimestamp(),
      progress: initialProgress,
      points: initialPoints,
      totalPoints: 0,
      rank: 0,
      updatedAt: serverTimestamp()
    };
    await setDoc(userDocRef, userRole);
    return userRole;
  }
  // If exists but missing role, set default without clobbering
  const data = userDoc.data() as Partial<UserRole>;
  if (!data.role) {
    await setDoc(userDocRef, { role: 'participant', updatedAt: serverTimestamp() }, { merge: true });
  }
  return { ...(userDoc.data() as UserRole) };
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserRole | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Ensure user document exists and has role
    const userRole = await ensureUserDocument(user);
    return userRole;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user's role data
export const getCurrentUserRole = async (): Promise<UserRole | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    // Ensure existence then return
    return await ensureUserDocument(user);
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};