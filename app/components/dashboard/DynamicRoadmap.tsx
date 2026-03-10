"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  Code,
  Cpu,
  Network,
  Rocket,
  Lightbulb,
  BookOpen,
  Terminal,
  Database,
  Cloud,
  Sparkles,
  Target,
  Zap,
  Layers,
  Box,
  GitBranch,
  CheckCircle,
  Circle,
  ArrowRight,
  Gauge,
  Workflow,
  Bot,
  Cog,
  Settings,
  GraduationCap,
  Briefcase,
  MapPin,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Smartphone,
  Monitor,
  Figma,
  Palette,
  PenTool,
  Image,
  Video,
  Music,
  Mic,
  Camera,
  FileText,
  Folder,
  Download,
  Upload,
  Share2,
  Link2,
  Lock,
  Unlock,
  Eye,
  Search,
  Filter,
  RefreshCw,
  HelpCircle,
  AlertTriangle,
  Info,
  Check,
  X,
  Plus,
  Minus,
  Play,
  Pause,
  Clock,
  Calendar,
  MapPinned,
  Compass,
  Navigation,
  Anchor,
  Flag,
  Tag,
  Bookmark,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Wand2,
  FlaskConical,
  Binary,
  Bug,
  Plug,
  Hammer,
  DollarSign,
  Calculator,
  Megaphone,
  Github,
  Wrench,
} from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

// Type definitions
export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  iconType: string;
  duration?: string;
  topics?: string[];
}

interface DynamicRoadmapProps {
  data: RoadmapStep[];
  title?: string;
  subtitle?: string;
}

// Icon mapping function - maps backend iconType to Lucide icons
const getIcon = (iconType: string): React.ComponentType<{ size?: number; className?: string }> => {
  const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    // AI & Tech
    brain: Brain,
    ai: Sparkles,
    bot: Bot,
    cog: Cog,
    cpu: Cpu,
    network: Network,
    robot: Bot,
    algorithm: GitBranch,
    data: Database,
    cloud: Cloud,
    terminal: Terminal,
    code: Code,
    programming: Code,
    web: Globe,
    mobile: Smartphone,
    desktop: Monitor,
    app: Box,
    software: Settings,
    
    // Learning & Career
    learning: GraduationCap,
    career: Briefcase,
    roadmap: MapPin,
    target: Target,
    goal: Flag,
    success: TrendingUp,
    growth: TrendingUp,
    team: Users,
    mentor: Users,
    interview: MessageSquare,
    portfolio: Briefcase,
    resume: FileText,
    
    // Skills & Tools
    skill: Star,
    tool: Wrench,
    design: Figma,
    ux: PenTool,
    ui: Palette,
    prototyping: PenTool,
    wireframe: FileText,
    
    // Media
    video: Video,
    audio: Music,
    podcast: Mic,
    image: Image,
    photo: Camera,
    
    // Business
    business: Briefcase,
    startup: Rocket,
    entrepreneur: Crown,
    marketing: Megaphone,
    sales: DollarSign,
    finance: DollarSign,
    accounting: Calculator,
    management: Briefcase,
    leadership: Users,
    strategy: Target,
    
    // Communication
    email: Mail,
    phone: Phone,
    chat: MessageSquare,
    social: Share2,
    link: Link2,
    
    // Development
    git: GitBranch,
    github: Github,
    version: RefreshCw,
    deploy: Rocket,
    build: Hammer,
    test: FlaskConical,
    debug: Bug,
    security: Lock,
    api: Plug,
    
    // General
    star: Star,
    check: CheckCircle,
    circle: Circle,
    clock: Clock,
    calendar: Calendar,
    location: MapPinned,
    compass: Compass,
    navigation: Navigation,
    help: HelpCircle,
    info: Info,
    warning: AlertTriangle,
    error: AlertTriangle,
    done: Check,
    complete: CheckCircle,
    
    // Default
    default: Lightbulb,
    generic: Box,
    step: ArrowRight,
  };
  
  return iconMap[iconType?.toLowerCase() || ''] || iconMap.default;
};

