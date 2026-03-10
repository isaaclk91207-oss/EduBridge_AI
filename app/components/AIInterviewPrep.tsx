'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, MicOff, Send, CheckCircle, Award, ChevronRight, RotateCcw } from 'lucide-react';

// SpeechRecognition types for browser compatibility
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface Skill {
  name: string;
  level: string;
  source: 'ai' | 'manual';
}

interface Project {
  title: string;
  description: string;
  link: string;
}

interface InterviewQuestion {
  id: number;
  role: string;
  company: string;
  question: string;
  keywords: string[];
  sampleAnswer: string;
}

// Myanmar Market Interview Questions Data
const interviewQuestions: InterviewQuestion[] = [
  // Data Scientist Questions
  {
    id: 1,
    role: 'Data Scientist',
    company: 'KBZ Bank',
    question: 'How would you use data to improve customer retention for a digital wallet like KBZPay?',
    keywords: ['data analysis', 'customer behavior', 'churn prediction', 'machine learning', 'retention'],
    sampleAnswer: 'I would analyze transaction patterns, identify at-risk customers using churn prediction models, and recommend personalized offers.'
  },
  {
    id: 2,
    role: 'Data Scientist',
    company: 'MPT',
    question: 'Explain your experience with SQL and data cleaning for local datasets. How would you handle Myanmar language text data?',
    keywords: ['SQL', 'data cleaning', 'Myanmar text', 'Unicode', 'preprocessing'],
    sampleAnswer: 'I have experience with SQL queries for large datasets and would use proper Unicode encoding for Myanmar text.'
  },
  {
    id: 3,
    role: 'Data Scientist',
    company: 'Wave Money',
    question: 'How would you build a fraud detection system for mobile money transactions in Myanmar?',
    keywords: ['fraud detection', 'anomaly detection', 'real-time', 'machine learning', 'security'],
    sampleAnswer: 'I would use anomaly detection algorithms to identify suspicious transaction patterns in real-time.'
  },
  {
    id: 4,
    role: 'Data Scientist',
    company: 'NexLabs',
    question: 'Describe a data visualization project you have done. How would you present insights to non-technical stakeholders?',
    keywords: ['visualization', 'dashboard', 'insights', 'storytelling', 'Tableau', 'PowerBI'],
    sampleAnswer: 'I would create interactive dashboards and translate technical findings into business impact.'
  },
  {
    id: 5,
    role: 'Data Scientist',
    company: 'KBZ Bank',
    question: 'How would you approach building a credit scoring model for underserved customers in Myanmar?',
    keywords: ['credit scoring', 'alternative data', 'financial inclusion', 'model building', 'fairness'],
    sampleAnswer: 'I would use alternative data sources and ensure fairness in the model to promote financial inclusion.'
  },

  // Web Developer Questions
  {
    id: 6,
    role: 'Web Developer',
    company: 'MPT',
    question: 'How do you optimize web performance for users with limited internet speeds in rural areas of Myanmar?',
    keywords: ['performance', 'lazy loading', 'CDN', 'compression', 'offline', 'PWA'],
    sampleAnswer: 'I would implement lazy loading, code splitting, PWA for offline support, and use CDN for faster delivery.'
  },
  {
    id: 7,
    role: 'Web Developer',
    company: 'Ooredoo',
    question: 'Explain the differences between state management tools like Redux vs. Context API. When would you use each?',
    keywords: ['Redux', 'Context API', 'state management', 'React', 'performance'],
    sampleAnswer: 'Context API is great for simple state, while Redux is better for complex global state with middleware.'
  },
  {
    id: 8,
    role: 'Web Developer',
    company: 'NexLabs',
    question: 'How would you build a responsive web application that works well on low-end Android devices popular in Myanmar?',
    keywords: ['responsive', 'performance', 'mobile-first', 'lightweight', 'testing'],
    sampleAnswer: 'I would use mobile-first design, minimize bundle size, and test on real low-end devices.'
  },
  {
    id: 9,
    role: 'Web Developer',
    company: 'KBZ Bank',
    question: 'Describe your experience with frontend security. How do you protect against XSS and CSRF attacks?',
    keywords: ['security', 'XSS', 'CSRF', 'authentication', 'sanitization'],
    sampleAnswer: 'I would sanitize user input, use secure headers, and implement proper authentication tokens.'
  },
  {
    id: 10,
    role: 'Web Developer',
    company: 'Wave Money',
    question: 'How would you implement real-time features for a payment dashboard using modern web technologies?',
    keywords: ['WebSocket', 'real-time', 'React', 'Socket.io', 'optimistic updates'],
    sampleAnswer: 'I would use WebSocket for real-time updates with optimistic UI updates for better UX.'
  }
];

