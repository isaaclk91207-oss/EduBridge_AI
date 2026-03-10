'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Play, Clock, Users, Star, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Module {
  id: number;
  title: string;
  completed: boolean;
  duration: string;
  videoId: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

// Dynamic Quiz: Object with different questions for each module ID (1 to 6)
const moduleQuizzes: { [key: number]: QuizQuestion[] } = {
  1: [
    {
      question: 'What is Python?',
      options: ['A snake', 'A high-level programming language', 'A database', 'An operating system'],
      correctAnswer: 1
    },
    {
      question: 'What is the file extension for Python files?',
      options: ['.py', '.python', '.pyt', '.pyw'],
      correctAnswer: 0
    },
    {
      question: 'How do you print "Hello" in Python?',
      options: ['echo "Hello"', 'print("Hello")', 'console.log("Hello")', 'printf("Hello")'],
      correctAnswer: 1
    }
  ],
  2: [
    {
      question: 'What is a variable in Python?',
      options: ['A container for storing data', 'A function', 'A loop', 'A comment'],
      correctAnswer: 0
    },
    {
      question: 'Which is NOT a valid data type in Python?',
      options: ['int', 'float', 'char', 'str'],
      correctAnswer: 2
    },
    {
      question: 'How do you create an integer variable?',
      options: ['x = 10', 'int x = 10', 'var x = 10', 'let x = 10'],
      correctAnswer: 0
    }
  ],
  3: [
    {
      question: 'Which is a conditional statement in Python?',
      options: ['for loop', 'if-else', 'while loop', 'function'],
      correctAnswer: 1
    },
    {
      question: 'What does the "if" statement do?',
      options: ['Repeats code', 'Executes code based on a condition', 'Defines a function', 'Imports a module'],
      correctAnswer: 1
    },
    {
      question: 'How do you write a for loop in Python?',
      options: ['for (i=0; i<10; i++)', 'for i in range(10):', 'loop i to 10', 'for i = 0 to 10'],
      correctAnswer: 1
    }
  ],
  4: [
    {
      question: 'What is a function in Python?',
      options: ['A block of code that performs a specific task', 'A type of variable', 'A loop', 'A condition'],
      correctAnswer: 0
    },
    {
      question: 'How do you define a function in Python?',
      options: ['function myFunc()', 'def myFunc():', 'void myFunc()', 'func myFunc()'],
      correctAnswer: 1
    },
    {
      question: 'What is a module in Python?',
      options: ['A single line of code', 'A file containing Python definitions', 'A type of loop', 'A data type'],
      correctAnswer: 1
    }
  ],
  5: [
    {
      question: 'What is Pandas used for in Python?',
      options: ['Web development', 'Data analysis and manipulation', 'Game development', 'Network programming'],
      correctAnswer: 1
    },
    {
      question: 'How do you create a DataFrame in Pandas?',
      options: ['new DataFrame()', 'pd.DataFrame()', 'DataFrame.create()', 'create DataFrame()'],
      correctAnswer: 1
    },
    {
      question: 'What is a Series in Pandas?',
      options: ['A 2D data structure', 'A 1D labeled array', 'A database', 'A visualization'],
      correctAnswer: 1
    }
  ],
  6: [
    {
      question: 'What is the final step in a business case study?',
      options: ['Collect data', 'Analyze results', 'Present recommendations', 'Define the problem'],
      correctAnswer: 2
    },
    {
      question: 'What is financial modeling?',
      options: ['Drawing charts', 'Creating mathematical representations of financial situations', 'Writing reports', 'Sending emails'],
      correctAnswer: 1
    },
    {
      question: 'What is automation in business?',
      options: ['Manual processes', 'Using technology to perform repetitive tasks', 'Hiring employees', 'Meeting with clients'],
      correctAnswer: 1
    }
  ]
};

