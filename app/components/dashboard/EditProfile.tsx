'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Globe, 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle,
  XCircle,
  Building2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CandidateProfile {
  company_name: string;
  industry: string;
  location: string;
  website: string;
  description: string;
  cv_url: string;
}

interface EditProfileProps {
  userId?: string;
  onSuccess?: () => void;
}

export default function EditProfile({ userId, onSuccess }: EditProfileProps) {
  // Guard: If supabase client is not initialized, show error
  if (!supabase) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-xl p-6">
        <p className="text-red-400">Supabase client not initialized. Please check your environment variables.</p>
      </div>
    );
  }

  // Use non-null assertion since we already checked above
  const supabaseClient = supabase!;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<CandidateProfile>({
    company_name: '',
    industry: '',
    location: '',
    website: '',
    description: '',
    cv_url: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingCvUrl, setExistingCvUrl] = useState<string>('');

  // Fetch existing candidate profile on mount
  useEffect(() => {
    async function fetchCandidateProfile() {
      if (!userId || !supabaseClient) return;
      
      try {
        const { data, error } = await supabaseClient
          .from('candidates')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data) {
          setProfile({
            company_name: data.company_name || '',
            industry: data.industry || '',
            location: data.location || '',
            website: data.website || '',
            description: data.description || '',
            cv_url: data.cv_url || ''
          });
          setExistingCvUrl(data.cv_url || '');
        }
      } catch (error) {
        console.error('Error fetching candidate profile:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchCandidateProfile();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setToast({ type: 'error', message: 'Please upload a PDF or Word document' });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setToast({ type: 'error', message: 'File size must be less than 10MB' });
        return;
      }
      
      setSelectedFile(file);
      setToast(null);
    }
  };

  // Upload file to Supabase storage
  const uploadFile = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileName = `cv_${userId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabaseClient.storage
        .from('assignments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabaseClient.storage
        .from('assignments')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setToast({ type: 'error', message: 'User not authenticated' });
      return;
    }

    setSaving(true);
    setToast(null);

    try {
      let cvUrl = profile.cv_url;

      // Upload file if selected
      if (selectedFile) {
        setUploadProgress(true);
        const uploadedUrl = await uploadFile(selectedFile, userId);
        setUploadProgress(false);
        
        if (uploadedUrl) {
          cvUrl = uploadedUrl;
        } else {
          setToast({ type: 'error', message: 'Failed to upload CV file' });
          setSaving(false);
          return;
        }
      }

      // Prepare candidate data
      const candidateData = {
        user_id: userId,
        company_name: profile.company_name,
        industry: profile.industry,
        location: profile.location,
        website: profile.website,
        description: profile.description,
        cv_url: cvUrl,
        updated_at: new Date().toISOString()
      };

      // Use upsert to update or insert
      const { error } = await supabaseClient
        .from('candidates')
        .upsert(candidateData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Upsert error:', error);
        setToast({ type: 'error', message: error.message || 'Failed to save profile' });
        return;
      }

      // Success!
      setToast({ type: 'success', message: 'Profile updated successfully!' });
      setSelectedFile(null);
      setExistingCvUrl(cvUrl);
      
      // Trigger callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      setToast({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  // Show toast notification
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-blue)]" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-green-500/20 border border-green-500 text-green-400' 
              : 'bg-red-500/20 border border-red-500 text-red-400'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </motion.div>
      )}

      <motion.div
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-xl p-6"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center space-x-2 mb-6">
          <Building2 className="text-[var(--accent-blue)]" size={24} />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              <Briefcase className="inline w-4 h-4 mr-1" />
              Company Name
            </label>
            <input
              type="text"
              value={profile.company_name}
              onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Enter your company name"
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              <Building2 className="inline w-4 h-4 mr-1" />
              Industry
            </label>
            <select
              value={profile.industry}
              onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] text-[var(--text-primary)]"
            >
              <option value="">Select an industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Marketing">Marketing</option>
              <option value="Consulting">Consulting</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              <MapPin className="inline w-4 h-4 mr-1" />
              Location
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, Country"
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              <Globe className="inline w-4 h-4 mr-1" />
              Website
            </label>
            <input
              type="url"
              value={profile.website}
              onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://your-website.com"
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              <FileText className="inline w-4 h-4 mr-1" />
              Description
            </label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell us about yourself, your experience, and career goals..."
              rows={5}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
            />
          </div>

          {/* CV/Portfolio File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              <Upload className="inline w-4 h-4 mr-1" />
              CV/Portfolio
            </label>
            
            <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-6 text-center hover:border-[var(--accent-blue)] transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-[var(--accent-blue)]" />
                  <div className="text-left">
                    <p className="text-[var(--text-primary)] font-medium">{selectedFile.name}</p>
                    <p className="text-[var(--text-muted)] text-sm">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="ml-4 text-[var(--text-muted)] hover:text-red-400"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ) : existingCvUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="w-10 h-10 text-green-500" />
                  <p className="text-[var(--text-primary)]">CV already uploaded</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[var(--accent-blue)] hover:underline text-sm"
                  >
                    Click to replace
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-10 h-10 text-[var(--text-muted)]" />
                  <p className="text-[var(--text-primary)]">Click to upload CV/Portfolio</p>
                  <p className="text-[var(--text-muted)] text-sm">PDF or Word (max 10MB)</p>
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || uploadProgress}
            className="w-full bg-[var(--accent-blue)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving || uploadProgress ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{uploadProgress ? 'Uploading...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

