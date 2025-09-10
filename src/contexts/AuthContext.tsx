import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  signInWithGoogle, 
  signOutUser, 
  onAuthStateChange, 
  getCurrentUserRole,
  UserRole 
} from '../firebase/auth';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  isRefreshing: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  isRefreshing: false,
  signIn: async () => {},
  signOut: async () => {}
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
      setUser(user);
      
      if (user) {
        // Only fetch user role if we don't already have it
        // This prevents unnecessary API calls during sign-in
        if (!userRole) {
          try {
            const roleData = await getCurrentUserRole();
            setUserRole(roleData);
          } catch (error) {
            console.error('Error getting user role:', error);
            setUserRole(null);
          }
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
      
      // Clear refresh flag on successful auth resolution
      if (!loading) {
        sessionStorage.removeItem('auth-refreshed');
      }
    });

    return unsubscribe;
  }, [userRole]); // Add userRole to dependencies

  const signIn = async () => {
    try {
      setLoading(true);
      const userRoleData = await signInWithGoogle();
      // Set user role immediately if we got it from signInWithGoogle
      if (userRoleData) {
        setUserRole(userRoleData);
      }
      // The onAuthStateChange will handle setting the user and update loading state
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setUserRole(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userRole,
    loading,
    isRefreshing,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};