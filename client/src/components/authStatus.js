import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthStatus = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="text-sm text-red-500">
        Not authenticated
      </div>
    );
  }

  return (
    <div className="text-sm text-green-600">
      Logged in as: {user?.displayName || user?.email || 'User'}
    </div>
  );
};

export default AuthStatus;
