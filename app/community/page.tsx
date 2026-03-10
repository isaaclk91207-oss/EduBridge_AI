'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MessageSquare, Plus, TrendingUp, Users, Clock, ThumbsUp } from 'lucide-react';

export default function Community() {
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });

  const discussions = [
    {
      id: 1,
      title: 'Best practices for Python data analysis in business?',
      author: 'Sarah Chen',
      replies: 23,
      likes: 45,
      time: '2 hours ago',
      trending: true
    },
    {
      id: 2,
      title: 'React vs Vue for business applications',
      author: 'Mike Johnson',
      replies: 18,
      likes: 32,
      time: '4 hours ago',
      trending: true
    },
    {
      id: 3,
      title: 'Digital marketing strategies for startups',
      author: 'Emma Davis',
      replies: 31,
      likes: 67,
      time: '6 hours ago',
      trending: false
    },
    {
      id: 4,
      title: 'SQL optimization techniques',
      author: 'Alex Rodriguez',
      replies: 12,
      likes: 28,
      time: '1 day ago',
      trending: false
    },
    {
      id: 5,
      title: 'Building a personal brand as a developer',
      author: 'Lisa Wang',
      replies: 27,
      likes: 54,
      time: '1 day ago',
      trending: false
    }
  ];

  const handleNewDiscussion = () => {
    if (newDiscussion.title && newDiscussion.content) {
      console.log('New discussion:', newDiscussion);
      setNewDiscussion({ title: '', content: '' });
      setShowNewDiscussion(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Community</h1>
        <p className="text-[var(--text-secondary)]">Connect and learn with fellow students</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-xl rounded-lg p-6 text-center"
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--accent-glow)' }}
          transition={{ duration: 0.3 }}
        >
          <Users className="mx-auto mb-4 text-[var(--accent-blue)]" size={32} />
          <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Active Members</h3>
          <p className="text-3xl font-semibold text-[var(--accent-blue)]">2,847</p>
        </motion.div>
        <motion.div
          className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-xl rounded-lg p-6 text-center"
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--accent-glow)' }}
          transition={{ duration: 0.3 }}
        >
          <MessageSquare className="mx-auto mb-4 text-[var(--accent-blue)]" size={32} />
          <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Discussions</h3>
          <p className="text-3xl font-semibold text-[var(--accent-blue)]">1,234</p>
        </motion.div>
        <motion.div
          className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-xl rounded-lg p-6 text-center"
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--accent-glow)' }}
          transition={{ duration: 0.3 }}
        >
          <TrendingUp className="mx-auto mb-4 text-[var(--accent-blue)]" size={32} />
          <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">This Week</h3>
          <p className="text-3xl font-semibold text-[var(--accent-blue)]">+156</p>
        </motion.div>
      </motion.div>

      {/* New Discussion Button */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.button
          onClick={() => setShowNewDiscussion(!showNewDiscussion)}
          className="bg-[var(--accent-blue)] hover:opacity-90 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={20} />
          <span>Start New Discussion</span>
        </motion.button>
      </motion.div>

      {/* New Discussion Form */}
      {showNewDiscussion && (
        <motion.div
          className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-xl rounded-lg p-6 mb-8"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Create New Discussion</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Discussion title..."
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            />
            <textarea
              placeholder="Share your thoughts..."
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] resize-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            />
            <div className="flex space-x-4">
              <motion.button
                onClick={handleNewDiscussion}
                className="bg-[var(--accent-blue)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-md transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Post Discussion
              </motion.button>
              <motion.button
                onClick={() => setShowNewDiscussion(false)}
                className="bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] font-bold py-2 px-4 rounded-md transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Discussions List */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Trending Discussions</h2>

        {discussions.map((discussion, index) => (
          <motion.div
            key={discussion.id}
            className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-xl rounded-lg p-6 cursor-pointer"
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px var(--accent-glow)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-bold hover:text-[var(--accent-blue)] transition-colors text-[var(--text-primary)]">
                    {discussion.title}
                  </h3>
                  {discussion.trending && (
                    <span className="bg-[var(--accent-blue)] text-white text-xs px-2 py-1 rounded-full">
                      Trending
                    </span>
                  )}
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-3">by {discussion.author}</p>
                <div className="flex items-center space-x-6 text-sm text-[var(--text-muted)]">
                  <div className="flex items-center space-x-1">
                    <MessageSquare size={16} />
                    <span>{discussion.replies} replies</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp size={16} />
                    <span>{discussion.likes} likes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{discussion.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
