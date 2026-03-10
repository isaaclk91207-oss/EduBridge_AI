'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Briefcase, Users, Sparkles, MessageSquare, GraduationCap, ArrowRight } from 'lucide-react';

const features = [
  {
    title: "AI Career Roadmap",
    description: "Personalized learning paths powered by AI",
    href: "/dashboard/ai-roadmap",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-500"
  },
  {
    title: "AI Interview Practice",
    description: "Mock interviews with AI feedback",
    href: "/dashboard/ai-interview",
    icon: Users,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "AI Portfolio Builder",
    description: "Create stunning portfolios",
    href: "/dashboard/ai-portfolio",
    icon: Briefcase,
    color: "from-cyan-500 to-blue-500"
  },
  {
    title: "Knowledge Hub",
    description: "Resource sharing platform",
    href: "/dashboard/courses",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-8">
      {/* Hero Section with Glass Effect */}
      <motion.div
        className="max-w-7xl mx-auto text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-white/40 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-12">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Empower Your Future in Business & IT
          </motion.h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join our ecosystem for students. Access AI-powered tools, courses, and career guidance.
          </p>
          <Link href="/auth">
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-cyan-500/30"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {[
          { label: "Resources", value: "500+", icon: BookOpen },
          { label: "Active Students", value: "10,000+", icon: Users },
          { label: "Partner Institutions", value: "50+", icon: GraduationCap },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-cyan-500/20 transition-all"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <stat.icon className="w-8 h-8 mx-auto mb-3 text-cyan-500" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stat.value}</h2>
            <p className="text-slate-600">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Features Grid */}
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link key={feature.title} href={feature.href}>
              <motion.div
                className="bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 text-center h-full hover:shadow-2xl hover:shadow-cyan-500/20 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.description}</p>
                <div className="mt-4 flex items-center justify-center gap-1 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight size={14} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="max-w-7xl mx-auto w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl shadow-cyan-500/30">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Join thousands of students already using our AI-powered platform to advance their careers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <motion.button
                className="bg-white text-blue-600 font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up Free
              </motion.button>
            </Link>
            <Link href="/auth">
              <motion.button
                className="bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-xl border border-white/30 hover:bg-white/30 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="px-8 py-6 text-center text-slate-500">
        <p>&copy; 2026 eduBridge AI. Empowering Business & IT Students.</p>
      </footer>
    </div>
  );
}
