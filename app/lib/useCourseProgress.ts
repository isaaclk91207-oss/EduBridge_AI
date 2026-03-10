'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Types
export interface LectureProgress {
  id: string;
  user_id: string;
  course_id: string;
  lecture_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  watch_time_seconds: number;
  completed_at: string | null;
  last_watched_at: string;
}

export interface CourseProgress {
  user_id: string;
  course_id: string;
  course_name?: string;
  progress_percentage: number;
  completed_lectures: number;
  total_lectures: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface CourseLecture {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
}

// Custom hook for course progress tracking with real-time updates
export function useCourseProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all course progress for a user
  const fetchProgress = useCallback(async () => {
    const supabaseClient = supabase;
    if (!userId || !supabaseClient) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setProgress(data || []);
    } catch (err: any) {
      console.error('Error fetching progress:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Calculate progress for a specific course
  const calculateCourseProgress = useCallback(async (courseId: string) => {
    const supabaseClient = supabase;
    if (!userId || !supabaseClient) return null;
    
    try {
      const { data, error } = await supabaseClient
        .rpc('calculate_course_progress', {
          user_uuid: userId,
          course_uuid: courseId
        });

      if (error) throw error;
      
      return data?.[0] || null;
    } catch (err: any) {
      console.error('Error calculating progress:', err);
      return null;
    }
  }, [userId]);

  // Update lecture progress
  const updateLectureProgress = useCallback(async (
    courseId: string,
    lectureId: string,
    status: 'not_started' | 'in_progress' | 'completed',
    watchTimeSeconds: number = 0
  ) => {
    const supabaseClient = supabase;
    if (!userId || !supabaseClient) return;
    
    try {
      const updates = {
        user_id: userId,
        course_id: courseId,
        lecture_id: lectureId,
        status,
        watch_time_seconds: watchTimeSeconds,
        last_watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : null
      };

      const { data, error } = await supabaseClient
        .from('lecture_progress')
        .upsert(updates, {
          onConflict: 'user_id,course_id,lecture_id'
        })
        .select();

      if (error) throw error;
      
      // Refresh progress after update
      await fetchProgress();
      
      return data;
    } catch (err: any) {
      console.error('Error updating lecture progress:', err);
      throw err;
    }
  }, [userId, fetchProgress]);

  // Mark lecture as completed
  const markLectureCompleted = useCallback(async (courseId: string, lectureId: string) => {
    return updateLectureProgress(courseId, lectureId, 'completed');
  }, [updateLectureProgress]);

  // Get lectures for a course
  const getCourseLectures = useCallback(async (courseId: string): Promise<CourseLecture[]> => {
    const supabaseClient = supabase;
    if (!supabaseClient) return [];
    
    try {
      const { data, error } = await supabaseClient
        .from('course_lectures')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      
      return data || [];
    } catch (err: any) {
      console.error('Error fetching lectures:', err);
      return [];
    }
  }, []);

  // Get lecture progress for a specific course
  const getLectureProgress = useCallback(async (courseId: string): Promise<LectureProgress[]> => {
    const supabaseClient = supabase;
    if (!userId || !supabaseClient) return [];
    
    try {
      const { data, error } = await supabaseClient
        .from('lecture_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;
      
      return data || [];
    } catch (err: any) {
      console.error('Error fetching lecture progress:', err);
      return [];
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Set up real-time subscription
  useEffect(() => {
    const supabaseClient = supabase;
    if (!userId || !supabaseClient) return;

    const channel = supabaseClient
      .channel('progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lecture_progress',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          console.log('Real-time progress update:', payload);
          // Refresh progress when there's a change
          fetchProgress();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          console.log('Real-time course progress update:', payload);
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId, fetchProgress]);

  return {
    progress,
    loading,
    error,
    calculateCourseProgress,
    updateLectureProgress,
    markLectureCompleted,
    getCourseLectures,
    getLectureProgress,
    refreshProgress: fetchProgress
  };
}

// Hook for dashboard stats
export function useDashboardStats(userId: string | undefined) {
  const { progress, loading, error } = useCourseProgress(userId);
  
  const activeCourses = progress.filter(p => p.status === 'in_progress').length;
  const completedCourses = progress.filter(p => p.status === 'completed').length;
  const totalProgress = progress.length > 0
    ? Math.round(progress.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / progress.length)
    : 0;

  return {
    activeCourses,
    completedCourses,
    totalProgress,
    loading,
    error
  };
}
