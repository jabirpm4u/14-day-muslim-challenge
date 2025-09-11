import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Landing from './components/ui/Landing';
import { subscribeToChallengeSettings, ChallengeSettings, advanceToNextDay, getCurrentISTDate, convertToIST } from './firebase/firestore';

// Lazy load admin and participant dashboards for better performance
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const ParticipantDashboard = React.lazy(() => import('./components/participant/ParticipantDashboard'));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !userRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Role-based Route Component
const RoleBasedRoute: React.FC<{ allowedRole: 'admin' | 'participant' }> = ({ allowedRole }) => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (userRole.role !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = userRole.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return allowedRole === 'admin' ? (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  ) : (
    <Suspense fallback={<LoadingSpinner />}>
      <ParticipantDashboard />
    </Suspense>
  );
};

// Main App Routes Component
const AppRoutes: React.FC = () => {
  const { user, userRole, loading } = useAuth();
  const [challengeSettings, setChallengeSettings] = React.useState<ChallengeSettings | null>(null);

  console.log("🚀 AppRoutes component loaded");
  console.log("🚀 User:", user);
  console.log("🚀 UserRole:", userRole);
  console.log("🚀 Loading:", loading);

  React.useEffect(() => {
    console.log("🔄 Challenge settings subscription effect triggered");
    const unsub = subscribeToChallengeSettings((settings) => {
      console.log("📡 Challenge settings updated:", settings);
      setChallengeSettings(settings);
    });
    return () => unsub();
  }, []);

  // Global IST-based day advancement logic (only on first access after 12 AM IST)
  React.useEffect(() => {
    console.log("🔄 IST Day Advancement Effect Triggered");
    console.log("Challenge Settings:", challengeSettings);
    
    const checkAndAdvanceDayIST = async () => {
      console.log("🚀 checkAndAdvanceDayIST function called");
      
      if (!challengeSettings) {
        console.log("❌ No challenge settings found, skipping...");
        return;
      }
      
      if (!challengeSettings.isActive) {
        console.log("❌ Challenge is not active, skipping...");
        return;
      }
      
      if (challengeSettings.isPaused) {
        console.log("❌ Challenge is paused, skipping...");
        return;
      }
      
      console.log("✅ Challenge is active and not paused, proceeding with IST check...");
      
      try {
        // Get current IST time using utility function
        const istDate = getCurrentISTDate();
        const istDateString = istDate.toDateString(); // Format: "Mon Jan 01 2024"
        
        console.log("📅 Current IST Date:", istDateString);
        console.log("📅 IST Date Object:", istDate);
        
        // Get the last advancement date from localStorage
        const lastAdvancementKey = `lastDayAdvancement_${challengeSettings.id || 'default'}`;
        const lastAdvancementDate = localStorage.getItem(lastAdvancementKey);
        
        console.log("🔑 Last Advancement Key:", lastAdvancementKey);
        console.log("📝 Last Advancement Date:", lastAdvancementDate);
        
        // Check if we've already advanced today
        if (lastAdvancementDate === istDateString) {
          console.log(`⏭️ Day already advanced today (${istDateString}), skipping...`);
          return;
        }
        
        // Calculate expected day based on IST date
        const expectedDay = computeExpectedDayFromISTDate(challengeSettings, istDate);
        
        console.log(`📊 IST Day Check - Current IST Date: ${istDateString}`);
        console.log(`📊 Current Day: ${challengeSettings.currentDay}`);
        console.log(`📊 Expected Day: ${expectedDay}`);
        console.log(`📊 Start Date: ${challengeSettings.startDate}`);
        
        if (expectedDay > challengeSettings.currentDay) {
          console.log(`🚀 IST Day Advancement: Advancing from day ${challengeSettings.currentDay} to day ${expectedDay} on ${istDateString}`);
          
          // Advance stepwise to ensure task activation/deactivation logic runs
          for (let d = challengeSettings.currentDay; d < expectedDay; d++) {
            console.log(`  → Advancing to day ${d + 1}...`);
            await advanceToNextDay(d);
          }
          
          // Mark today as advanced
          localStorage.setItem(lastAdvancementKey, istDateString);
          console.log(`✅ Day advancement completed for ${istDateString}`);
        } else {
          console.log(`ℹ️ No day advancement needed. Current: ${challengeSettings.currentDay}, Expected: ${expectedDay}`);
        }
      } catch (e) {
        console.error("❌ IST day advancement failed:", e);
      }
    };

    // Helper function to compute expected day based on IST date matching scheduledDate
    const computeExpectedDayFromISTDate = (settings: ChallengeSettings, istDate: Date): number => {
      console.log("🔍 computeExpectedDayFromISTDate called");
      console.log("🔍 Current IST date:", istDate);
      console.log("🔍 Challenge days:", settings.challengeDays);
      
      if (!settings.challengeDays || settings.challengeDays.length === 0) {
        console.log("❌ No challenge days found, returning current day:", settings.currentDay || 0);
        return settings.currentDay || 0;
      }
      
      // Get today's date string in IST for comparison
      const todayISTString = istDate.toDateString();
      console.log("🔍 Today IST date string:", todayISTString);
      
      // Check if today matches any scheduledDate
      for (const day of settings.challengeDays) {
        const scheduledDate = day.scheduledDate?.toDate ? day.scheduledDate.toDate() : new Date(day.scheduledDate);
        const scheduledDateIST = convertToIST(scheduledDate);
        const scheduledDateString = scheduledDateIST.toDateString();
        
        console.log(`🔍 Checking Day ${day.dayNumber}:`, {
          scheduledDate: scheduledDate,
          scheduledDateIST: scheduledDateIST,
          scheduledDateString: scheduledDateString,
          matches: scheduledDateString === todayISTString
        });
        
        if (scheduledDateString === todayISTString) {
          console.log(`✅ Found matching day! Day ${day.dayNumber} matches today (${todayISTString})`);
          return day.dayNumber;
        }
      }
      
      console.log("❌ No matching scheduled date found for today, returning current day:", settings.currentDay || 0);
      return settings.currentDay || 0;
    };

    // Run IST-based day advancement check
    checkAndAdvanceDayIST();
  }, [challengeSettings]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // If user is authenticated but userRole is not loaded yet, show loading
  if (user && !userRole) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to={userRole?.role === 'admin' ? '/admin' : '/dashboard'} replace />} 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRole="admin" />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRole="participant" />
          </ProtectedRoute>
        } 
      />
      
      {/* Default route: if challenge inactive, show pre-challenge homepage */}
      <Route 
        path="/" 
        element={
          challengeSettings && !challengeSettings.isActive ? (
            <Landing />
          ) : user && userRole ? (
            <Navigate to={userRole.role === 'admin' ? '/admin' : '/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Catch all - redirect to appropriate dashboard or login */}
      <Route 
        path="*" 
        element={
          user && userRole ? (
            <Navigate to={userRole.role === 'admin' ? '/admin' : '/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-islamic-light to-white">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;