export default function CourseDetail() {
  const params = useParams();
  const courseId = params.courseId as string;

  // Course data based on courseId
  const getCourseData = (id: string) => {
    const courses = {
      'python-business': {
        title: 'Python for Business',
        description: 'Master Python programming for business applications including data analysis, automation, and financial modeling.',
        instructor: 'Dr. Sarah Johnson',
        duration: '8 weeks',
        students: 1247,
        rating: 4.8,
        videoId: 'rfscVS0vtbw',
        modules: [
          { id: 1, title: 'Introduction to Python', completed: false, duration: '45 min', videoId: 'rfscVS0vtbw' },
          { id: 2, title: 'Variables and Data Types', completed: false, duration: '60 min', videoId: 'rfscVS0vtbw' },
          { id: 3, title: 'Control Structures', completed: false, duration: '75 min', videoId: 'rfscVS0vtbw' },
          { id: 4, title: 'Functions and Modules', completed: false, duration: '90 min', videoId: 'rfscVS0vtbw' },
          { id: 5, title: 'Data Analysis with Pandas', completed: false, duration: '120 min', videoId: 'ua-CiDNNj30' },
          { id: 6, title: 'Business Case Study', completed: false, duration: '150 min', videoId: 'rY40VBC4Xos' }
        ] as Module[]
      },
      'digital-marketing': {
        title: 'Digital Marketing Fundamentals',
        description: 'Learn the core principles of digital marketing including SEO, social media, content marketing, and analytics.',
        instructor: 'Prof. Michael Chen',
        duration: '6 weeks',
        students: 892,
        rating: 4.6,
        videoId: 'hZVYgapt2RA',
        modules: [
          { id: 1, title: 'Digital Marketing Overview', completed: false, duration: '50 min', videoId: 'hZVYgapt2RA' },
          { id: 2, title: 'SEO Fundamentals', completed: false, duration: '70 min', videoId: 'hZVYgapt2RA' },
          { id: 3, title: 'Social Media Marketing', completed: false, duration: '85 min', videoId: 'hZVYgapt2RA' },
          { id: 4, title: 'Content Marketing', completed: false, duration: '95 min', videoId: 'hZVYgapt2RA' },
          { id: 5, title: 'Email Marketing', completed: false, duration: '65 min', videoId: 'hZVYgapt2RA' },
          { id: 6, title: 'Analytics and ROI', completed: false, duration: '110 min', videoId: 'hZVYgapt2RA' }
        ] as Module[]
      },
      'data-structures': {
        title: 'Data Structures & Algorithms',
        description: 'Comprehensive course covering essential data structures and algorithms for efficient programming.',
        instructor: 'Dr. Alex Rodriguez',
        duration: '12 weeks',
        students: 654,
        rating: 4.9,
        videoId: '8hly31xKli0',
        modules: [
          { id: 1, title: 'Arrays and Strings', completed: false, duration: '80 min', videoId: '8hly31xKli0' },
          { id: 2, title: 'Linked Lists', completed: false, duration: '95 min', videoId: '8hly31xKli0' },
          { id: 3, title: 'Stacks and Queues', completed: false, duration: '75 min', videoId: '8hly31xKli0' },
          { id: 4, title: 'Trees and Graphs', completed: false, duration: '120 min', videoId: '8hly31xKli0' },
          { id: 5, title: 'Sorting Algorithms', completed: false, duration: '100 min', videoId: '8hly31xKli0' },
          { id: 6, title: 'Advanced Topics', completed: false, duration: '140 min', videoId: '8hly31xKli0' }
        ] as Module[]
      },
      'web-development-react': {
        title: 'Web Development with React',
        description: 'Build modern web applications using React, the most popular JavaScript library for frontend development.',
        instructor: 'Ms. Emily Davis',
        duration: '10 weeks',
        students: 1034,
        rating: 4.7,
        videoId: 'Ke90Tje7VS0',
        modules: [
          { id: 1, title: 'React Fundamentals', completed: false, duration: '90 min', videoId: 'Ke90Tje7VS0' },
          { id: 2, title: 'Components and Props', completed: false, duration: '85 min', videoId: 'Ke90Tje7VS0' },
          { id: 3, title: 'State Management', completed: false, duration: '110 min', videoId: 'Ke90Tje7VS0' },
          { id: 4, title: 'Hooks and Effects', completed: false, duration: '95 min', videoId: 'Ke90Tje7VS0' },
          { id: 5, title: 'Routing with React Router', completed: false, duration: '75 min', videoId: 'Ke90Tje7VS0' },
          { id: 6, title: 'Building a Full App', completed: false, duration: '180 min', videoId: 'Ke90Tje7VS0' }
        ] as Module[]
      }
    };

    return courses[id as keyof typeof courses] || courses['python-business'];
  };

  const courseData = getCourseData(courseId);
  
  // State for modules - stored in state array with isCompleted property
  const [modules, setModules] = useState<Module[]>(courseData.modules);
  
  // State Management: activeModule starts at 1
  const [activeModule, setActiveModule] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Success State: Track if user's answer is correct
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Get quiz questions from moduleQuizzes object
  const quizQuestions = moduleQuizzes[activeModule] || moduleQuizzes[1];

  // Calculate progress based on completed modules
  const completedModulesCount = modules.filter(m => m.completed).length;
  const progress = Math.round((completedModulesCount / modules.length) * 100);

  // Get current module
  const currentModule = modules.find(m => m.id === activeModule);
  const currentVideoId = currentModule?.videoId || courseData.videoId;

  // Get current user from Supabase auth and ensure progress record exists
  const getCurrentUserId = async (): Promise<string | null> => {
    if (!supabase) return null;
    
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  };

  // Initialize or get user progress when starting a course
  const initializeUserProgress = async (userId: string, courseIdStr: string, courseTitle: string) => {
    if (!supabase) return;
    
    try {
      // Check if progress record exists
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseIdStr)
        .single();
      
      if (!existingProgress) {
        // Create initial progress record with 0%
        await supabase
          .from('user_progress')
          .insert({
            user_id: userId,
            course_id: courseIdStr,
            course_name: courseTitle,
            status: 'in_progress',
            progress_percentage: 0
          });
        console.log('✅ Created user_progress record for course:', courseIdStr);
      }
    } catch (error) {
      console.error('Error initializing progress:', error);
    }
  };

  // Handle Continue Learning button click
  const handleContinueLearning = async () => {
    // Get current user and initialize progress
    const userId = await getCurrentUserId();
    if (userId) {
      await initializeUserProgress(userId, courseId, courseData.title);
    }
    
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setIsCorrect(null);
    setShowFeedback(false);
    setShowConfetti(false);
  };

  // Handle quiz answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    // Check if answer is correct immediately
    const correct = answerIndex === quizQuestions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Show confetti for correct answer
    if (correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  // Handle quiz submission (move to next question or finish)
  const handleQuizSubmit = () => {
    if (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
    
    setShowFeedback(false);
    setIsCorrect(null);
    
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
    }
  };

  // Save progress to Supabase when module is completed
  const saveModuleProgress = async (userId: string, courseIdStr: string, moduleId: number) => {
    if (!supabase) return;
    
    try {
      // Insert or update lecture_progress
      const { error } = await supabase
        .from('lecture_progress')
        .upsert(
          {
            user_id: userId,
            course_id: courseIdStr,
            lecture_id: moduleId.toString(),
            status: 'completed',
            completed_at: new Date().toISOString(),
            last_watched_at: new Date().toISOString()
          },
          { onConflict: 'user_id,course_id,lecture_id' }
        );
      
      if (error) {
        console.error('Error saving lecture progress:', error);
      } else {
        console.log('✅ Lecture progress saved for module:', moduleId);
      }
      
      // Calculate new progress percentage
      const completedCount = modules.filter(m => m.completed).length + 1; // +1 for current module
      const newProgress = Math.round((completedCount / modules.length) * 100);
      const isCourseComplete = completedCount === modules.length;
      
      // Update user_progress with new percentage
      const { error: progressError } = await supabase
        .from('user_progress')
        .update({
          progress_percentage: newProgress,
          status: isCourseComplete ? 'completed' : 'in_progress',
          completed_at: isCourseComplete ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('course_id', courseIdStr);
      
      if (progressError) {
        console.error('Error updating course progress:', progressError);
      } else {
        console.log('✅ Course progress updated:', newProgress + '%');
      }
    } catch (error) {
      console.error('Error in saveModuleProgress:', error);
    }
  };

  // Handle moving to next module after quiz
  const handleNextModule = async () => {
    // Get user ID and save progress before updating state
    const userId = await getCurrentUserId();
    
    // Mark the previous module as completed in the sidebar - Sidebar Sync
    const updatedModules = modules.map(m => 
      m.id === activeModule ? { ...m, completed: true } : m
    );
    setModules(updatedModules);
    
    // Save to Supabase if user is logged in
    if (userId) {
      await saveModuleProgress(userId, courseId, activeModule);
    }
    
    // Increment activeModule
    const nextModule = activeModule + 1;
    
    // Close quiz modal
    setShowQuiz(false);
    
    // Move to next module if available
    if (nextModule <= modules.length) {
      setActiveModule(nextModule);
    }
  };

  // Handle module selection from sidebar
  const handleModuleSelect = (moduleId: number) => {
    setActiveModule(moduleId);
  };

  return (
    <div className="min-h-screen">
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Simple Tailwind animation for confetti effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                    backgroundColor: ['#0070f3', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
                  }}
                  animate={{
                    y: ['0vh', '100vh'],
                    x: [0, Math.random() * 200 - 100],
                    rotate: [0, Math.random() * 720]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 0.5
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1e293b] border border-white/20 rounded-xl p-6 max-w-lg w-full relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {!quizCompleted ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Module {activeModule} Quiz</h3>
                    <button onClick={() => setShowQuiz(false)} className="text-gray-400 hover:text-white">
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
                    <p className="text-lg mt-2">{quizQuestions[currentQuestionIndex].question}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                          selectedAnswer === index 
                            ? index === quizQuestions[currentQuestionIndex].correctAnswer
                              ? 'bg-green-500 text-white ring-2 ring-green-300'
                              : 'bg-red-500 text-white ring-2 ring-red-300'
                            : showFeedback && index === quizQuestions[currentQuestionIndex].correctAnswer
                              ? 'bg-green-500/50 text-white'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showFeedback && index === quizQuestions[currentQuestionIndex].correctAnswer && (
                            <Check size={18} className="text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Feedback UI - Green box with success message */}
                  <AnimatePresence>
                    {showFeedback && isCorrect && (
                      <motion.div
                        className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <p className="text-green-400 font-semibold text-center animate-pulse">
                          🎉 Well Done! You nailed it!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {showFeedback ? (
                    <button
                      onClick={handleQuizSubmit}
                      className="w-full bg-[#0070f3] hover:bg-[#0056b3] text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                  ) : (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={selectedAnswer === null}
                      className="w-full bg-[#0070f3] hover:bg-[#0056b3] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      Submit Answer
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Quiz Completed!</h3>
                    <p className="text-lg mb-4">
                      You scored <span className="text-[#0070f3] font-bold">{quizScore}</span> out of <span className="font-bold">{quizQuestions.length}</span>
                    </p>
                    <p className="text-gray-400 mb-6">
                      {quizScore === quizQuestions.length 
                        ? 'Perfect score! Great job!' 
                        : quizScore >= quizQuestions.length / 2 
                        ? 'Good job! Keep learning!' 
                        : 'Keep practicing!'}
                    </p>
                    <button
                      onClick={handleNextModule}
                      className="w-full bg-[#0070f3] hover:bg-[#0056b3] text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      {activeModule < modules.length ? 'Continue to Next Module' : 'Finish Course'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/dashboard/courses">
          <motion.button
            className="flex items-center space-x-2 bg-[#1e293b]/50 hover:bg-[#1e293b]/70 text-white px-4 py-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            <span>Back to Courses</span>
          </motion.button>
        </Link>

        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{courseData.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>{courseData.students} students</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star size={16} className="text-yellow-400" />
            <span>{courseData.rating}</span>
          </div>
        </div>
      </motion.div>

      {/* Course Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
        <p className="text-gray-300 text-lg mb-4">{courseData.description}</p>
        <p className="text-gray-400">by {courseData.instructor}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Video Player - Auto-plays the next YouTube video lesson */}
          <motion.div
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg overflow-hidden mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1`}
                title={`${courseData.title} Video`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                key={currentVideoId}
              />
            </div>
          </motion.div>

          {/* Current Module Info */}
          <motion.div
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-4">Current Module</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {currentModule?.title}
                </h3>
                <p className="text-gray-300">
                  Duration: {currentModule?.duration}
                </p>
              </div>
              <motion.button
                className="bg-[#0070f3] hover:bg-[#0056b3] text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinueLearning}
                disabled={activeModule >= modules.length}
              >
                <Play size={20} />
                <span>Continue Learning</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Lessons Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg p-6 sticky top-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-bold mb-4">Course Modules</h3>
            <div className="space-y-3">
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    module.id === activeModule
                      ? 'bg-[#0070f3]/20 border border-[#0070f3]/50'
                      : module.completed
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => handleModuleSelect(module.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {module.completed ? (
                        <CheckCircle size={18} className="text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${module.completed ? 'text-green-400' : 'text-white'}`}>
                          Module {module.id}
                        </p>
                        <p className="text-xs text-gray-400">{module.title}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{module.duration}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Progress Summary - Sidebar Sync with completed modules */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{progress}% ({completedModulesCount}/{modules.length})</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="bg-[#0070f3] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                  key={progress}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
