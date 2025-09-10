import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import LoadingSpinner from './components/ui/LoadingSpinner';

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
      
      {/* Default Redirect */}
      <Route 
        path="/" 
        element={
          user && userRole ? (
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