'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

// Types
export interface EmployeeNotification {
  id: string;
  employer_id: string;
  student_id: string;
  type: 'course_completed' | 'profile_match' | 'new_application';
  title: string;
  content: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface StudentCourseCompletion {
  student_id: string;
  course_id: string;
  course_name: string;
  completed_at: string;
  progress_percentage: number;
}

// Hook for employer notifications
export function useEmployerNotifications(employerId: string | undefined) {
  const [notifications, setNotifications] = useState<EmployeeNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    const supabaseClient = supabase;
    if (!employerId || !supabaseClient) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('employee_notifications')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [employerId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const supabaseClient = supabase;
    if (!supabaseClient) return;
    
    try {
      const { error } = await supabaseClient
        .from('employee_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const supabaseClient = supabase;
    if (!employerId || !supabaseClient) return;
    
    try {
      const { error } = await supabaseClient
        .from('employee_notifications')
        .update({ is_read: true })
        .eq('employer_id', employerId)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [employerId]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    const supabaseClient = supabase;
    if (!employerId || !supabaseClient) return;

    const channel = supabaseClient
      .channel('employer-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'employee_notifications',
          filter: `employer_id=eq.${employerId}`
        },
        (payload: any) => {
          console.log('New employer notification:', payload);
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [employerId]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
}

// Hook to get student profile match updates
export function useStudentProfileMatches(employerId: string | undefined) {
  const [matches, setMatches] = useState<StudentCourseCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    const supabaseClient = supabase;
    if (!employerId || !supabaseClient) return;
    
    try {
      setLoading(true);
      
      // Get student course completions that are relevant to this employer
      const { data, error } = await supabaseClient
        .from('employee_notifications')
        .select('*')
        .eq('employer_id', employerId)
        .eq('type', 'course_completed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Parse metadata to get student course info
      const completions: StudentCourseCompletion[] = (data || []).map(n => {
        const metadata = typeof n.content === 'string' 
          ? JSON.parse(n.content) 
          : n.content;
        return {
          student_id: n.student_id,
          course_id: metadata?.course_id || '',
          course_name: metadata?.message || 'Unknown Course',
          completed_at: n.created_at,
          progress_percentage: 100
        };
      });
      
      setMatches(completions);
    } catch (err: any) {
      console.error('Error fetching student matches:', err);
    } finally {
      setLoading(false);
    }
  }, [employerId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    loading,
    refreshMatches: fetchMatches
  };
}
