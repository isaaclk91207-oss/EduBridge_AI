'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface AssignmentNotification {
  id: string;
  employer_id: string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_name: string;
  assignment_title: string;
  file_name: string;
  file_url: string;
  notification_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useAssignmentNotifications(employerId: string) {
  const [notifications, setNotifications] = useState<AssignmentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabaseClient = supabase;
    if (!employerId || !supabaseClient) return;

    // Initial fetch of notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('assignment_notifications')
          .select('*')
          .eq('employer_id', employerId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        setNotifications(data || []);
        setUnreadCount((data || []).filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabaseClient
      .channel('assignment-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assignment_notifications',
          filter: `employer_id=eq.${employerId}`
        },
        (payload) => {
          console.log('New assignment notification:', payload);
          
          // Add new notification to the list
          const newNotification = payload.new as AssignmentNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [employerId]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    const supabaseClient = supabase;
    if (!supabaseClient || !employerId) return;

    try {
      const { error } = await supabaseClient
        .from('assignment_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const supabaseClient = supabase;
    if (!supabaseClient || !employerId) return;

    try {
      const { error } = await supabaseClient
        .from('assignment_notifications')
        .update({ is_read: true })
        .eq('employer_id', employerId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  };
}
