"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, User, Download, Brain, Award, CheckCircle } from "lucide-react";

export default function AIPortfolioPro() {
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowResults(true);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="text-[var(--accent-cyan)]" />
          AI Career Scanner
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">Advanced AI-powered career profile analyzer</p>
      </motion.div>

      {!isScanning && !showResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center py-20"
        >
          <button
            onClick={handleScan}
            className="px-10 py-5 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-xl font-bold text-xl hover:opacity-90 transition-all shadow-lg"
            style={{ boxShadow: '0 0 30px var(--accent-glow)' }}
          >
            Start Scan
          </button>
        </motion.div>
      )}

      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative w-full h-96 bg-[var(--bg-secondary)]/40 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            <motion.div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--accent-cyan)] to-transparent"
              animate={{ left: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ boxShadow: '0 0 30px var(--accent-cyan), 0 0 60px var(--accent-cyan)' }}
            />
            
            <div className="absolute bottom-8 left-8 right-8 h-40 bg-[var(--bg-secondary)]/50 backdrop-blur-md border border-[var(--border-color)] rounded-xl p-4">
              <div className="text-[var(--accent-cyan)] text-sm font-bold mb-3">System Logs</div>
              <div className="space-y-1 text-xs font-mono">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-green-500"
                >
                  {'>'} Initializing EduBridge Neural Engine...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                  className="text-green-500"
                >
                  {'>'} Connecting to Supabase database...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.5 }}
                  className="text-green-500"
                >
                  {'>'} Analyzing skill patterns with Gemini 2.0...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="text-[var(--accent-cyan)] mt-2"
                >
                  Processing...
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-[var(--bg-secondary)]/40 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xl">
            <div className="h-1 bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-blue)] to-[var(--accent-blue)]" />
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-8">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-blue)] flex items-center justify-center shadow-xl" style={{ boxShadow: '0 0 30px var(--accent-glow)' }}>
                    <User className="w-14 h-14 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-[var(--text-primary)]">Student</h2>
                    <p className="text-[var(--accent-cyan)] text-2xl mt-1">Full Stack Developer</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-[var(--text-secondary)]">AI-Verified Profile</span>
                    </div>
                  </div>
                </div>
                <button className="px-8 py-4 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-xl font-bold flex items-center gap-3 hover:opacity-90 transition-all shadow-lg" style={{ boxShadow: '0 0 20px var(--accent-glow)' }}>
                  <Download className="w-6 h-6" />
                  Download CV
                </button>
              </div>
              
              <div className="mb-10">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-3">
                  <Brain className="w-6 h-6 text-[var(--accent-cyan)]" />
                  Core Skills
                </h3>
                <div className="flex flex-wrap gap-4">
                  {["React", "Node.js", "TypeScript", "Python", "AWS", "PostgreSQL"].map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-5 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-full text-[var(--accent-blue)] shadow-md"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
              
              <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[var(--accent-cyan)]" />
                  Professional Summary
                </h3>
                <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                  Experienced full-stack developer with 4+ years of expertise in building scalable web applications. 
                  Proficient in React, Node.js, TypeScript, and cloud technologies. Passionate about clean code 
                  and delivering exceptional user experiences.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
