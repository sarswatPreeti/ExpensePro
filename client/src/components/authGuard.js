import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import LoadingSpinner from './loadingSpinner';

const AuthGuard = ({ children, requireAuth = true, redirectTo = "/login" }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-screen" />;
  }

  if (requireAuth && !isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthGuard;
