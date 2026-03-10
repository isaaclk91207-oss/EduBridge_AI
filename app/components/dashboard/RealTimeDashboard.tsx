'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Award, TrendingUp, Loader2 } from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface UserProgress {
  id: string;
  course_id: string;
  course_name: string;
  status: 'enrolled' | 'in_progress' | 'completed';
  progress_percentage: number;
  completed_at: string | null;
}

interface Certificate {
  id: string;
  course_name: string;
  certificate_number: string;
  issued_at: string;
  image_url: string | null;
}

interface DashboardStats {
  activeCourses: number;
  completedCourses: number;
  certificates: number;
}

// Get fresh Supabase client
function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  return null;
}

export default function RealTimeDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<DashboardStats>({
    activeCourses: 0,
    completedCourses: 0,
    certificates: 0,
  });
  const [activeCourses, setActiveCourses] = useState<UserProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data function
  const fetchDashboardData = useCallback(async (supabase: SupabaseClient) => {
    try {
      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (progressError) {
        console.error('Progress error:', progressError);
      }

      // Fetch certificates
      const { data: certData, error: certError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

      if (certError) {
        console.error('Certificate error:', certError);
      }

      // Calculate stats
      const active = progressData?.filter(p => p.status === 'in_progress' || p.status === 'enrolled') || [];
      const completed = progressData?.filter(p => p.status === 'completed') || [];
      const certs = certData || [];

      setActiveCourses(active);
      setCertificates(certs);
      setStats({
        activeCourses: active.length,
        completedCourses: completed.length,
        certificates: certs.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchDashboardData(supabase);

    // Set up realtime subscription for user_progress using supabase.channel()
    const progressChannel = supabase.channel('dashboard_progress_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('📚 New progress inserted:', payload);
          fetchDashboardData(supabase);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('📚 Progress updated:', payload);
          fetchDashboardData(supabase);
        }
      )
      .subscribe((status) => {
        console.log('📚 Progress channel status:', status);
      });

    // Set up realtime subscription for certificates
    const certChannel = supabase.channel('dashboard_certificates_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'certificates',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🏆 New certificate inserted:', payload);
          fetchDashboardData(supabase);
        }
      )
      .subscribe((status) => {
        console.log('🏆 Certificate channel status:', status);
      });

    // Cleanup
    return () => {
      console.log('Cleaning up dashboard subscriptions');
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(certChannel);
    };
  }, [userId, fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-[var(--accent-blue)] animate-spin mr-2" />
        <span className="text-[var(--text-secondary)]">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--accent-blue)]/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[var(--accent-blue)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.activeCourses}</p>
              <p className="text-sm text-[var(--text-secondary)]">Active Courses</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.completedCourses}</p>
              <p className="text-sm text-[var(--text-secondary)]">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.certificates}</p>
              <p className="text-sm text-[var(--text-secondary)]">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Courses */}
      {activeCourses.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Active Courses</h3>
          <div className="space-y-3">
            {activeCourses.map((course) => (
              <div key={course.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--text-primary)]">{course.course_name}</span>
                  <span className="text-sm text-[var(--accent-blue)]">{course.progress_percentage}%</span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                  <div
                    className="bg-[var(--accent-blue)] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Certificates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] truncate">{cert.course_name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Issued: {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeCourses.length === 0 && certificates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[var(--text-secondary)]">No courses or certificates yet.</p>
          <p className="text-sm text-[var(--text-muted)]">Enroll in courses to get started!</p>
        </div>
      )}
    </>
  );
}
