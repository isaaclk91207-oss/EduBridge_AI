"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Play, Loader2, Send, User, Bot, Sparkles, X, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Generate a simple user ID
const generateUserId = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("edubridge_user_id");
    if (stored) return stored;
    const newId = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("edubridge_user_id", newId);
    return newId;
  }
  return "anonymous_user";
};

export default function AIInterview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedText]);

  // Typing effect for assistant messages
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant" && isLoading) {
      const latestMessage = messages[messages.length - 1].content;
      let index = 0;
      setDisplayedText("");
      
      const interval = setInterval(() => {
        if (index < latestMessage.length) {
          setDisplayedText((prev) => prev + latestMessage.charAt(index));
          index++;
        } else {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [messages, isLoading]);

  const startInterview = () => {
    setIsInterviewStarted(true);
    const welcomeMessage: Message = {
      role: "assistant",
      content: "Welcome to your AI Mock Interview! 🎯\n\nI'm your personal interview coach. I'll help you practice and prepare for your job interviews.\n\nTo get started, please tell me:\n1. What position are you targeting?\n2. What is your professional background?\n3. Any specific skills or experiences you'd like to focus on?\n\nTake your time - we're going to practice step by step!"
    };
    setMessages([welcomeMessage]);
  };

  const resetInterview = () => {
    setIsInterviewStarted(false);
    setMessages([]);
    setInput("");
    setDisplayedText("");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const userId = generateUserId();
      const response = await fetch(
        `http://localhost:8000/chat/mentor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            message: userMessage.content
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Read the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
        }
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: assistantMessage
      };

      setMessages((prev) => [...prev, assistantMsg]);

    } catch (error) {
      console.error("Error:", error);
      const errorMsg: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <MessageCircle className="text-[var(--accent-blue)]" />
              AI Mock Interview
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Practice with AI-powered interview coaching
            </p>
          </div>
          {isInterviewStarted && (
            <button
              onClick={resetInterview}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)]/80 backdrop-blur-md border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
            >
              <RefreshCw size={18} className="text-[var(--accent-blue)]" />
              <span className="text-[var(--text-primary)]">Reset Interview</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Start Interview Button */}
      {!isInterviewStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-12 text-center max-w-md shadow-lg">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-full flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 30px var(--accent-glow)' }}>
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Start Your Mock Interview</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Practice with AI to improve your interview skills. Get instant feedback and tips.
            </p>
            <button
              onClick={startInterview}
              className="px-8 py-3 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] hover:opacity-90 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto shadow-lg"
              style={{ boxShadow: '0 0 20px var(--accent-glow)' }}
            >
              <Sparkles className="w-5 h-5" />
              Start Mock Interview
            </button>
          </div>
        </motion.div>
      )}

      {/* Chat Interface */}
      {isInterviewStarted && (
        <div className="max-w-4xl mx-auto">
          {/* Messages */}
          <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-xl p-4 mb-4 min-h-[400px] max-h-[500px] overflow-y-auto">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] text-white"
                      : "bg-[var(--bg-tertiary)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-primary)]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.role === "user" && <User className="w-4 h-4 mt-1 text-white" />}
                    <p className="text-sm whitespace-pre-wrap">
                      {msg.role === "assistant" && index === messages.length - 1 && isLoading
                        ? displayedText
                        : msg.content}
                    </p>
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)]/80 backdrop-blur-md border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[var(--accent-blue)]" />
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[var(--bg-tertiary)]/80 backdrop-blur-md border border-[var(--border-color)] rounded-lg p-3">
                  <Loader2 className="w-5 h-5 text-[var(--accent-blue)] animate-spin" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-xl p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 bg-[var(--bg-tertiary)]/80 backdrop-blur-md border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:border-transparent resize-none"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-6 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-2 shadow-lg"
                style={{ boxShadow: '0 0 15px var(--accent-glow)' }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
