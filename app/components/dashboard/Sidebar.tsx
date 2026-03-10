'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Briefcase,
  Sparkles,
  Settings,
  Moon,
  Sun,
  ClipboardList,
  FlaskConical
} from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
  { name: 'Assignments', href: '/dashboard/assignments', icon: ClipboardList },
  { name: 'Practice Lab', href: '/dashboard/practice', icon: FlaskConical },
  { name: 'Employees', href: '/dashboard/employer', icon: Users },
  { name: 'Visual AI Roadmap', href: '/dashboard/visual-roadmap', icon: Sparkles, isAI: true },
  { name: 'AI Interview', href: '/dashboard/ai-interview', icon: Sparkles, isAI: true },
  { name: 'AI Portfolio', href: '/dashboard/ai-portfolio', icon: Briefcase, isAI: true },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isDark = theme === 'dark';

  return (
    <motion.div
      className="fixed left-2 top-4 z-50"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`flex flex-col rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900/90 border border-cyan-500/30' : 'bg-white/40 backdrop-blur-xl border border-white/40'}`}
        initial={{ width: 64 }}
        animate={{ width: 64 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo - Compact E Icon */}
        <div className={`h-14 flex items-center justify-center border-b ${isDark ? 'border-cyan-500/20' : 'border-white/30'}`}>
          <Link href="/">
            <motion.div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30" whileHover={{ scale: 1.1, rotate: 5 }}>
              <span className="text-white font-bold text-base">E</span>
            </motion.div>
          </Link>
        </div>

        {/* Theme Toggle - Small */}
        <div className={`py-2 flex justify-center border-b ${isDark ? 'border-cyan-500/20' : 'border-white/30'}`}>
          <motion.button 
            onClick={toggleTheme} 
            className={`p-2 rounded-lg transition-all ${isDark ? 'bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30' : 'bg-blue-50/50 hover:bg-blue-100/50 border border-blue-200/30'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-slate-600" />}
          </motion.button>
        </div>

        {/* Navigation Links - Compact with scrolling */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 relative" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {/* Vertical Flow Line (dashed) - Roadmap Path */}
          <div className="absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2">
            <motion.div 
              className={`w-full h-full ${isDark ? 'bg-cyan-500/40' : 'bg-blue-300/50'}`}
              style={{ 
                backgroundImage: isDark 
                  ? 'linear-gradient(to bottom, transparent 50%, rgba(6,182,212,0.4) 50%)'
                  : 'linear-gradient(to bottom, transparent 50%, rgba(59,130,246,0.3) 50%)',
                backgroundSize: '100% 8px'
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>

          <ul className="space-y-1 px-2 relative z-10">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              const isHovered = hoveredItem === item.name;

              return (
                <li key={item.name} className="relative">
                  <Link href={item.href}>
                    <motion.div
                      className="flex items-center justify-center py-2 rounded-lg transition-all cursor-pointer relative"
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Active Glow Background */}
                      {isActive && (
                        <motion.div 
                          className={`absolute inset-0 rounded-xl ${isDark ? 'bg-cyan-500/20' : 'bg-blue-100/50'}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      
                      {/* Icon Container - Glowing Node */}
                      <motion.div 
                        className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all
                          ${isActive 
                            ? isDark 
                              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]' 
                              : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                            : isDark 
                              ? 'bg-slate-800/80 hover:bg-slate-700/80' 
                              : 'bg-white/60 hover:bg-white/80'
                          }`}
                        animate={isActive ? { 
                          boxShadow: isDark ? '0 0 15px rgba(6,182,212,0.6)' : '0 4px 12px rgba(59,130,246,0.3)'
                        } : {}}
                      >
                        <Icon 
                          size={20} 
                          className={`
                            ${isActive 
                              ? 'text-white' 
                              : isDark 
                                ? item.isAI ? 'text-cyan-400' : 'text-slate-400'
                                : item.isAI ? 'text-cyan-600' : 'text-slate-500'
                            }
                          `} 
                        />
                        
                        {/* Neon ring for active in dark mode */}
                        {isActive && isDark && (
                          <motion.div 
                            className="absolute inset-0 rounded-xl border border-cyan-400/50"
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>

                      {/* Tooltip on Hover */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className={`
                              absolute left-full ml-3 px-3 py-2 rounded-lg whitespace-nowrap z-50
                              ${isDark 
                                ? 'bg-slate-800 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                                : 'bg-white border border-blue-200 text-blue-600 shadow-lg'
                              }
                            `}
                            style={{ pointerEvents: 'none' }}
                          >
                            <span className="font-medium text-sm">{item.name}</span>
                            {/* Tooltip arrow */}
                            <div className={`absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45 ${isDark ? 'bg-slate-800 border-l border-b border-cyan-500/30' : 'bg-white border-l border-b border-blue-200'}`} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Active Indicator Dot on the flow line */}
                      {isActive && (
                        <motion.div 
                          className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${isDark ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-blue-500'}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          style={{ top: '50%', marginTop: '-4px' }}
                        />
                      )}
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </motion.div>
    </motion.div>
  );
}
