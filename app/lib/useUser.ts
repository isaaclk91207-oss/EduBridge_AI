'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    username?: string;
  };
}

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
}

/**
 * Custom hook to get the currently authenticated user from Supabase
 * This is the proper way to get the user ID for all database queries
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Get the current user from Supabase Auth
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError) {
        console.error('Auth session error:', authError);
        throw authError;
      }

      if (session?.user) {
        setUser(session.user as User);
        
        // Also store in localStorage as fallback for components that might need it
        if (typeof window !== 'undefined') {
          localStorage.setItem('edubridge_user_id', session.user.id);
          localStorage.setItem('edubridge_user_email', session.user.email || '');
          if (session.user.user_metadata?.name) {
            localStorage.setItem('edubridge_user_name', session.user.user_metadata.name);
          }
        }
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.error('Error fetching user:', err);
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Set up auth state listener
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user as User);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          // Clear localStorage on sign out
          if (typeof window !== 'undefined') {
            localStorage.removeItem('edubridge_user_id');
            localStorage.removeItem('edubridge_user_email');
            localStorage.removeItem('edubridge_user_name');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refreshUser: fetchUser
  };
}

/**
 * Get user ID safely - prefers Supabase Auth, falls back to localStorage
 */
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  // First try to get from localStorage (set by useUser hook)
  const storedId = localStorage.getItem('edubridge_user_id');
  return storedId;
}

