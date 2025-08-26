import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('jwtToken');
    return !!token && !!user;
  };

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If profile fetch fails, user might not be properly authenticated
      if (error.response?.status === 401) {
        await logout();
      }
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase signout error:', error);
    } finally {
      localStorage.removeItem('jwtToken');
      setUser(null);
      setUserProfile(null);
      navigate('/login');
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No Firebase user found');
      }

      const idToken = await currentUser.getIdToken(true);
      const response = await axios.post('/auth/firebase-login', {
        firebaseToken: idToken,
      });

      const newToken = response.data.token;
      localStorage.setItem('jwtToken', newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user profile if we have a JWT token
        const token = localStorage.getItem('jwtToken');
        if (token) {
          await fetchUserProfile();
        }
      } else {
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('jwtToken');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated,
    logout,
    refreshToken,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
