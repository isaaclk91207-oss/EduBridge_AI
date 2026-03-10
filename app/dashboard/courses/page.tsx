'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Clock, Users, Star, Play, Video, Loader2, Send, Bot, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Types
interface Lecture {
  id: number;
  title: string;
  youtube_id: string;
  duration: string;
  course: string;
}

// AI Chat types
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

// Helper function to convert youtube_id to embed URL
function getYoutubeEmbedUrl(youtubeId: string | null | undefined): string {
  if (!youtubeId) return '';
  return `https://www.youtube.com/embed/${youtubeId}`;
}

export default function Courses() {
  // State
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [filteredLectures, setFilteredLectures] = useState<Lecture[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'ai', content: 'Hello! I\'m your AI learning assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Video player state
  const [activeVideo, setActiveVideo] = useState<Lecture | null>(null);
  const [videoError, setVideoError] = useState(false);

  // Course progress from Supabase
  const [courseProgress, setCourseProgress] = useState<{[key: string]: number}>({});
  const [isProgressLoading, setIsProgressLoading] = useState(true);

  // Fetch user progress from Supabase
  useEffect(() => {
    async function fetchUserProgress() {
      if (!supabase) {
        setIsProgressLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsProgressLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_progress')
          .select('course_id, progress_percentage, status')
          .eq('user_id', session.user.id);

        if (!error && data) {
          // Create a map of course_id -> progress_percentage
          const progressMap: {[key: string]: number} = {};
          data.forEach((item) => {
            progressMap[item.course_id] = item.progress_percentage || 0;
          });
          setCourseProgress(progressMap);
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setIsProgressLoading(false);
      }
    }

    fetchUserProgress();
  }, []);

  // Get course progress helper function
  const getCourseProgress = (courseId: string): number => {
    return courseProgress[courseId] || 0;
  };

  // Fetch lectures from Supabase
  useEffect(() => {
    async function fetchLectures() {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!supabase) {
          // Use mock data if Supabase is not configured
          console.log('Supabase not initialized, using mock data');
          const mockLectures: Lecture[] = [
            { id: 1, title: 'Introduction to Python', youtube_id: 'abc123', duration: '45 min', course: 'Python for Business' },
            { id: 2, title: 'Data Types and Variables', youtube_id: 'def456', duration: '30 min', course: 'Python for Business' },
            { id: 3, title: 'Control Flow Statements', youtube_id: 'ghi789', duration: '40 min', course: 'Python for Business' },
          ];
          setLectures(mockLectures);
          setFilteredLectures(mockLectures);
          if (mockLectures.length > 0) {
            setActiveVideo(mockLectures[0]);
          }
          setIsLoading(false);
          return;
        }

        // Try to fetch from Supabase
        const { data, error: supabaseError } = await supabase
          .from('lectures')
          .select('*')
          .order('id', { ascending: true });

        if (supabaseError) {
          console.warn('Supabase table not found or error:', supabaseError.message);
          // Use mock data as fallback
          const mockLectures: Lecture[] = [
            { id: 1, title: 'Introduction to Python', youtube_id: 'abc123', duration: '45 min', course: 'Python for Business' },
            { id: 2, title: 'Data Types and Variables', youtube_id: 'def456', duration: '30 min', course: 'Python for Business' },
            { id: 3, title: 'Control Flow Statements', youtube_id: 'ghi789', duration: '40 min', course: 'Python for Business' },
          ];
          setLectures(mockLectures);
          setFilteredLectures(mockLectures);
          if (mockLectures.length > 0) {
            setActiveVideo(mockLectures[0]);
          }
        } else {
          const lecturesData = data || [];
          setLectures(lecturesData);
          setFilteredLectures(lecturesData);
          
          if (lecturesData.length > 0) {
            setActiveVideo(lecturesData[0]);
          }
        }
      } catch (err: any) {
        console.error('Error fetching lectures:', err);
        // Use mock data on any error
        const mockLectures: Lecture[] = [
          { id: 1, title: 'Introduction to Python', youtube_id: 'abc123', duration: '45 min', course: 'Python for Business' },
          { id: 2, title: 'Data Types and Variables', youtube_id: 'def456', duration: '30 min', course: 'Python for Business' },
          { id: 3, title: 'Control Flow Statements', youtube_id: 'ghi789', duration: '40 min', course: 'Python for Business' },
        ];
        setLectures(mockLectures);
        setFilteredLectures(mockLectures);
        if (mockLectures.length > 0) {
          setActiveVideo(mockLectures[0]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchLectures();
  }, []);

  // Filter lectures based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLectures(lectures);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = lectures.filter(lecture =>
        lecture.title?.toLowerCase().includes(query)
      );
      setFilteredLectures(filtered);
    }
  }, [searchQuery, lectures]);

  const handleVideoClick = (lecture: Lecture) => {
    setActiveVideo(lecture);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const getUserId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('edubridge_user_id') || 'guest';
    }
    return 'guest';
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const userId = getUserId();
      
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message: userMessage.content,
          history: chatMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.reply || 'I\'m sorry, I couldn\'t process your request.'
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Server Connection Error. Please ensure the backend is running at http://localhost:8000'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const courses = [
    {
      id: 'python-business',
      title: 'Python for Business',
      progress: 75,
      instructor: 'Dr. Sarah Johnson',
      duration: '8 weeks',
      students: 1247,
      rating: 4.8
    },
    {
      id: 'digital-marketing',
      title: 'Digital Marketing Fundamentals',
      progress: 45,
      instructor: 'Prof. Michael Chen',
      duration: '6 weeks',
      students: 892,
      rating: 4.6
    },
    {
      id: 'data-structures',
      title: 'Data Structures & Algorithms',
      progress: 90,
      instructor: 'Dr. Alex Rodriguez',
      duration: '12 weeks',
      students: 654,
      rating: 4.9
    },
    {
      id: 'web-development-react',
      title: 'Web Development with React',
      progress: 30,
      instructor: 'Ms. Emily Davis',
      duration: '10 weeks',
      students: 1034,
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-[var(--text-primary)]">My Courses</h1>
          <p className="text-[var(--text-secondary)]">Continue your learning journey</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Video Player + AI Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Video Player */}
          <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
                <Play className="text-[var(--accent-blue)]" />
                Now Playing
              </h2>
            </div>
            <div className="aspect-video bg-[var(--bg-tertiary)]">
              {activeVideo && !videoError ? (
                activeVideo.youtube_id ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYoutubeEmbedUrl(activeVideo.youtube_id)}
                    title={activeVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onError={handleVideoError}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Play className="w-16 h-16 text-[var(--text-muted)] mb-4" />
                    <p className="text-lg text-[var(--text-secondary)]">{activeVideo.title}</p>
                    <p className="text-[var(--text-muted)] mt-2">{activeVideo.course}</p>
                  </div>
                )
              ) : videoError ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-2" />
                    <p className="text-[var(--text-muted)]">Video Unavailable</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-[var(--text-muted)]">Select a video to play</p>
                </div>
              )}
            </div>
            {activeVideo && !videoError && (
              <div className="p-4 border-t border-[var(--border-color)]">
                <h3 className="font-semibold text-[var(--text-primary)]">{activeVideo.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{activeVideo.course}</p>
              </div>
            )}
          </div>

          {/* AI Chat */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-xl h-[400px] flex flex-col">
            <div className="p-4 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                <Bot className="text-[var(--accent-blue)]" />
                AI Support
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-lg ${
                    msg.role === 'user' ? 'bg-[var(--accent-blue)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-tertiary)] px-3 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[var(--border-color)]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask AI..."
                  disabled={isChatLoading}
                  className="flex-1 px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-2 bg-[var(--accent-blue)] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid - Now fetches real progress from Supabase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {courses.map((course) => {
            // Get real progress from Supabase (only shows progress after learning)
            const progress = getCourseProgress(course.id);
            const isStarted = progress > 0;
            
            return (
              <div key={course.title} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-[var(--text-primary)]">{course.title}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">by {course.instructor}</p>
                    <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mt-2">
                      <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                      <span className="flex items-center gap-1"><Users size={14} /> {course.students}</span>
                      <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> {course.rating}</span>
                    </div>
                  </div>
                  <BookOpen className="text-[var(--accent-blue)]" size={28} />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-secondary)]">Progress</span>
                    <span className="text-[var(--accent-blue)] font-medium">{isStarted ? `${progress}%` : 'Not started'}</span>
                  </div>
                  <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                    <div className="bg-[var(--accent-blue)] h-2 rounded-full" style={{ width: `${isStarted ? progress : 0}%` }} />
                  </div>
                </div>
                <Link href={`/dashboard/courses/${course.id}`}>
                  <button className="w-full bg-[var(--accent-blue)] hover:opacity-90 text-white font-medium py-2 rounded-lg transition-colors">
                    {isStarted ? (progress === 100 ? 'Review Course' : 'Continue Learning') : 'Start Learning'}
                  </button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Video Lectures Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
            <Video className="text-[var(--accent-blue)]" />
            Video Lectures
          </h2>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-1/3 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
            />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[var(--accent-blue)] animate-spin mr-2" />
              <span className="text-[var(--text-secondary)]">Loading...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
              <p className="text-red-600 dark:text-red-400">Error: {error}</p>
            </div>
          ) : filteredLectures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLectures.map((lecture) => (
                <div
                  key={lecture.id}
                  onClick={() => handleVideoClick(lecture)}
                  className={`bg-[var(--bg-secondary)] border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all ${
                    activeVideo?.id === lecture.id ? 'border-[var(--accent-cyan)] shadow-sm' : 'border-[var(--border-color)]'
                  }`}
                >
                  <div className="h-28 bg-[var(--bg-tertiary)] flex items-center justify-center relative">
                    <Play className="w-10 h-10 text-[var(--accent-blue)]" />
                    <div className="absolute bottom-2 right-2 bg-[var(--bg-secondary)]/80 px-2 py-1 rounded text-xs text-[var(--text-secondary)]">
                      {lecture.duration || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">{lecture.title}</h3>
                    <p className="text-[var(--text-muted)] text-xs mt-1">{lecture.course}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 text-center">
              <p className="text-[var(--text-secondary)]">
                {searchQuery ? 'No lectures match your search.' : 'No lectures available.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
