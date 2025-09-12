import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  signInWithGoogle, 
  signOutUser, 
  onAuthStateChange, 
  getCurrentUserRole,
  getParticipantRoleData,
  UserRole 
} from '../firebase/auth';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  isRefreshing: boolean;
  isNinjaMode: boolean;
  originalAdminRole: UserRole | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  ninjaLogin: (participantId: string) => Promise<void>;
  exitNinjaMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  isRefreshing: false,
  isNinjaMode: false,
  originalAdminRole: null,
  signIn: async () => {},
  signOut: async () => {},
  ninjaLogin: async () => {},
  exitNinjaMode: () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Ninja mode states
  const [isNinjaMode, setIsNinjaMode] = useState(false);
  const [originalAdminRole, setOriginalAdminRole] = useState<UserRole | null>(null);

  // Emergency fallback: Auto-refresh if stuck loading on first visit
  useEffect(() => {
    // Check if this is the first time loading (no refresh flag in sessionStorage)
    const hasRefreshedBefore = sessionStorage.getItem('auth-refreshed');
    
    if (!hasRefreshedBefore && loading && !hasRefreshed) {
      const timeoutId = setTimeout(() => {
        console.warn('Authentication stuck loading - performing emergency refresh');
        sessionStorage.setItem('auth-refreshed', 'true');
        setHasRefreshed(true);
        setIsRefreshing(true);
        
        // Show refreshing message for a moment before reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 8000); // 8 seconds timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, hasRefreshed]);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      console.log('🔄 Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      setUser(user);
      
      if (user) {
        console.log('👤 User authenticated, fetching role data...');
        try {
          const roleData = await getCurrentUserRole();
          console.log('📋 Role data fetched:', roleData);
          if (roleData) {
            setUserRole(roleData);
          } else {
            console.log('⚠️ No role data found, creating fallback participant role');
            // Fallback: assume participant if role doc missing
            setUserRole({
              uid: user.uid,
              name: user.displayName || 'User',
              email: user.email || '',
              role: 'participant',
              joinedAt: null,
              progress: {},
              points: {},
              totalPoints: 0,
              rank: 0,
              updatedAt: null
            } as unknown as UserRole);
          }
        } catch (error) {
          console.error('❌ Error getting user role:', error);
          // Fallback on error as participant to prevent lock on loading screen
          console.log('🔄 Creating fallback participant role due to error');
          setUserRole({
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            role: 'participant',
            joinedAt: null,
            progress: {},
            points: {},
            totalPoints: 0,
            rank: 0,
            updatedAt: null
          } as unknown as UserRole);
        }
      } else {
        console.log('🚪 No user, clearing role data');
        setUserRole(null);
      }
      
      console.log('✅ Setting loading to false');
      setLoading(false);
      
      // Clear refresh flag on successful auth resolution
      sessionStorage.removeItem('auth-refreshed');
    });

    return unsubscribe;
  }, []); // Subscribe once on mount to avoid double subscriptions

  const signIn = async () => {
    try {
      console.log('🔐 SignIn called, setting loading to true');
      setLoading(true);
      
      console.log('🔐 Calling signInWithGoogle...');
      const userRoleData = await signInWithGoogle();
      console.log('🔐 signInWithGoogle returned:', userRoleData);
      
      // Set user role immediately if we got it from signInWithGoogle
      if (userRoleData) {
        console.log('🔐 Setting user role immediately:', userRoleData);
        setUserRole(userRoleData);
      }
      
      // Don't set loading to false here - let onAuthStateChange handle it
      console.log('🔐 SignIn completed, waiting for auth state change...');
    } catch (error) {
      console.error('❌ Sign in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setUserRole(null);
      // Reset ninja mode on sign out
      setIsNinjaMode(false);
      setOriginalAdminRole(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Ninja login: Admin impersonates a participant
  const ninjaLogin = async (participantId: string) => {
    try {
      if (!userRole || userRole.role !== 'admin') {
        throw new Error('Only admins can use ninja login');
      }

      console.log(`🥷 Admin ${userRole.name} entering ninja mode as participant: ${participantId}`);
      console.log('🔍 Current userRole before ninja:', userRole);
      
      // Get participant data
      const participantData = await getParticipantRoleData(participantId);
      
      if (!participantData) {
        throw new Error('Participant not found');
      }

      console.log('🔍 Participant data retrieved:', participantData);

      // Store original admin role
      setOriginalAdminRole(userRole);
      console.log('🔍 Original admin role stored:', userRole);
      
      // Switch to participant role
      setUserRole(participantData);
      setIsNinjaMode(true);
      
      console.log(`✅ Ninja mode activated - now viewing as: ${participantData.name}`);
      console.log('🔍 New userRole after ninja:', participantData);
      console.log('🔍 isNinjaMode set to:', true);
    } catch (error) {
      console.error('❌ Ninja login failed:', error);
      throw error;
    }
  };

  // Exit ninja mode and return to admin
  const exitNinjaMode = () => {
    if (!isNinjaMode || !originalAdminRole) {
      console.warn('Not in ninja mode or no original admin role stored');
      return;
    }

    console.log(`🚪 Exiting ninja mode, returning to admin: ${originalAdminRole.name}`);
    
    // Restore original admin role
    setUserRole(originalAdminRole);
    setIsNinjaMode(false);
    setOriginalAdminRole(null);
    
    console.log('✅ Returned to admin mode');
    
    // Redirect to admin dashboard
    window.location.href = '/admin';
  };

  const value: AuthContextType = {
    user,
    userRole,
    loading,
    isRefreshing,
    isNinjaMode,
    originalAdminRole,
    signIn,
    signOut,
    ninjaLogin,
    exitNinjaMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};