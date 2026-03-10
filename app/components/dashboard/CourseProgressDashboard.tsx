'use client';

import { useEffect, useState } from 'react';
import { useCourseProgress, useDashboardStats } from '@/lib/useCourseProgress';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface CourseProgressDashboardProps {
  userId?: string;
}

export default function CourseProgressDashboard({ userId }: CourseProgressDashboardProps) {
  const { activeCourses, completedCourses, totalProgress, loading } = useDashboardStats(userId);
  const [isVisible, setIsVisible] = useState(false);

  // Animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 animate-pulse">
            <div className="h-16 bg-[var(--bg-tertiary)] rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Active Courses',
      value: activeCourses,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Completed',
      value: completedCourses,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Overall Progress',
      value: `${totalProgress}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm">{stat.label}</p>
              <p className="text-3xl font-bold mt-1 text-[var(--text-primary)]">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Real-time updated course list component
interface CourseListProps {
  userId?: string;
  limit?: number;
}

export function ActiveCoursesList({ userId, limit = 5 }: CourseListProps) {
  const { progress, loading } = useCourseProgress(userId);
  
  const activeCourses = progress
    .filter(p => p.status === 'in_progress')
    .slice(0, limit);

  if (loading) {
    return <div className="animate-pulse space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-[var(--bg-tertiary)] rounded-lg"></div>
      ))}
    </div>;
  }

  if (activeCourses.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No active courses. Start learning today!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeCourses.map((course) => (
        <div
          key={course.course_id}
          className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-[var(--text-primary)]">
              {course.course_name || 'Course'}
            </h4>
            <span className="text-sm text-[var(--text-secondary)]">
              {course.progress_percentage}%
            </span>
          </div>
          <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2">
            <div
              className="bg-[var(--accent-blue)] h-2 rounded-full transition-all duration-500"
              style={{ width: `${course.progress_percentage}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {course.completed_lectures} of {course.total_lectures} lectures completed
          </p>
        </div>
      ))}
    </div>
  );
}
