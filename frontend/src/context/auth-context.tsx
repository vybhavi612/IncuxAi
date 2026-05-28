'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  timezone: string;
  githubUsername?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, timezone: string) => Promise<void>;
  logout: () => void;
  updateUserContext: (updatedFields: Partial<User>) => void;
  apiUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Attempt automatic session retrieval on boot
    const savedToken = localStorage.getItem('wp_access_token');
    const savedUser = localStorage.getItem('wp_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Invalid email or password credentials');
      }

      const data = await res.json();
      localStorage.setItem('wp_access_token', data.access_token);
      localStorage.setItem('wp_refresh_token', data.refresh_token);
      localStorage.setItem('wp_user', JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);

      // Route based on role
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      throw e;
    }
  };

  const register = async (name: string, email: string, pass: string, timezone: string) => {
    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, timezone }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Registration failed. Administrator may have disabled self-signup.');
      }

      const data = await res.json();
      localStorage.setItem('wp_access_token', data.access_token);
      localStorage.setItem('wp_refresh_token', data.refresh_token);
      localStorage.setItem('wp_user', JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);

      router.push('/dashboard');
    } catch (e) {
      throw e;
    }
  };

  const logout = () => {
    // Notify server of logout
    if (token) {
      fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }

    localStorage.removeItem('wp_access_token');
    localStorage.removeItem('wp_refresh_token');
    localStorage.removeItem('wp_user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const updateUserContext = (updatedFields: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updatedFields };
      setUser(merged);
      localStorage.setItem('wp_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserContext, apiUrl }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be executed within an AuthProvider element');
  }
  return context;
};
