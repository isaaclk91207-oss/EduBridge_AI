'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star,
  TrendingUp,
  MessageSquare,
  Briefcase,
  ArrowRight,
  Loader2,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  course_name: string;
  status: string;
  progress_percentage: number;
}

interface DashboardStats {
  activeCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  certifications: number;
}

const quickLinks = [
  { 
    title: 'AI Career Roadmap', 
    description: 'Get personalized learning path',
    href: '/dashboard/ai-roadmap',
    icon: TrendingUp,
    color: 'bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)]'
  },
  { 
    title: 'AI Interview Practice', 
    description: 'Practice with mock interviews',
    href: '/dashboard/ai-interview',
    icon: MessageSquare,
    color: 'bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)]'
  },
  { 
    title: 'AI Portfolio Builder', 
    description: 'Create stunning portfolios',
    href: '/dashboard/ai-portfolio',
    icon: Briefcase,
    color: 'bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)]'
  },
  { 
    title: 'Browse Courses', 
    description: 'Explore new courses',
    href: '/dashboard/courses',
    icon: BookOpen,
    color: 'bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)]'
  },
];

// Recent Assignments component - defined first
function RecentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        if (!supabase) return;
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_assignments')
          .select('*')
          .eq('user_id', session.user.id)
          .order('submitted_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          setAssignments(data);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 bg-[var(--bg-tertiary)] rounded-lg"></div>
      ))}
    </div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No assignments yet.</p>
        <Link href="/dashboard/assignments" className="text-[var(--accent-blue)] hover:underline text-sm">
          Upload your first assignment!
        </Link>
      </div>
    );
  }

  return (
    <>
      {assignments.map((assignment) => (
        <div key={assignment.id} className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
          <div className={`w-2 h-2 rounded-full ${assignment.status === 'graded' ? 'bg-green-500' : 'bg-[var(--accent-blue)]'}`} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">{assignment.assignment_title || 'Assignment'}</p>
            <p className="text-sm text-[var(--text-secondary)]">{assignment.file_name}</p>
          </div>
        </div>
      ))}
    </>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certifications: 0
  });
  const [recentActivity, setRecentActivity] = useState<UserProgress[]>([]);
  const [userName, setUserName] = useState<string>('Student');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }

        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('No user session found');
          setLoading(false);
          return;
        }

        const userId = session.user.id;
        
        // Set user name from metadata
        if (session.user.user_metadata?.name) {
          setUserName(session.user.user_metadata.name);
        } else if (session.user.email) {
          setUserName(session.user.email.split('@')[0]);
        }

        // Fetch user progress from user_progress table - filtered by user_id
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (progressError) {
          console.error('Error fetching progress:', progressError);
        }

        // Calculate stats
        if (progressData && progressData.length > 0) {
          const active = progressData.filter(p => p.status === 'in_progress').length;
          const completed = progressData.filter(p => p.status === 'completed').length;
          
          setStats({
            activeCourses: active,
            completedCourses: completed,
            inProgressCourses: active,
            certifications: completed
          });
          
          // Get recent activity (top 3)
          setRecentActivity(progressData.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Format stats for display
  const statsDisplay = [
    { label: 'Active Courses', value: stats.activeCourses, icon: BookOpen, color: 'bg-[var(--accent-blue)]' },
    { label: 'Completed', value: stats.completedCourses, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'In Progress', value: stats.inProgressCourses, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Certifications', value: stats.certifications, icon: Star, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-blue)]" />
          <p className="text-[var(--text-secondary)]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
        <p className="text-white/80">Continue your learning journey</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Link key={link.title} href={link.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className={`${link.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  <link.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">{link.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h2>
            <Link href="/dashboard/courses" className="text-sm text-[var(--accent-blue)] hover:opacity-80 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="flex items-center gap-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center border border-[var(--border-color)]">
                    <BookOpen size={18} className="text-[var(--accent-blue)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{activity.course_name || 'Course'}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{activity.status || 'In Progress'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--accent-blue)]">{activity.progress_percentage || 0}%</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No course activity yet.</p>
                <Link href="/dashboard/courses" className="text-[var(--accent-blue)] hover:underline text-sm">
                  Start learning today!
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your Assignments</h2>
            <Link href="/dashboard/assignments" className="text-sm text-[var(--accent-blue)] hover:opacity-80 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            <RecentAssignments />
          </div>
        </motion.div>
      </div>

      {/* AI Tools Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">AI-Powered Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/ai-roadmap" className="block">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Career Roadmap</h3>
              <p className="text-sm text-[var(--text-secondary)]">AI-generated learning paths</p>
            </div>
          </Link>
          <Link href="/dashboard/ai-interview" className="block">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Interview Prep</h3>
              <p className="text-sm text-[var(--text-secondary)]">Practice with AI interviews</p>
            </div>
          </Link>
          <Link href="/dashboard/ai-portfolio" className="block">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Portfolio Builder</h3>
              <p className="text-sm text-[var(--text-secondary)]">Create professional portfolios</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

