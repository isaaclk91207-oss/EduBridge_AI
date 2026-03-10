'use client';

import { motion } from 'framer-motion';
import { Briefcase, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Job {
  title: string;
  company: string;
  location: string;
}

interface RecommendedJobsProps {
  jobs: Job[];
  careerColor: string;
}

// Toast component
function Toast({ message, isVisible, type }: { message: string; isVisible: boolean; type: 'success' | 'error' }) {
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center space-x-2 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      <CheckCircle size={20} className="text-white" />
      <span className="text-white font-medium">{message}</span>
    </motion.div>
  );
}

export default function RecommendedJobs({ jobs, careerColor }: RecommendedJobsProps) {
  const [applyingJob, setApplyingJob] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'error' }>({
    message: '',
    visible: false,
    type: 'success'
  });

  // Initialize with empty array to avoid hydration mismatch
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);

  // Load applied jobs from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appliedJobs');
      if (saved) {
        try {
          setAppliedJobs(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse appliedJobs:', e);
        }
      }
    }
  }, []);

  const handleApply = async (job: Job, index: number) => {
    // Check if already applied
    if (appliedJobs.includes(index)) {
      setToast({
        message: 'You have already applied to this position',
        visible: true,
        type: 'error'
      });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
      return;
    }

    // Show loading state
    setApplyingJob(index);

    // Simulate API call - 1 second loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save to localStorage
    const newAppliedJobs = [...appliedJobs, index];
    setAppliedJobs(newAppliedJobs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appliedJobs', JSON.stringify(newAppliedJobs));
    }

    // Show localized success toast - Myanmar context
    setApplyingJob(null);
    setToast({
      message: `Application Successful! Your AI-Verified Portfolio has been sent to the HR team at ${job.company}.`,
      visible: true,
      type: 'success'
    });

    // Hide toast after 3 seconds
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  return (
    <>
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Briefcase className="mr-2" style={{ color: careerColor }} size={24} />
          Recommended for You
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.map((job, index) => (
            <motion.div
              key={index}
              className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            >
              <h4 className="font-semibold mb-1" style={{ color: careerColor }}>{job.title}</h4>
              <p className="text-gray-400 text-sm mb-1">{job.company}</p>
              <p className="text-gray-500 text-xs mb-3 flex items-center">
                <MapPin size={12} className="mr-1" />
                {job.location}
              </p>
              
              {appliedJobs.includes(index) ? (
                <button 
                  disabled
                  className="w-full py-2 rounded-lg text-sm font-medium bg-green-600/20 text-green-400 cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>Applied</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleApply(job, index)}
                  disabled={applyingJob === index}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  style={{ 
                    backgroundColor: `${careerColor}20`, 
                    color: careerColor,
                    opacity: applyingJob === index ? 0.7 : 1
                  }}
                >
                  {applyingJob === index ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Application...</span>
                    </>
                  ) : (
                    <span>Apply Now</span>
                  )}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        isVisible={toast.visible} 
        type={toast.type}
      />
    </>
  );
}
