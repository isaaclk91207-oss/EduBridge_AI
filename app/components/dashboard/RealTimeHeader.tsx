'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Bell, MessageCircle, User, Github, Linkedin, Twitter, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string | null;
  is_read: boolean;
  created_at: string;
}

interface RealTimeHeaderProps {
  userId?: string;
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

export default function RealTimeHeader({ userId }: RealTimeHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications function
  const fetchNotifications = useCallback(async (supabase: SupabaseClient) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [userId]);

  // Fetch notifications and set up realtime subscription
  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }

    // Initial fetch
    fetchNotifications(supabase);

    // Set up realtime subscription for new notifications using supabase.channel()
    const notificationChannel = supabase.channel('header_notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 New notification received:', payload);
          const newNotification = payload.new as Notification;
          
          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('New Notification', {
                body: newNotification.title,
                icon: '/favicon.ico',
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification('New Notification', {
                    body: newNotification.title,
                    icon: '/favicon.ico',
                  });
                }
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Notification channel status:', status);
      });

    // Cleanup
    return () => {
      console.log('Cleaning up notification channel');
      supabase.removeChannel(notificationChannel);
    };
  }, [userId, fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userId) return;
    
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: Github },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  ];

  const isDark = theme === 'dark';

  return (
    <motion.header
      className={`fixed top-3 left-20 right-4 z-40 h-12 rounded-xl flex items-center justify-between px-5 transition-all duration-300 ${
        scrolled 
          ? isDark 
            ? 'bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-lg' 
            : 'bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg' 
          : isDark
            ? 'bg-slate-900/30 backdrop-blur-md border border-slate-700/30'
            : 'bg-white/30 backdrop-blur-md border border-white/20'
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} size={16} />
          <input
            type="text"
            placeholder="Search courses, assignments, AI tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-lg py-2 pl-9 pr-4 focus:outline-none transition-all duration-300 text-sm ${
              isDark
                ? 'bg-slate-800/50 text-slate-200 placeholder-slate-500 border border-slate-700/30 focus:bg-slate-800/80 focus:ring-2 focus:ring-cyan-500/50'
                : 'bg-white/50 text-slate-700 placeholder-slate-400 border border-white/30 focus:bg-white/80 focus:ring-2 focus:ring-cyan-500/50'
            }`}
          />
        </div>
      </div>

      {/* Right Side - Social Links & Icons */}
      <div className="flex items-center gap-2">
        {/* Social Media Links with Hover Scale */}
        <div className="flex items-center gap-1 mr-3">
          {socialLinks.map((social) => (
            <motion.a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark 
                  ? 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:text-blue-400' 
                  : 'bg-white/40 backdrop-blur-sm text-slate-600 border border-white/30 hover:text-blue-600'
              }`}
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              title={social.name}
            >
              <social.icon size={14} />
            </motion.a>
          ))}
        </div>

        {/* Notification Bell with Real-time Updates */}
        <div className="relative">
          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center relative ${
              isDark 
                ? 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:text-blue-400' 
                : 'bg-white/40 backdrop-blur-sm text-slate-600 border border-white/30 hover:text-blue-600'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-xl shadow-xl z-50 ${
                isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between p-3 border-b ${
                isDark ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[var(--accent-blue)] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                  >
                    <X size={14} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-3 border-b cursor-pointer transition-colors ${
                        isDark 
                          ? 'border-slate-700 hover:bg-slate-800' 
                          : 'border-slate-100 hover:bg-slate-50'
                      } ${!notification.is_read ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.is_read ? 'bg-slate-300' : 'bg-[var(--accent-blue)]'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {notification.title}
                          </p>
                          {notification.content && (
                            <p className={`text-xs mt-1 ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              {notification.content}
                            </p>
                          )}
                          <p className={`text-xs mt-1 ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Messages */}
        <Link href="/dashboard/messages">
          <motion.button
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isDark 
                ? 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:text-blue-400' 
                : 'bg-white/40 backdrop-blur-sm text-slate-600 border border-white/30 hover:text-blue-600'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={16} />
          </motion.button>
        </Link>

        {/* User Avatar */}
        <motion.button
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <User size={16} />
        </motion.button>
      </div>
    </motion.header>
  );
}
