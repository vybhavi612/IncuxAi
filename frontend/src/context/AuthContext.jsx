import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { auth as clientAuth, isMockFirebase } from '../services/firebase.js';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure Axios default header on token change
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load current user profile from backend on mount if token exists
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/auth/me`);
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error('Error fetching current user:', error.message);
          handleLogout();
        }
      }
      setLoading(false);
    };

    loadCurrentUser();
  }, [token]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      let firebaseToken = '';

      if (isMockFirebase) {
        const res = await clientAuth.signInWithEmail(email, password);
        firebaseToken = await res.user.getIdToken();
      } else {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
        firebaseToken = await userCredential.user.getIdToken();
      }

      // Send token to backend
      const response = await axios.post(`${API_URL}/auth/login`, {
        firebaseIdToken: firebaseToken
      });

      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      setLoading(false);
      console.error('Login action error:', error.message);
      // Let's support a direct backend login fallback if the token login fails (e.g. mock connection or test setup)
      try {
        console.log('Attempting password-based login fallback...');
        const fallbackRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        if (fallbackRes.data.success) {
          setToken(fallbackRes.data.token);
          setUser(fallbackRes.data.user);
          return { success: true, user: fallbackRes.data.user };
        }
      } catch (fallbackErr) {
        console.error('Login fallback failed:', fallbackErr.message);
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Authentication failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      // Create user on backend directly (backend manages password hashing, firebase insertion, and local record)
      const response = await axios.post(`${API_URL}/auth/register`, userData);

      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { 
          success: true, 
          message: response.data.message,
          verificationLink: response.data.verificationLink // for testing/mock access
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      setLoading(false);
      console.error('Register action error:', error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    if (!isMockFirebase && clientAuth.signOut) {
      clientAuth.signOut().catch(err => console.error('Firebase signout error:', err));
    } else if (isMockFirebase && clientAuth.logOut) {
      clientAuth.logOut();
    }
  };

  const handleUpdateProfile = async (id, profileData) => {
    try {
      const res = await axios.put(`${API_URL}/users/${id}`, profileData);
      if (res.data.success) {
        setUser(prev => ({
          ...prev,
          ...res.data.user
        }));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      console.error('Update Profile action error:', error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to update profile' 
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateProfile: handleUpdateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
