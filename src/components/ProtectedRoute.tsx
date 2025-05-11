import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  // You can add any additional props you might need, e.g., roles/permissions
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You can render a loading spinner or a blank page while checking auth status
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500/40 via-green-500/40 to-blue-500/40 dark:from-blue-700/50 dark:via-green-700/50 dark:to-blue-700/50">
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!user) {
    // User not authenticated, redirect to login page
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child route content
  return <Outlet />;
};

export default ProtectedRoute; 