interface AIInterviewPrepProps {
  suggestedRole: string;
  skills: Skill[];
  projects: Project[];
  careerColor: string;
  onComplete: (completed: number) => void;
}

export default function AIInterviewPrep({ suggestedRole, skills, projects, careerColor, onComplete }: AIInterviewPrepProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [isMarketReady, setIsMarketReady] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Filter questions based on suggested role
  const filteredQuestions = interviewQuestions.filter(q => 
    q.role.toLowerCase() === suggestedRole.toLowerCase() || 
    q.role.toLowerCase() === 'data scientist' && suggestedRole.toLowerCase() === 'web developer' ||
    q.role.toLowerCase() === 'web developer' && suggestedRole.toLowerCase() === 'data scientist'
  );

  // If no role match, show all questions
  const displayQuestions = filteredQuestions.length > 0 ? filteredQuestions : interviewQuestions;
  const currentQuestion = displayQuestions[currentQuestionIndex % displayQuestions.length];

  // Generate AI feedback based on user answer and skills
  const generateFeedback = () => {
    const answerLower = userAnswer.toLowerCase();
    const skillNames = skills.map(s => s.name.toLowerCase());
    const relevantSkills = skillNames.filter(skill => 
      currentQuestion.keywords.some(keyword => skill.includes(keyword) || keyword.includes(skill))
    );
    
    let feedback = '';
    let score = 0;

    // Check for keywords in answer
    const matchedKeywords = currentQuestion.keywords.filter(keyword => 
      answerLower.includes(keyword.toLowerCase())
    );
    
    score = Math.min(100, matchedKeywords.length * 20 + 20);

    // Generate feedback based on skills
    if (relevantSkills.length > 0) {
      feedback += `Great! I noticed you mentioned skills in ${relevantSkills.join(', ')}. `;
      
      // Check if user has Expert/Advanced level in relevant skills
      const expertSkills = skills.filter(s => 
        relevantSkills.some(r => s.name.toLowerCase().includes(r)) && 
        (s.level === 'Expert' || s.level === 'Advanced')
      );
      
      if (expertSkills.length > 0) {
        feedback += `Since you have verified "${expertSkills[0].level}" level in ${expertSkills[0].name}, make sure to highlight your ${expertSkills[0].name} projects to impress local HRs! `;
        score += 10;
      }
    }

    // Add sample answer hint
    if (matchedKeywords.length < 3) {
      feedback += `Consider mentioning more about ${currentQuestion.keywords.slice(0, 2).join(' and ')} in your answer.`;
    } else {
      feedback += 'Your answer covers many important aspects! Keep practicing to refine your delivery.';
    }

    return { feedback, score };
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;
    
    setShowFeedback(true);
    
    // Mark question as completed
    if (!completedQuestions.includes(currentQuestion.id)) {
      const newCompleted = [...completedQuestions, currentQuestion.id];
      setCompletedQuestions(newCompleted);
      
      // Check if user is market ready (5 questions completed)
      if (newCompleted.length >= 5) {
        setIsMarketReady(true);
        onComplete(newCompleted.length);
      }
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => (prev + 1) % displayQuestions.length);
    setUserAnswer('');
    setShowFeedback(false);
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setShowFeedback(false);
    setCompletedQuestions([]);
    setIsMarketReady(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Check if SpeechRecognition is available - use type assertion for browser API
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass() as SpeechRecognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setUserAnswer(prev => prev + ' ' + transcript);
        };
        
        recognition.onerror = () => {
          setIsRecording(false);
        };
        
        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      } else {
        alert('Speech recognition is not supported in your browser.');
      }
    }
  };

  const { feedback, score } = showFeedback ? generateFeedback() : { feedback: '', score: 0 };

  return (
    <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="text-[#0070f3]" size={28} />
          <div>
            <h2 className="text-xl font-bold">AI Mock Interview</h2>
            <p className="text-gray-400 text-sm">Practice for Myanmar market jobs</p>
          </div>
        </div>
        
        {/* Progress Badge */}
        <div className="flex items-center space-x-2">
          <div className="bg-[#0f172a] rounded-lg px-3 py-1 flex items-center space-x-2">
            <CheckCircle size={16} className={isMarketReady ? 'text-green-400' : 'text-gray-400'} />
            <span className="text-sm font-medium">
              {completedQuestions.length}/5 Completed
            </span>
          </div>
          
          {isMarketReady && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full flex items-center space-x-1"
            >
              <Award size={14} />
              <span className="text-sm font-bold">Market Ready</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#0f172a] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span 
            className="text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: `${careerColor}20`, color: careerColor }}
          >
            {currentQuestion.company}
          </span>
          <span className="text-gray-400 text-sm">{currentQuestion.role}</span>
        </div>
        <p className="text-lg font-medium">{currentQuestion.question}</p>
      </div>

      {/* Answer Input */}
      <AnimatePresence mode="wait">
        {!showFeedback ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here... (or use microphone)"
              className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0070f3] mb-4"
              rows={4}
            />
            
            <div className="flex items-center justify-between">
              <button
                onClick={toggleRecording}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-red-500/20 text-red-400 animate-pulse' 
                    : 'bg-[#1e293b] text-gray-300 hover:bg-[#2d3a4f]'
                }`}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
              </button>
              
              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-[#0070f3] hover:bg-[#0056b3] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send size={18} />
                <span>Submit Answer</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Score */}
            <div className="flex items-center justify-between bg-[#0f172a] rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ 
                    backgroundColor: score >= 70 ? '#10b981/20' : score >= 50 ? '#f59e0b/20' : '#ef4444/20',
                    color: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
                  }}
                >
                  {score}%
                </div>
                <div>
                  <p className="font-medium">
                    {score >= 70 ? 'Excellent!' : score >= 50 ? 'Good Try!' : 'Keep Practicing!'}
                  </p>
                  <p className="text-gray-400 text-sm">AI Score</p>
                </div>
              </div>
              
              {score >= 70 && (
                <CheckCircle className="text-green-400" size={24} />
              )}
            </div>

            {/* Feedback */}
            <div className="bg-[#0f172a] rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <MessageSquare size={16} className="text-[#0070f3]" />
                <span>AI Feedback</span>
              </h4>
              <p className="text-gray-300">{feedback}</p>
            </div>

            {/* Sample Answer */}
            <div className="bg-[#0f172a]/50 rounded-lg p-4 border border-white/5">
              <h4 className="text-sm text-gray-400 mb-1">Sample Answer Hint:</h4>
              <p className="text-gray-300 text-sm">{currentQuestion.sampleAnswer}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw size={16} />
                <span>Start Over</span>
              </button>
              
              <button
                onClick={handleNextQuestion}
                className="flex items-center space-x-2 px-6 py-2 bg-[#0070f3] hover:bg-[#0056b3] text-white rounded-lg transition-colors"
              >
                <span>Next Question</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Navigation */}
      {!showFeedback && displayQuestions.length > 1 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {displayQuestions.length}
            </span>
            <div className="flex space-x-1">
              {displayQuestions.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentQuestionIndex 
                      ? 'bg-[#0070f3]' 
                      : completedQuestions.includes(displayQuestions[idx].id)
                        ? 'bg-green-400'
                        : 'bg-gray-600'
                  }`}
                />
              ))}
              {displayQuestions.length > 5 && (
                <span className="text-gray-500 text-xs">...</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
