'use client';

import { motion } from 'framer-motion';

export default function AIPath() {
  return (
    <div>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">AI Career Roadmap & Portfolio Generator</h1>
        <p className="text-gray-300">Generate personalized learning paths and professional portfolios with AI assistance.</p>
      </motion.div>

      {/* Streamlit Integration */}
      <motion.div
        className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <iframe
          src="YOUR_FRIEND_STREAMLIT_URL"
          className="w-full h-[800px] border-0"
          title="AI Career Roadmap & Portfolio Generator"
          allow="fullscreen"
        />
      </motion.div>
    </div>
  );
}
