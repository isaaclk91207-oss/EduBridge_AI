'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Play, Code, Terminal, Calculator, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/components/ThemeContext';

// Declare Pyodide on window to avoid TypeScript errors
declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL?: string }) => Promise<any>;
  }
}

// Pyodide types - using any to avoid TypeScript issues
export default function Practice() {
  const [selectedRole, setSelectedRole] = useState<'it' | 'business' | null>(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(`// JavaScript Business Analysis
console.log("Hello, World!");

// Simple calculation
let revenue = 10000;
let cost = 6000;
let profit = revenue - cost;
console.log("Profit: " + profit);`);

  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  
  // Use ThemeContext for consistent dark mode with Sidebar
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [marketingBudget, setMarketingBudget] = useState(5000);
  const [rndBudget, setRndBudget] = useState(5000);

  const editorRef = useRef<any>(null);
  const pyodideRef = useRef<any>(null);

  const languages = [
    { value: 'python', label: 'Python 🐍' },
    { value: 'javascript', label: 'JavaScript ⚡' },
    { value: 'cpp', label: 'C++ (Coming Soon)' },
    { value: 'java', label: 'Java (Coming Soon)' },
  ];

  const getDefaultCode = (lang: string) => {
    switch (lang) {
      case 'python': return `# Python Business Analysis
print("Hello, World!")

# Simple calculation
revenue = 10000
cost = 6000
profit = revenue - cost
print(f"Profit: {profit}")`;
      case 'cpp': return `#include <iostream>
int main() {
    std::cout << "Hello!" << std::endl;
    return 0;
}`;
      case 'java': return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello!");
    }
}`;
      case 'javascript': return `// JavaScript
console.log("Hello, World!");

// Try modifying this and running again!
let x = 10;
let y = 20;
console.log("Sum:", x + y);`;
      default: return '// Select a language';
    }
  };

// Load Pyodide on mount
  useEffect(() => {
    const loadPyodideScript = async () => {
      if (window.loadPyodide) {
        try {
          setPyodideLoading(true);
          pyodideRef.current = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
          });
          setPyodideReady(true);
          setPyodideLoading(false);
          console.log('Pyodide loaded successfully');
        } catch (error) {
          console.error('Failed to load Pyodide:', error);
          setPyodideLoading(false);
        }
      }
    };

    // Add Pyodide script if not already present
    if (!document.getElementById('pyodide-script')) {
      const script = document.createElement('script');
      script.id = 'pyodide-script';
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      script.async = true;
      script.onload = loadPyodideScript;
      document.head.appendChild(script);
    } else if (window.loadPyodide) {
      loadPyodideScript();
    }
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(getDefaultCode(newLanguage));
    setOutput('');
  };

  // Client-side JavaScript execution using Web Worker
  const executeJavaScript = async (jsCode: string): Promise<string> => {
    return new Promise((resolve) => {
      const logs: string[] = [];
      
      // Create a blob URL for the worker
      const workerCode = `
        self.onmessage = function(e) {
          const logs = [];
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn
          };
          
          console.log = (...args) => {
            logs.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
          };
          console.error = console.log;
          console.warn = console.log;
          
          try {
            const result = eval(e.data);
            if (result !== undefined) {
              logs.push('Return: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
            }
          } catch (error) {
            logs.push('Error: ' + error.message);
          }
          
          self.postMessage(logs.join('\\n'));
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      
      const timeout = setTimeout(() => {
        worker.terminate();
        resolve('Error: Execution timed out (5s limit)');
      }, 5000);
      
      worker.onmessage = (e) => {
        clearTimeout(timeout);
        worker.terminate();
        resolve(e.data || '(No output)');
      };
      
      worker.onerror = (e) => {
        clearTimeout(timeout);
        worker.terminate();
        resolve('Error: ' + e.message);
      };
      
      worker.postMessage(jsCode);
    });
  };

  // Client-side Python execution using Pyodide
  const executePython = async (pythonCode: string): Promise<string> => {
    if (!pyodideRef.current) {
      // Try to load Pyodide again
      if (window.loadPyodide) {
        setPyodideLoading(true);
        try {
          pyodideRef.current = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
          });
          setPyodideReady(true);
          setPyodideLoading(false);
        } catch (error) {
          setPyodideLoading(false);
          return `Error: Failed to load Python runtime. Please refresh the page and try again.`;
        }
      } else {
        return `Error: Python runtime not available. Please refresh the page.`;
      }
    }

    try {
      // Redirect stdout to capture print() output
      pyodideRef.current.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `);

      // Run the user's code
      await pyodideRef.current.runPythonAsync(pythonCode);
      
      // Get the captured output
      const stdout = pyodideRef.current.runPython('sys.stdout.getvalue()');
      
      // Reset stdout
      pyodideRef.current.runPython('sys.stdout = StringIO()');
      
      return stdout || '(No output)';
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  };

  const runCode = async () => {
    // Clear previous output and show Processing status
    setOutput('⏳ Loading runtime...');
    setIsRunning(true);
    
    try {
      // ============================================
      // STRATEGY 1: Client-Side JavaScript (Web Worker)
      // ============================================
      if (language === 'javascript') {
        setOutput('⏳ Running JavaScript...');
        
        const result = await executeJavaScript(code);
        
        if (result.startsWith('Error:')) {
          setOutput(`❌ JavaScript Error:\n${result}`);
        } else {
          setOutput(`✅ Output:\n${result}`);
        }
        setIsRunning(false);
        return;
      }
      
      // ============================================
      // STRATEGY 2: Client-Side Python (Pyodide)
      // ============================================
      if (language === 'python') {
        if (pyodideLoading) {
          setOutput('⏳ Python runtime is loading, please wait...');
          // Wait for Pyodide to load
          let attempts = 0;
          while (pyodideLoading && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
          }
        }
        
        if (!pyodideReady && !pyodideRef.current) {
          setOutput(`⚠️ Python runtime failed to load. Please refresh the page and try again.`);
          setIsRunning(false);
          return;
        }
        
        setOutput('⏳ Running Python...');
        
        const result = await executePython(code);
        
        if (result.startsWith('Error:')) {
          setOutput(`❌ Python Error:\n${result}`);
        } else {
          setOutput(`✅ Output:\n${result}`);
        }
        setIsRunning(false);
        return;
      }
      
      // ============================================
      // STRATEGY 3: C++ and Java - Coming Soon
      // ============================================
      if (language === 'cpp' || language === 'java') {
        setOutput(`🔧 ${language === 'cpp' ? 'C++' : 'Java'} Compiler\n\n` +
          `The ${language === 'cpp' ? 'C++' : 'Java'} compiler requires server-side processing.\n\n` +
          `⏳ Status: Coming Soon!\n\n` +
          `In the meantime, you can use:\n` +
          `• Python 🐍 - Full support (runs locally in browser)\n` +
          `• JavaScript ⚡ - Full support (runs locally in browser)\n\n` +
          `Try switching to Python or JavaScript for instant results!`);
        setIsRunning(false);
        return;
      }
      
    } catch (error) {
      // Final fallback for any unexpected errors
      setOutput(`❌ Unexpected Error:\n${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const calculateProfitData = () => {
    const baseProfit = 10000;
    const marketingMultiplier = 1 + (marketingBudget / 10000) * 1.5;
    const rndMultiplier = 1 + (rndBudget / 10000) * 2.0;
    return [
      { month: 'Jan', profit: Math.round(baseProfit * marketingMultiplier * rndMultiplier * 0.8) },
      { month: 'Feb', profit: Math.round(baseProfit * marketingMultiplier * rndMultiplier * 0.9) },
      { month: 'Mar', profit: Math.round(baseProfit * marketingMultiplier * rndMultiplier * 1.0) },
      { month: 'Apr', profit: Math.round(baseProfit * marketingMultiplier * rndMultiplier * 1.2) },
      { month: 'May', profit: Math.round(baseProfit * marketingMultiplier * rndMultiplier * 1.4) },
      { month: 'Jun', profit: Math.round(baseProfit * marketingMultiplier * rndMultiplier * 1.6) }
    ];
  };

  const profitData = calculateProfitData();

  if (selectedRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-4 text-slate-800">EduBridge AI Practice Lab</h1>
            <p className="text-xl text-slate-500">Choose your learning path</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-white border border-blue-100 shadow-sm rounded-xl p-8 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedRole('it')}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Code size={40} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-700">IT Specialist</h3>
                <p className="text-slate-500">Practice Python, JavaScript, and more in a real-time code editor.</p>
              </div>
            </motion.div>

            <motion.div
              className="bg-white border border-blue-100 shadow-sm rounded-xl p-8 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedRole('business')}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp size={40} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-700">Business Strategist</h3>
                <p className="text-slate-500">Run market simulations and analyze business cases.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Pyodide loading indicator */}
      {pyodideLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          <span>Loading Python Runtime...</span>
        </div>
      )}

      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button
          onClick={() => setSelectedRole(null)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>Switch Role</span>
        </button>
      </motion.div>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">
          {selectedRole === 'it' ? 'IT Specialist Lab' : 'Business Strategist Lab'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {selectedRole === 'it' ? 'Professional coding environment' : 'Interactive business simulation'}
        </p>
      </motion.div>

      {selectedRole === 'it' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Code className="text-blue-600" size={28} />
                <h2 className="text-xl font-bold text-slate-700 dark:text-white">Code Editor</h2>
                {pyodideReady && language === 'python' && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                    🐍 Python Ready
                  </span>
                )}
              </div>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-blue-50 dark:bg-slate-700 border border-blue-100 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div className="h-[500px] border border-blue-100 dark:border-slate-600 rounded-lg overflow-hidden mb-4">
<Editor
                height="100%"
                language={language === 'cpp' || language === 'java' ? 'plaintext' : language}
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={(editor) => { editorRef.current = editor; }}
                theme={isDark ? 'vs-dark' : 'light'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            <button
              onClick={runCode}
              disabled={isRunning || pyodideLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isRunning ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play size={20} />
                  <span>Run Code</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 shadow-sm rounded-xl p-6 h-[600px]">
            <div className="flex items-center space-x-2 mb-4">
              <Terminal className="text-blue-600" size={24} />
              <h3 className="text-lg font-bold text-slate-700 dark:text-white">Output</h3>
            </div>
            <div className={`h-full border rounded-lg p-4 overflow-auto font-mono text-sm ${
              output.startsWith('❌') || output.startsWith('⚠️') 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' 
                : output.startsWith('⏳')
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'
                : 'bg-slate-50 dark:bg-slate-900 border-blue-100 dark:border-slate-600 text-slate-600 dark:text-slate-300'
            }`}>
              <pre className="whitespace-pre-wrap">{output || 'Click "Run Code" to execute your code...'}</pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 shadow-sm rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-slate-700 dark:text-white">Market Simulation</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Adjust budget allocation to see profit projections.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">Marketing Budget: ${marketingBudget}</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={marketingBudget}
                  onChange={(e) => setMarketingBudget(Number(e.target.value))}
                  className="w-full h-2 bg-blue-100 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">R&D Budget: ${rndBudget}</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={rndBudget}
                  onChange={(e) => setRndBudget(Number(e.target.value))}
                  className="w-full h-2 bg-blue-100 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="bg-blue-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Total:</span>
                  <span className={`text-sm font-bold ${(marketingBudget + rndBudget) > 10000 ? 'text-red-500' : 'text-green-600'}`}>
                    ${(marketingBudget + rndBudget).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 shadow-sm rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-slate-700 dark:text-white">Profit Projection</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
