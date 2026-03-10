'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Star, TrendingUp, Award, Target, Zap, X } from 'lucide-react';
import { useCareerIntelligence } from '@/lib/useCareerIntelligence';
import RecommendedJobs from '@/components/RecommendedJobs';

interface Skill {
  name: string;
  level: number;
  category: string;
}

interface Assignment {
  id: string;
  title: string;
  status: 'Pending' | 'Graded';
}

export default function Career() {
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Skills state - synced with portfolio page
  const [skills] = useState<Skill[]>([
    { name: 'Python Programming', level: 85, category: 'Technical' },
    { name: 'Data Analysis', level: 70, category: 'Technical' },
    { name: 'Digital Marketing', level: 60, category: 'Business' },
    { name: 'Project Management', level: 75, category: 'Business' },
    { name: 'Web Development', level: 50, category: 'Technical' },
    { name: 'Business Strategy', level: 65, category: 'Business' }
  ]);

  // Assignments state - synced with portfolio page
  const [assignments] = useState<Assignment[]>([
    { id: '1', title: 'Business Analytics Case Study', status: 'Graded' },
    { id: '2', title: 'Database Design Project', status: 'Graded' },
    { id: '3', title: 'Marketing Strategy Presentation', status: 'Pending' },
    { id: '4', title: 'Web Development Portfolio', status: 'Pending' }
  ]);

  // Use shared career intelligence - convert skill levels to string categories
  const { suggestedRole, careerColor, recommendedJobs, localReadinessInsight } = useCareerIntelligence(
    skills.map(s => ({ 
      name: s.name, 
      level: s.level >= 85 ? 'Expert' : s.level >= 70 ? 'Advanced' : s.level >= 50 ? 'Intermediate' : 'Beginner', 
      source: 'manual' as const 
    })),
    assignments
  );

  const milestones = [
    { title: 'Complete Python Certification', status: 'completed', points: 500 },
    { title: 'Build Portfolio Website', status: 'in-progress', points: 300 },
    { title: 'Internship at Tech Company', status: 'pending', points: 1000 },
    { title: 'Lead Team Project', status: 'pending', points: 750 }
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Dynamic Banner with suggestedRole and careerColor */}
        <div 
          className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm rounded-xl p-6 mb-6"
        >
          <div className="flex items-center space-x-3 mb-2">
            <Target className="text-blue-600" size={24} />
            <h1 className="text-3xl font-bold text-slate-800">Personalized AI Career Roadmap</h1>
          </div>
          <p className="text-slate-600 mb-2">Generate your custom learning path using our AI-powered engine.</p>
          <p className="text-slate-600">
            Based on your profile, AI suggests you are on the path to becoming a <span style={{ color: careerColor, fontWeight: 'bold' }}>{suggestedRole}</span>! 
            Continue building your skills to unlock more career opportunities.
          </p>
          <p className="text-slate-600 mt-2">
            {localReadinessInsight}
          </p>
        </div>
      </motion.div>

      {/* AI Tools Quick Access */}
      <motion.div
        className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div
          className="bg-white border border-blue-100 shadow-sm rounded-xl p-6 text-center"
          whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)' }}
          transition={{ duration: 0.3 }}
        >
          <Zap className="mx-auto mb-4" style={{ color: careerColor }} size={32} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">AI Career Roadmap</h3>
          <p className="text-slate-500 mb-4">Generate your personalized learning path</p>
          <Link href="/dashboard/ai-roadmap">
            <motion.button
              className="w-full text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ backgroundColor: careerColor }}
            >
              Generate My Roadmap 🚀
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          className="bg-white border border-blue-100 shadow-sm rounded-xl p-6 text-center"
          whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)' }}
          transition={{ duration: 0.3 }}
        >
          <Star className="mx-auto mb-4" style={{ color: careerColor }} size={32} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">AI Portfolio Builder</h3>
          <p className="text-slate-500 mb-4">Create stunning portfolios with AI</p>
          <Link href="/dashboard/ai-portfolio">
            <motion.button
              className="w-full text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ backgroundColor: careerColor }}
            >
              Build My Portfolio ✨
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skill Tree */}
        <motion.div
          className="bg-white border border-blue-100 shadow-sm rounded-xl p-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <Target className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-slate-700">Skill Development</h2>
          </div>

          <div className="space-y-4">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                className="bg-blue-50 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-700">{skill.name}</span>
                  <span className="text-sm font-medium" style={{ color: careerColor }}>{skill.level}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: careerColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  />
                </div>
                <span className="text-xs text-slate-500 mt-1 block">{skill.category}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Career Milestones */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Milestones */}
          <motion.div
            className="bg-white border border-blue-100 shadow-sm rounded-xl p-6"
            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Award className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-slate-700">Career Milestones</h2>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.title}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      milestone.status === 'completed' ? 'bg-green-500' :
                      milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-300'
                    }`} style={{ backgroundColor: milestone.status === 'in-progress' ? careerColor : undefined }} />
                    <span className={milestone.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}>
                      {milestone.title}
                    </span>
                  </div>
                  <span style={{ color: careerColor }} className="font-semibold">+{milestone.points} pts</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Portfolio Generator */}
          <motion.div
            className="bg-white border border-blue-100 shadow-sm rounded-xl p-6"
            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-slate-700">AI Portfolio Builder</h2>
            </div>

            <p className="text-slate-500 mb-4">
              Generate a professional portfolio showcasing your skills and projects using AI assistance.
            </p>

            <Link href="/dashboard/ai-portfolio">
              <motion.button
                className="w-full text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ backgroundColor: careerColor }}
              >
                <Star size={20} />
                <span>Generate AI Portfolio</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Recommended Jobs Section */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <RecommendedJobs jobs={recommendedJobs} careerColor={careerColor} />
      </motion.div>
    </div>
  );
}
