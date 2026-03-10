'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Loader2, 
  AlertCircle,
  X,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Target,
  ListChecks,
  Play,
  ChevronRight
} from 'lucide-react';

interface RoadmapStep {
  title: string;
  description: string;
  tasks?: string[];
  learningObjectives?: string[];
  resources?: { title: string; url: string; type: string }[];
  quiz?: { question: string; options: string[]; answer: number };
  color?: string;
}

export default function VisualAIRoadmap() {
  const [topic, setTopic] = useState('');
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const generateRoadmap = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setError('');
    setCompletedSteps(new Set());
    
    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      if (!data.roadmap || data.roadmap.length === 0) {
        throw new Error('No roadmap data received');
      }

      const mappedRoadmap = (data.roadmap || []).map((step: any, index: number) => ({
        title: step.title,
        description: step.description,
        tasks: step.tasks || [],
        learningObjectives: step.learningObjectives || generateLearningObjectives(step.title),
        resources: step.resources || generateResources(step.title, topic),
        quiz: step.quiz || generateQuiz(step.title),
        color: ['blue', 'cyan', 'teal', 'green', 'yellow', 'purple', 'orange', 'pink'][index] || 'blue'
      }));

      setRoadmap(mappedRoadmap);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap');
      setRoadmap([]);
    } finally {
      setLoading(false);
    }
  };

  const generateLearningObjectives = (title: string): string[] => {
    return [
      `Understand the fundamentals of ${title}`,
      `Learn key concepts and best practices`,
      `Build practical skills through exercises`,
      `Apply knowledge to real-world scenarios`
    ];
  };

  const generateResources = (title: string, topic: string): { title: string; url: string; type: string }[] => {
    return [
      { title: `${title} - Official Documentation`, url: `https://docs.example.com/${topic.toLowerCase().replace(/\s+/g, '-')}`, type: 'docs' },
      { title: `Interactive ${title} Tutorial`, url: `https://tutorials.example.com/${topic.toLowerCase().replace(/\s+/g, '-')}`, type: 'video' },
      { title: `${title} Best Practices Guide`, url: `https://guides.example.com/${topic.toLowerCase().replace(/\s+/g, '-')}`, type: 'article' }
    ];
  };

  const generateQuiz = (title: string) => {
    return {
      question: `What is the first step in learning ${title}?`,
      options: [
        'Understand the fundamentals',
        'Skip to advanced topics',
        'Start with a complex project',
        'Skip practice exercises'
      ],
      answer: 0
    };
  };

  const toggleComplete = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && topic.trim()) {
      generateRoadmap();
    }
  };

  const handleQuizSubmit = () => {
    if (quizAnswer === roadmap[selectedStep!]?.quiz?.answer) {
      alert('Correct! 🎉');
    } else {
      alert('Incorrect. Try again!');
    }
    setQuizAnswer(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Light Blue Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] -z-10" />
      
      {/* Floating blurred circles */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100/50 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-medium">AI-Powered Learning Paths</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Visual Roadmap Generator
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base">
            Enter any topic and get a personalized learning journey
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto mb-10"
        >
          <div className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter topic (e.g., Python, Machine Learning...)"
                className="flex-1 px-4 py-3 rounded-xl bg-white/60 border border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none text-slate-700 placeholder-slate-400 text-sm transition-all"
                disabled={loading}
              />
              <button
                onClick={generateRoadmap}
                disabled={loading || !topic.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/30 disabled:shadow-none flex items-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse" />
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-ping" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-700">Generating Roadmap...</h3>
                <p className="text-slate-500 text-sm">Creating your learning path</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !hasGenerated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-700">Your Roadmap Awaits</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Enter a topic above and click Generate to create your personalized learning journey
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Node-Based Flowchart with SVG Arrows */}
        {!loading && hasGenerated && roadmap.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative py-8"
          >
            {/* SVG Layer for Arrows */}
            <svg className="absolute inset-0 w-full pointer-events-none z-0" style={{ height: '100%', minHeight: '400px' }}>
              <defs>
                <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>
              
              {/* Arrow Lines */}
              {roadmap.map((_, index) => {
                if (index === roadmap.length - 1) return null;
                const topOffset = index * 140 + 80;
                return (
                  <motion.g key={`arrow-${index}`}>
                    <motion.line
                      x1="50%"
                      y1={topOffset}
                      x2="50%"
                      y2={topOffset + 80}
                      stroke="url(#arrowGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      markerEnd="url(#arrowhead)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ 
                        delay: 0.3 + index * 0.2, 
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.g>
                );
              })}
            </svg>

            {/* Nodes - Vertical Flow */}
            <div className="flex flex-col items-center space-y-16 relative z-10">
              {roadmap.map((step, index) => (
                <motion.div
                  key={index}
                  ref={(el) => { nodeRefs.current[index] = el; }}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.1 + index * 0.15,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  className="relative"
                >
                  {/* Node Button - Clickable */}
                  <motion.button
                    id={`step${index + 1}`}
                    onClick={() => {
                      setSelectedStep(index);
                      setShowQuiz(false);
                      setQuizAnswer(null);
                    }}
                    className={`
                      relative px-8 py-4 rounded-full 
                      bg-white/40 backdrop-blur-md 
                      border-2 border-blue-400/60
                      shadow-lg shadow-blue-500/20
                      transition-all duration-300
                      hover:border-cyan-400
                      hover:shadow-cyan-500/40
                      hover:shadow-xl
                      group
                      flex items-center gap-3
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      minWidth: '260px'
                    }}
                  >
                    {/* Completion Status */}
                    {completedSteps.has(index) && (
                      <div className="absolute -left-1 -top-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-20">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    {/* Node Number */}
                    <div className={`
                      w-8 h-8 rounded-full 
                      flex items-center justify-center text-sm font-bold
                      ${completedSteps.has(index) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'}
                      shadow-md
                    `}>
                      {completedSteps.has(index) ? '✓' : index + 1}
                    </div>
                    
                    {/* Step Title */}
                    <span className="text-sm md:text-base font-semibold text-slate-700 whitespace-nowrap">
                      {step.title}
                    </span>
                    
                    {/* Arrow Icon */}
                    <ChevronRight className="w-4 h-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3" />
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Regenerate Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex justify-center mt-12"
            >
              <button
                onClick={generateRoadmap}
                className="px-6 py-2 bg-white/40 backdrop-blur-sm border border-white/50 rounded-full text-slate-600 hover:text-blue-600 hover:bg-white/60 transition-all text-sm font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate New Roadmap
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Study Guide Side Panel (Drawer) */}
      <AnimatePresence>
        {selectedStep !== null && roadmap[selectedStep] && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setSelectedStep(null)}
            />
            
            {/* Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white/40 backdrop-blur-xl border-l border-white/50 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Panel Header */}
              <div className="sticky top-0 bg-white/30 backdrop-blur-xl border-b border-blue-100/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-800">Learning Path</h2>
                </div>
                <button
                  onClick={() => setSelectedStep(null)}
                  className="p-2 rounded-full hover:bg-white/50 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="p-6 space-y-5">
                {/* Step Title */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {roadmap[selectedStep].title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {roadmap[selectedStep].description}
                  </p>
                </div>

                {/* Learning Objectives */}
                <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-800">Learning Objectives</h4>
                  </div>
                  <ul className="space-y-2">
                    {(roadmap[selectedStep].learningObjectives || []).map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tasks */}
                <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-800">Tasks</h4>
                  </div>
                  <ul className="space-y-2">
                    {(roadmap[selectedStep].tasks || []).map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <div className="w-4 h-4 rounded-full border border-blue-300 mt-0.5 flex-shrink-0" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-800">Resources</h4>
                  </div>
                  <ul className="space-y-2">
                    {(roadmap[selectedStep].resources || []).map((resource, i) => (
                      <li key={i}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {resource.type === 'video' ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                          <span>{resource.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quiz Section */}
                <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Play className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-800">Quiz</h4>
                  </div>
                  
                  {!showQuiz ? (
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all"
                    >
                      Take Quiz
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-700 font-medium">
                        {roadmap[selectedStep].quiz?.question}
                      </p>
                      <div className="space-y-2">
                        {roadmap[selectedStep].quiz?.options.map((option, i) => (
                          <button
                            key={i}
                            onClick={() => setQuizAnswer(i)}
                            className={`
                              w-full p-2 rounded-lg text-sm text-left transition-all
                              ${quizAnswer === i 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white/50 text-slate-600 hover:bg-white/70'}
                            `}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleQuizSubmit}
                        disabled={quizAnswer === null}
                        className="w-full py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}
                </div>

                {/* Mark as Complete Button */}
                <button
                  onClick={() => toggleComplete(selectedStep)}
                  className={`
                    w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                    ${completedSteps.has(selectedStep)
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'}
                  `}
                >
                  {completedSteps.has(selectedStep) ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Completed!
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
