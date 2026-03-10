'use client';

import { useTheme } from '@/components/ThemeContext';
import { motion } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AISupportChat from '@/components/dashboard/AISupportChat';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe]" />
    );
  }

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      initial={false}
      animate={{ 
        background: theme === 'light' 
          ? 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe, #dbeafe)'
          : 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Dynamic Background - Light Mode */}
      {theme === 'light' && (
        <>
          <div className="fixed inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] -z-10" />
          <div className="fixed top-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="fixed bottom-20 right-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="fixed top-1/2 right-1/3 w-64 h-64 bg-blue-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </>
      )}

      {/* Dynamic Background - Dark Mode */}
      {theme === 'dark' && (
        <>
          <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] -z-10" />
          <div className="fixed top-20 left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="fixed bottom-20 right-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="fixed top-1/2 right-1/3 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </>
      )}
      
      {/* Sidebar - Fixed on left */}
      <Sidebar />
      
      {/* Header - Fixed on top */}
      <Header />
      
      {/* Main Content - Adjusted padding for smaller sidebar (w-64 = 256px) */}
      <main className="pt-20 pl-20 pr-4 pb-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* AI Support Chat - Floating button in bottom-right */}
      <AISupportChat />
    </motion.div>
  );
}
