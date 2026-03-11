'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Demo token constant - must match the one in middleware.ts
export const DEMO_TOKEN = 'DEMO_TOKEN_12345';

// Demo user data
export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@edubridge.ai',
  name: 'Demo User'
};

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
  handleDemoLogin: () => Promise<void>;
  isDemoUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to set cookie
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

// Helper to get cookie
function getCookie(name: string): string | null {
  if (name === 'access_token') {
    const localToken = localStorage.getItem('access_token');
    if (localToken) return localToken;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  if (name === 'access_token' && typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isDemoUser = (): boolean => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || getCookie('access_token');
      return token === DEMO_TOKEN;
    }
    return false;
  };

  const handleDemoLogin = async (): Promise<void> => {
    console.log('[Demo Login] Setting demo token');
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', DEMO_TOKEN);
    }
    setCookie('access_token', DEMO_TOKEN, 7);
    setUser(DEMO_USER as User);
    console.log('[Demo Login] User set, redirecting to /dashboard');
    router.push('/dashboard');
  };

  const checkAuth = async () => {
    try {
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token');
      }
      if (!token) {
        token = getCookie('access_token');
      }
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // DEMO TOKEN - Skip backend call
      if (token === DEMO_TOKEN) {
        console.log('[checkAuth] Demo token detected, bypassing backend');
        setUser(DEMO_USER as User);
        setLoading(false);
        return;
      }

      // For real tokens, call the backend
      const url = '/api/auth/me';
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser({
            id: data.id || data.user_id || '1',
            email: data.email,
            name: data.username || data.full_name || data.email?.split('@')[0] || 'User'
          });
        } else {
          deleteCookie('access_token');
          setUser(null);
        }
      } else {
        deleteCookie('access_token');
        setUser(null);
      }
    } catch (error) {
      console.error('[checkAuth] Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';
      const url = `${backendUrl}/api/auth/login`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (data.access_token) {
        setCookie('access_token', data.access_token, 7);
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.access_token);
        }
        setUser({ id: '1', email, name: email.split('@')[0] });
        return { success: true };
      } else {
        const errorMessage = data.detail || data.error || 'Login failed';
        return { success: false, error: typeof errorMessage === 'string' ? errorMessage : 'Login failed' };
      }
    } catch (error) {
      console.error('[Login] Error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (data: { email: string; password: string; name: string; studentType?: string; major?: string }) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';
      const url = `${backendUrl}/api/auth/register`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          username: data.name,
          full_name: data.name,
          student_type: data.studentType || 'public',
          major: data.major || ''
        }),
        credentials: 'include'
      });
      
      const response = await res.json();
      
      if (res.ok || response.success) {
        const token = response.access_token || response.accessToken;
        if (token) {
          setCookie('access_token', token, 7);
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', token);
          }
        }
        setUser({
          id: response.user?.id || response.user_id || response.id || '1',
          email: response.user?.email || response.email || data.email,
          name: response.user?.username || response.username || response.full_name || data.name
        });
        return { success: true };
      } else {
        const errorMessage = response.detail || response.message || response.error || 'Signup failed';
        return { success: false, error: typeof errorMessage === 'string' ? errorMessage : 'Signup failed' };
      }
    } catch (error) {
      console.error('[Signup] Error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('[Logout] API call failed:', error);
    } finally {
      deleteCookie('access_token');
      setUser(null);
      router.push('/auth');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth, handleDemoLogin, isDemoUser }}>
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

