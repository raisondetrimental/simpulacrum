import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('[ProtectedRoute] Checking access - loading:', loading, 'user:', user);

  if (loading) {
    console.log('[ProtectedRoute] Still loading, showing spinner...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] No user found, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;
