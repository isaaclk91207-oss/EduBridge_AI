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

// Helper to set cookie (for middleware to read)
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Helper to get cookie
function getCookie(name: string): string | null {
  // First check localStorage for backup token
  if (name === 'access_token') {
    const localToken = localStorage.getItem('access_token');
    if (localToken) {
      console.log('getCookie: Found token in localStorage');
      return localToken;
    }
  }
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  // Also clear from localStorage if it's the access_token
  if (name === 'access_token' && typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    // Prevent multiple simultaneous checks
    if (!loading) {
      // Already checked, skip
    }
    
    try {
      // First check if we have a token in localStorage (client-side backup)
      let token = null;
      
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token');
        console.log('checkAuth - Token from localStorage:', token ? 'exists' : 'none');
      }
      
      // Also check cookie for server-set token
      if (!token) {
        token = getCookie('access_token');
        console.log('checkAuth - Token from cookie:', token ? 'exists' : 'none');
      }
      
      if (!token) {
        console.log('checkAuth - No token found, user not authenticated');
        setUser(null);
        setLoading(false);
        return;
      }

      // Use Next.js API route instead of external backend to avoid CORS issues
      // The API route will proxy to the backend with proper credentials
      const url = '/api/auth/me';
      console.log('checkAuth - Calling:', url);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      console.log('checkAuth - /me response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('checkAuth - /me response data:', data);
        
        // Check if the user is authenticated based on the response
        if (data.authenticated) {
          setUser({
            id: data.id || data.user_id || '1',
            email: data.email,
            name: data.username || data.full_name || data.email?.split('@')[0] || 'User'
          });
        } else {
          // Token invalid, clear it
          deleteCookie('access_token');
          setUser(null);
        }
      } else {
        // Token invalid, clear it
        deleteCookie('access_token');
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
      // Call external backend directly with proper JSON format
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';
      const url = `${backendUrl}/api/auth/login`;
      console.log('Login URL:', url);
      
      // Send JSON data to the backend
      console.log('Login email:', email);
      console.log('Login password length:', password.length);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
        credentials: 'include'
      });
      
      const data = await res.json();
      console.log('Login response:', data);
      console.log('Login response type:', typeof data);
      console.log('Login response keys:', Object.keys(data));
      
      if (data.access_token) {
        // Save token to cookie for middleware to read
        setCookie('access_token', data.access_token, 7);
        // Also save to localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.access_token);
          console.log('Login: Token saved to localStorage');
        }
        
        setUser({
          id: '1',
          email: email,
          name: email.split('@')[0]
        });
        return { success: true };
      } else {
        // Handle Pydantic validation error or other error formats
        let errorMessage = 'Login failed';
        
        if (data.detail) {
          // FastAPI error format - could be string or array
          if (Array.isArray(data.detail)) {
            // Pydantic validation error array
            errorMessage = data.detail.map((err: any) => {
              console.log('Validation error object:', err);
              return err.msg || err.message || JSON.stringify(err);
            }).join(', ');
          } else if (typeof data.detail === 'object') {
            // Object format error
            errorMessage = data.detail.msg || data.detail.message || JSON.stringify(data.detail);
          } else {
            // String format
            errorMessage = data.detail;
          }
        } else if (data.error) {
          // Custom error message from our API route
          errorMessage = data.error;
        }
        
        console.log('Parsed error message:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login failed - caught error:', error);
      console.error('Error type:', typeof error);
      // Log error details safely
      if (error && typeof error === 'object') {
        console.error('Error keys:', Object.keys(error as object));
      }
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (data: { email: string; password: string; name: string; studentType?: string; major?: string }) => {
    try {
      // Call external backend directly with proper JSON format
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edubridge-ai-ui2j.onrender.com';
      const url = `${backendUrl}/api/auth/register`;
      console.log('Signup URL:', url);
      
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
      console.log('Signup response:', response);
      console.log('Signup response type:', typeof response);
      console.log('Signup response keys:', Object.keys(response));
      console.log('Signup response.ok:', res.ok);
      
      // Check for success - could be either res.ok or success: true in body
      if (res.ok || response.success) {
        // Save token to both cookie and localStorage
        // The cookie is for middleware/server-side, localStorage is for client-side backup
        const token = response.access_token || response.accessToken;
        if (token) {
          // Save to cookie for middleware to read
          setCookie('access_token', token, 7);
          // Also save to localStorage as backup
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', token);
            console.log('Signup: Token saved to localStorage');
          }
        }
        
        setUser({
          id: response.user?.id || response.user_id || response.id || '1',
          email: response.user?.email || response.email || data.email,
          name: response.user?.username || response.username || response.full_name || data.name
        });
        return { success: true };
      } else {
        // Handle Pydantic validation error or other error formats
        let errorMessage = 'Signup failed';
        
        if (response.detail) {
          // FastAPI error format - could be string or array
          if (Array.isArray(response.detail)) {
            // Pydantic validation error array
            errorMessage = response.detail.map((err: any) => {
              console.log('Signup validation error object:', err);
              // err has: {type, loc, msg, input}
              return err.msg || err.message || JSON.stringify(err);
            }).join(', ');
          } else if (typeof response.detail === 'object') {
            // Object format error - could have msg field
            errorMessage = response.detail.msg || response.detail.message || JSON.stringify(response.detail);
          } else {
            // String format
            errorMessage = response.detail;
          }
        } else if (response.message) {
          errorMessage = response.message;
        } else if (response.error) {
          errorMessage = response.error;
        }
        
        console.log('Parsed signup error message:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Signup failed - caught error:', error);
      console.error('Signup error type:', typeof error);
      if (error && typeof error === 'object') {
        console.error('Signup error keys:', Object.keys(error as object));
      }
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      // Use Next.js API route instead of external backend directly
      const url = '/api/auth/logout';
      await fetch(url, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state regardless of API call result
      deleteCookie('access_token');
      setUser(null);
      router.push('/signin');
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
