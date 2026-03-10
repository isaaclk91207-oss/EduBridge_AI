'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Bell, MessageCircle, User, Github, Linkedin, Twitter } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        {/* Notification Bell */}
        <motion.button
          className={`w-9 h-9 rounded-lg flex items-center justify-center relative ${
            isDark 
              ? 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:text-blue-400' 
              : 'bg-white/40 backdrop-blur-sm text-slate-600 border border-white/30 hover:text-blue-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
        </motion.button>

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

        {/* User Avatar - Links to Settings */}
        <Link href="/dashboard/settings">
          <motion.button
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={16} />
          </motion.button>
        </Link>
      </div>
    </motion.header>
  );
}
