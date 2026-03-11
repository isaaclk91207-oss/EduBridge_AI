'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { buildApiUrl, API_ENDPOINTS } from './api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; name: string; studentType?: string; major?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      // Use the API URL helper to hit the backend
      const url = buildApiUrl(API_ENDPOINTS.ME || '/api/auth/me');
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.authenticated && data.user) {
        setUser({
          id: data.user.id || data.user.userId,
          email: data.user.email,
          name: data.user.username || data.user.name
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.LOGIN);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),  // OAuth2 expects username/password
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (data.access_token) {
        setUser({
          id: data.user?.id || '1',
          email: email,
          name: data.user?.username || email.split('@')[0]
        });
        return { success: true };
      } else {
        return { success: false, error: data.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (data: { email: string; password: string; name: string; studentType?: string; major?: string }) => {
    try {
      // Use buildApiUrl to ensure we're hitting the backend
      const url = buildApiUrl('/api/auth/register');
      console.log('Signup URL:', url);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          username: data.name,
          full_name: data.name
        }),
        credentials: 'include'
      });
      
      const response = await res.json();
      console.log('Signup response:', response);
      
      if (res.ok) {
        setUser({
          id: response.id || '1',
          email: response.email,
          name: response.username || response.full_name || data.name
        });
        return { success: true };
      } else {
        return { success: false, error: response.detail || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup failed:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.LOGOUT);
      await fetch(url, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
