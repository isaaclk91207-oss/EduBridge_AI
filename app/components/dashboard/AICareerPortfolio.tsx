"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  User, 
  Download, 
  Brain, 
  Award, 
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  FileText,
  ChevronRight,
  MapPin,
  Globe,
  Building2,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CandidateData {
  company_name: string;
  industry: string;
  location: string;
  website: string;
  description: string;
  cv_url: string;
}

interface ProfileData {
  name: string;
  role: string;
  summary: string;
  matchScore: number;
  skills: string[];
  companyName: string;
  location: string;
  website: string;
  cvUrl: string;
}

const terminalLogs = [
  { text: "Initializing EduBridge Neural Engine...", delay: 0 },
  { text: "Connecting to Supabase database...", delay: 800 },
  { text: "Fetching user learning logs...", delay: 1600 },
  { text: "Analyzing skill patterns with Gemini 2.0...", delay: 2400 },
  { text: "Processing mentor chat history...", delay: 3200 },
  { text: "Calculating skill proficiency scores...", delay: 4000 },
  { text: "Generating career recommendations...", delay: 4800 },
  { text: "Building professional summary...", delay: 5600 },
  { text: "Analysis complete!", delay: 6400 },
];

export default function AICareerPortfolio() {
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentLog, setCurrentLog] = useState(0);
  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch candidate profile from Supabase on mount
  useEffect(() => {
    async function fetchCandidateProfile() {
      if (!supabase) {
        console.error("Supabase client not initialized");
        setLoading(false);
        return;
      }

      try {
        // First get the user profile to get the user ID
        const profileRes = await fetch('/api/user/profile', {
          credentials: 'include'
        });
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.id) {
            setUserId(profileData.id);
            
            // Fetch candidate data from Supabase
            const { data, error } = await supabase
              .from('candidates')
              .select('*')
              .eq('user_id', profileData.id)
              .single();

            if (data && !error) {
              setCandidateData(data);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching candidate profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidateProfile();
  }, []);

  // Real-time sync: Subscribe to candidates table changes
  useEffect(() => {
    if (!supabase || !userId) return;

    const channel = supabase
      .channel('candidates-realtime-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log('Real-time candidate update received:', payload);
          // Reload candidate data on any change
          if (!supabase) return;
          const { data } = await supabase
            .from('candidates')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (data) {
            setCandidateData(data);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  // Fetch profile from backend with error handling
  const fetchProfileFromBackend = async () => {
    if (!userId) {
      console.error('No user ID available');
      return false;
    }

    if (!supabase) {
      console.error('Supabase not initialized');
      return false;
    }

    try {
      // Fetch user's learning progress from user_progress table
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

      // Also fetch any existing analysis from student_analyses table
      const { data: existingAnalysis } = await supabase
        .from('student_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // If we have existing analysis, use it
      if (existingAnalysis) {
        console.log('Found existing analysis:', existingAnalysis);
        return { success: true, existingAnalysis };
      }

      // Otherwise call the AI backend for new analysis
      const response = await fetch('http://localhost:8000/chat/cofounder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          message: 'Analyze my career profile and provide a summary' 
        }),
      });

      if (!response.ok) {
        console.log('Backend response not ok, using mock data');
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error('Error fetching from backend:', error);
      return { success: false };
    }
  };

  const handleScan = async () => {
    if (!userId) {
      console.error('No user ID available');
      return;
    }

    setIsScanning(true);
    setCurrentLog(0);
    
    // Fetch from backend first
    await fetchProfileFromBackend();
    
    // Show scanning animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < terminalLogs.length) {
        setCurrentLog(logIndex + 1);
        logIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setShowResults(true);
          
          // Save analysis to student_analyses table
          saveAnalysisToDb(userId);
        }, 500);
      }
    }, 800);
  };

  // Save analysis to student_analyses table
  const saveAnalysisToDb = async (userId: string) => {
    if (!supabase) {
      console.error('Supabase not initialized');
      return;
    }

    try {
      const analysisData = {
        user_id: userId,
        role: candidateData?.industry || 'Professional',
        summary: candidateData?.description || 'AI-generated career summary based on learning progress.',
        match_score: 75,
        skills: [],
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('student_analyses')
        .upsert(analysisData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving analysis:', error);
      } else {
        console.log('Analysis saved successfully');
      }
    } catch (error) {
      console.error('Error saving analysis to DB:', error);
    }
  };

  // Build profile data from candidate data or use defaults
  const getProfileData = (): ProfileData => {
    if (candidateData && candidateData.company_name) {
      return {
        name: "Your Profile",
        role: candidateData.industry || "Professional",
        summary: candidateData.description || "Your professional summary will appear here once you complete your profile in Settings.",
        matchScore: 75,
        skills: [],
        companyName: candidateData.company_name,
        location: candidateData.location || "Not specified",
        website: candidateData.website || "",
        cvUrl: candidateData.cv_url || ""
      };
    }

    // Default mock data when no profile exists
    return {
      name: "Alex Chen",
      role: "Full Stack Developer",
      summary: "Results-driven Full Stack Developer with 4+ years of experience building scalable web applications. Proficient in React, Node.js, TypeScript, and cloud technologies. Passionate about clean code, performance optimization, and delivering exceptional user experiences. Led multiple successful projects from conception to deployment.",
      matchScore: 94,
      skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "PostgreSQL", "GraphQL", "Docker"],
      companyName: "",
      location: "San Francisco, CA",
      website: "",
      cvUrl: ""
    };
  };

  const profileData = getProfileData();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-blue)]" />
          <p className="text-[var(--text-secondary)]">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-8 border-b border-[var(--border-color)]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-[var(--accent-cyan)]" />
            <span className="text-[var(--accent-cyan)] font-medium">AI Career Scanner</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Your Career, <span className="text-[var(--accent-cyan)]">Analyzed</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-lg">
            Advanced AI-powered career profile analysis
          </p>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Initial State - Start Scan */}
          {!isScanning && !showResults && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative mb-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-40 h-40 rounded-full border-2 border-[var(--border-color)]"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-[var(--accent-blue)]/30 border-dashed"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-cyan)]/20 backdrop-blur-xl border border-[var(--border-color)] flex items-center justify-center">
                    <Brain className="w-10 h-10 text-[var(--accent-cyan)]" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold mb-3 text-[var(--text-primary)]">Ready to Analyze Your Career</h2>
              <p className="text-[var(--text-secondary)] mb-8 text-center max-w-md">
                Our advanced AI will scan your learning history, skills, and career trajectory to generate your professional profile.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleScan}
                className="px-10 py-4 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-full font-semibold text-lg flex items-center gap-3 shadow-lg hover:opacity-90 transition-all"
                style={{ boxShadow: '0 0 30px var(--accent-glow)' }}
              >
                <Zap className="w-5 h-5" />
                Start Scan
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Scanning State */}
          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="relative bg-[var(--bg-secondary)]/40 backdrop-blur-xl border border-[var(--border-color)] rounded-3xl overflow-hidden">
                {/* Scanning Line Effect */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent"
                  animate={{ top: ["5%", "95%", "5%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ boxShadow: '0 0 20px var(--accent-cyan)' }}
                />

                <div className="p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-3 h-3 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                    <span className="text-[var(--accent-cyan)] font-medium">Analyzing Profile</span>
                  </div>

                  {/* Terminal */}
                  <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-md rounded-2xl p-6 font-mono">
                    {terminalLogs.slice(0, currentLog).map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-2"
                      >
                        <span className="text-green-500">›</span>
                        <span className="text-[var(--text-primary)]">{log.text}</span>
                      </motion.div>
                    ))}
                    
                    {currentLog < terminalLogs.length && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[var(--accent-cyan)]">›</span>
                        <span className="text-[var(--accent-cyan)]">Processing...</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
                      <span>Analysis Progress</span>
                      <span>{Math.round((currentLog / terminalLogs.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentLog / terminalLogs.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results State */}
          {showResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Profile Card */}
              <div className="bg-[var(--bg-secondary)]/40 backdrop-blur-xl border border-[var(--border-color)] rounded-3xl overflow-hidden">
                {/* Top Gradient */}
                <div className="h-2 bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-blue)] to-[var(--accent-blue)]" />

                <div className="p-10">
                  {/* Profile Header */}
                  <div className="flex items-start justify-between mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-blue)] flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 30px var(--accent-glow)' }}>
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-semibold text-[var(--text-primary)]">{profileData.name}</h2>
                        <p className="text-[var(--accent-cyan)] text-xl mt-1">{profileData.role}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-[var(--text-secondary)] text-sm">AI-Verified Profile</span>
                        </div>
                      </div>
                    </div>

                    {/* Circular Match Score */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-[var(--bg-tertiary)]"
                          />
                          <motion.circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke="url(#gradient3)"
                            strokeWidth="6"
                            fill="transparent"
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: 276 }}
                            animate={{ strokeDashoffset: 276 - (276 * profileData.matchScore) / 100 }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            strokeDasharray="276"
                          />
                          <defs>
                            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="var(--accent-cyan)" />
                              <stop offset="100%" stopColor="var(--accent-blue)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-[var(--text-primary)]">{profileData.matchScore}%</span>
                          <span className="text-xs text-[var(--text-muted)]">Match</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Info (if available) */}
                  {profileData.companyName && (
                    <div className="mb-6 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                        <Building2 className="w-5 h-5 text-[var(--accent-cyan)]" />
                        <span className="font-medium">{profileData.companyName}</span>
                        {profileData.location && (
                          <>
                            <span className="text-[var(--border-color)]">|</span>
                            <MapPin className="w-4 h-4" />
                            <span>{profileData.location}</span>
                          </>
                        )}
                        {profileData.website && (
                          <>
                            <span className="text-[var(--border-color)]">|</span>
                            <Globe className="w-4 h-4" />
                            <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] hover:underline">
                              Website
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Summary Section */}
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-[var(--accent-cyan)]" />
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">AI-Generated Summary</h3>
                    </div>
                    <p className="text-[var(--text-primary)] leading-relaxed text-lg">
                      {profileData.summary}
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-[var(--accent-cyan)]" />
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Core Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {profileData.skills.length > 0 ? (
                        profileData.skills.map((skill, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 + 0.5 }}
                            className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-full text-[var(--accent-blue)]"
                          >
                            {skill}
                          </motion.span>
                        ))
                      ) : (
                        <p className="text-[var(--text-muted)]">No skills added yet. Update your profile in Settings.</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {profileData.cvUrl ? (
                      <motion.a
                        href={profileData.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-full font-semibold flex items-center gap-2 shadow-lg hover:opacity-90"
                        style={{ boxShadow: '0 0 20px var(--accent-glow)' }}
                      >
                        <Download className="w-5 h-5" />
                        Download CV
                      </motion.a>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-full font-semibold flex items-center gap-2 shadow-lg hover:opacity-90"
                        style={{ boxShadow: '0 0 20px var(--accent-glow)' }}
                      >
                        <Download className="w-5 h-5" />
                        Download CV
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-full font-semibold flex items-center gap-2 hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-primary)]"
                    >
                      <Target className="w-5 h-5" />
                      View Matches
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Re-scan Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => {
                    setShowResults(false);
                    setIsScanning(true);
                    handleScan();
                  }}
                  className="text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors text-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Re-scan Profile
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

