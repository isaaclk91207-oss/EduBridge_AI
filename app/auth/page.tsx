'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles, GraduationCap, Briefcase, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/auth';

function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { login, signup, user, loading } = useAuth();

  // Form states
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentType: 'public',
    major: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push(redirect);
    }
  }, [user, loading, router, redirect]);

  const validateSignIn = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signInData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!signInData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const validateSignUp = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!signUpData.name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!emailRegex.test(signUpData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateSignIn()) return;
    
    setIsLoading(true);
    const result = await login(signInData.email, signInData.password);
    setIsLoading(false);
    
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateSignUp()) return;
    
    setIsLoading(true);
    const result = await signup({
      email: signUpData.email,
      password: signUpData.password,
      name: signUpData.name,
      studentType: signUpData.studentType,
      major: signUpData.major
    });
    setIsLoading(false);
    
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Card */}
      <motion.div
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glassmorphism Card */}
        <div className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/20 dark:border-cyan-500/30 shadow-2xl dark:shadow-cyan-500/20 rounded-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="relative h-32 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUvLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-8 h-8 text-white" />
                  <h1 className="text-3xl font-bold text-white">EduBridge AI</h1>
                </div>
                <p className="text-white/80 text-sm">Business & IT Student Ecosystem</p>
              </motion.div>
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="flex border-b border-white/10 dark:border-slate-700">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                !isSignUp ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Sign In
              {!isSignUp && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              )}
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                isSignUp ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Sign Up
              {isSignUp && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              )}
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {!isSignUp ? (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSignIn}
                  className="space-y-4"
                >
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-slate-800 dark:text-slate-200"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        className="w-full px-4 py-2.5 pr-12 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-slate-800 dark:text-slate-200"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing In...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </motion.button>
                  
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSignUp}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-slate-800 dark:text-slate-200"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-slate-800 dark:text-slate-200"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        className="w-full px-4 py-2.5 pr-12 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-slate-800 dark:text-slate-200"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2.5 pr-12 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-slate-800 dark:text-slate-200"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Student Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Student Type
                    </label>
                    <select
                      value={signUpData.studentType}
                      onChange={(e) => setSignUpData({ ...signUpData, studentType: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-slate-800 dark:text-slate-200"
                    >
                      <option value="public">Public School</option>
                      <option value="private">Private School</option>
                    </select>
                  </div>

                  {/* Major */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Major / Field of Study
                    </label>
                    <input
                      type="text"
                      value={signUpData.major}
                      onChange={(e) => setSignUpData({ ...signUpData, major: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-slate-800 dark:text-slate-200"
                      placeholder="Computer Science, Business, etc."
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={toggleMode}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={toggleMode}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white/30 dark:bg-slate-800/30 rounded-lg">
                <GraduationCap className="w-5 h-5 mx-auto mb-1 text-cyan-600 dark:text-cyan-400" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Courses</p>
              </div>
              <div className="p-2 bg-white/30 dark:bg-slate-800/30 rounded-lg">
                <Briefcase className="w-5 h-5 mx-auto mb-1 text-cyan-600 dark:text-cyan-400" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Career</p>
              </div>
              <div className="p-2 bg-white/30 dark:bg-slate-800/30 rounded-lg">
                <BookOpen className="w-5 h-5 mx-auto mb-1 text-cyan-600 dark:text-cyan-400" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Practice</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