// Single Roadmap Step Component
function RoadmapCard({ 
  stepData, 
  index, 
  isDark,
  isLast 
}: { 
  stepData: RoadmapStep; 
  index: number; 
  isDark: boolean;
  isLast: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const Icon = getIcon(stepData.iconType || 'default');
  
  // Alternate left/right for zigzag pattern
  const isLeft = index % 2 === 0;
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, type: "spring" }}
      className={`relative flex items-center justify-between w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-8`}
    >
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
        whileHover={{ scale: 1.03, y: -5 }}
        className={`flex-1 max-w-md p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
          isDark 
            ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
            : 'bg-white/40 backdrop-blur-xl border border-white/50 hover:border-blue-400/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {stepData.title}
          </h3>
          {stepData.duration && (
            <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${
              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <Clock size={12} />
              {stepData.duration}
            </span>
          )}
        </div>
        
        {/* Description */}
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {stepData.description}
        </p>
        
        {/* Topics */}
        {stepData.topics && stepData.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stepData.topics.map((topic, i) => (
              <span 
                key={i}
                className={`text-xs px-2 py-1 rounded-lg ${
                  isDark 
                    ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50' 
                    : 'bg-blue-50 text-blue-600 border border-blue-200/50'
                }`}
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Connector with Arrow */}
      <div className="flex flex-col items-center">
        {/* Timeline Node */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.15 + 0.3, type: "spring" }}
          className="relative z-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
            <Icon size={24} className="text-white" />
          </div>
          {/* Pulsing glow */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 blur-xl"
          />
        </motion.div>
        
        {/* Connecting Line with Arrow */}
        {!isLast && (
          <motion.div
            initial={{ height: 0 }}
            animate={isInView ? { height: '80px' } : {}}
            transition={{ duration: 0.8, delay: index * 0.15 + 0.4, ease: "easeInOut" }}
            className="relative w-8 flex items-center justify-center"
          >
            <svg className="w-2 h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`line-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <path
                d="M 4 0 L 4 80"
                stroke={`url(#line-gradient-${index})`}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
            </svg>
            {/* Arrow head */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: index * 0.15 + 0.8 }}
              className="absolute bottom-0"
            >
              <ArrowRight 
                size={16} 
                className="text-cyan-500 drop-shadow-lg" 
                style={{ transform: 'rotate(90deg)' }}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Main DynamicRoadmap Component
export default function DynamicRoadmap({ 
  data, 
  title = "Your Learning Journey", 
  subtitle = "Follow this step-by-step roadmap to achieve your goals" 
}: DynamicRoadmapProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Calculate total weeks
  const totalWeeks = data.reduce((acc, s) => acc + (parseInt(s.duration || "4") || 4), 0);
  
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 ${
        isDark ? 'text-slate-400' : 'text-slate-500'
      }`}>
        <MapPin size={48} className="mb-4 opacity-50" />
        <p>No roadmap data available</p>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen p-8 ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-[#f0f9ff]'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className={`text-3xl font-bold mb-2 flex items-center justify-center gap-3 ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}>
          <Target className="text-blue-600" size={32} />
          {title}
        </h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          {subtitle}
        </p>
        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          isDark ? 'bg-slate-800/50 text-cyan-400' : 'bg-blue-100 text-blue-600'
        }`}>
          <Sparkles size={16} />
          <span className="text-sm font-medium">{data.length} Steps • {totalWeeks} weeks total</span>
        </div>
      </motion.div>

      {/* Roadmap Container */}
      <div className="max-w-5xl mx-auto">
        {/* Timeline wrapper */}
        <div className="relative">
          {/* Vertical center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-500 to-blue-500 -translate-x-1/2" />
          
          {/* Steps */}
          <div className="space-y-4">
            {data.map((stepItem, index) => (
              <RoadmapCard
                key={index}
                stepData={stepItem}
                index={index}
                isDark={isDark}
                isLast={index === data.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: data.length * 0.15 + 0.5 }}
        className={`mt-12 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
      >
        <div className="flex items-center justify-center gap-2">
          <CheckCircle size={20} className="text-green-500" />
          <span className="text-sm">Complete all steps to unlock your certificate!</span>
        </div>
      </motion.div>
    </div>
  );
}
