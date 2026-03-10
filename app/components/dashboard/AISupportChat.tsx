"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles, WifiOff, Play, ExternalLink, Briefcase, GraduationCap } from "lucide-react";

// Types
interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  videoCards?: VideoCard[];
}

interface VideoCard {
  title: string;
  url: string;
  thumbnail?: string;
}

type ChatMode = "general" | "cofounder" | "mentor";

// Generate a simple user ID (in production, get this from auth)
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

// Extract YouTube video ID from URL
const extractYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Parse AI response for video links
const parseVideoLinks = (text: string): VideoCard[] => {
  const videoCards: VideoCard[] = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  
  if (matches) {
    matches.forEach((url) => {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = extractYouTubeId(url);
        if (videoId) {
          videoCards.push({
            title: "Recommended Tutorial Video",
            url: url,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          });
        }
      }
    });
  }
  
  return videoCards;
};

export default function AISupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("general");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm your AI Support Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get the appropriate endpoint based on chat mode
  const getEndpoint = () => {
    switch (chatMode) {
      case "cofounder":
        return "http://localhost:8000/chat/cofounder";
      case "mentor":
        return "http://localhost:8000/chat/mentor";
      default:
        return "http://localhost:8000/api/chat";
    }
  };

  // Check if the endpoint supports streaming
  const isStreamingEndpoint = () => {
    return chatMode === "cofounder" || chatMode === "mentor";
  };

  // Handle sending message with streaming support
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setConnectionError(false);

    const userId = generateUserId();
    const endpoint = getEndpoint();

    try {
      // For streaming endpoints
      if (isStreamingEndpoint()) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            user_id: userId,
            message: userMessage.content 
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponseText = "";

        // Create initial AI message placeholder
        const aiMessageId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: aiMessageId,
            role: "ai",
            content: "",
            timestamp: new Date(),
          },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          aiResponseText += chunk;

          // Update the AI message with streaming content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: aiResponseText,
                    videoCards: parseVideoLinks(aiResponseText),
                  }
                : msg
            )
          );
        }
      } else {
        // For non-streaming endpoint (general chat)
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            message: userMessage.content,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: data.reply || "I'm sorry, I couldn't process your request at this moment.",
          timestamp: new Date(),
          videoCards: parseVideoLinks(data.reply || ""),
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "AI Support is taking a nap. Please try again later!",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setConnectionError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Floating Action Button - Light Blue/Cyan Gradient */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat Window - Glassmorphism Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="bg-white/40 backdrop-blur-xl border border-blue-200/30 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-white/30 backdrop-blur-md border-b border-blue-200/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-semibold">AI Support</h3>
                      <p className="text-slate-500 text-xs">
                        {connectionError ? "Connection issues" : "Always here to help"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Chat Mode Selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setChatMode("general")}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      chatMode === "general"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : "bg-white/30 text-slate-600 hover:bg-white/50"
                    }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setChatMode("mentor")}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      chatMode === "mentor"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : "bg-white/30 text-slate-600 hover:bg-white/50"
                    }`}
                  >
                    <GraduationCap size={12} />
                    Mentor
                  </button>
                  <button
                    onClick={() => setChatMode("cofounder")}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      chatMode === "cofounder"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : "bg-white/30 text-slate-600 hover:bg-white/50"
                    }`}
                  >
                    <Briefcase size={12} />
                    Co-founder
                  </button>
                </div>
              </div>

              {/* Connection Error Banner */}
              {connectionError && (
                <div className="bg-amber-50 border-b border-amber-200/30 px-4 py-2 flex items-center space-x-2">
                  <WifiOff className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 text-sm">
                    AI Support is taking a nap. Please try again later!
                  </span>
                </div>
              )}

              {/* Messages Area */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-white/20">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-[85%] ${
                        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                            : "bg-white/40 backdrop-blur-md border border-blue-200/30"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-blue-600" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="space-y-2">
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-md"
                              : "bg-white/40 backdrop-blur-md text-slate-800 rounded-bl-md border border-blue-200/20"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.role === "user" ? "text-blue-100" : "text-slate-500"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>

                        {/* Video Cards */}
                        {message.videoCards && message.videoCards.length > 0 && (
                          <div className="space-y-2">
                            {message.videoCards.map((video, idx) => (
                              <a
                                key={idx}
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2 bg-white/30 backdrop-blur-md border border-blue-200/20 rounded-lg hover:bg-white/50 transition-colors"
                              >
                                {video.thumbnail && (
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-24 h-16 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-slate-800 font-medium truncate">
                                    {video.title}
                                  </p>
                                  <p className="text-xs text-blue-600 flex items-center gap-1">
                                    <Play size={10} />
                                    Watch Tutorial
                                  </p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-500" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-end space-x-2">
                      <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md border border-blue-200/30 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="bg-white/40 backdrop-blur-md border border-blue-200/20 px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-blue-200/20 bg-white/30 backdrop-blur-md">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      chatMode === "mentor"
                        ? "Ask the mentor..."
                        : chatMode === "cofounder"
                        ? "Ask the co-founder..."
                        : "Type your message..."
                    }
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-white/50 backdrop-blur-md border border-blue-200/30 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
