"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, ExternalLink, X, MapPin, Clock, Briefcase, Mail, Loader2, Github, Linkedin, Twitter, Edit2, Upload, FileText, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { sendDiscordWebhook, recordEmployerInterest } from "@/lib/telegram-discord";

interface Candidate {
  id: number;
  name: string;
  role: string;
  skills: string[];
  match_score: number;
  experience?: string;
  summary?: string;
  location?: string;
}

interface EmployerProfile {
  company_name: string;
  industry: string;
  location: string;
  description: string;
  website: string;
  cv_url: string;
}

export default function EmployeeDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<EmployerProfile>({
    company_name: '',
    industry: '',
    location: '',
    description: '',
    website: '',
    cv_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchCandidates() {
      setIsLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error("Supabase client not initialized");
        }

        const { data, error: supabaseError } = await supabase
          .from("candidates")
          .select("*")
          .order("match_score", { ascending: false });

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        const candidatesData = data || [];
        
        const transformed = candidatesData.map((c) => ({
          ...c,
          skills: typeof c.skills === "string" 
            ? c.skills.split(",").map((s: string) => s.trim())
            : c.skills || []
        }));
        
        setCandidates(transformed);
        setFilteredCandidates(transformed);
      } catch (err: any) {
        console.error("Error fetching candidates:", err);
        setError(err.message || "Failed to load candidates");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCandidates();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCandidates(candidates);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = candidates.filter(
        (candidate) =>
          candidate.name?.toLowerCase().includes(query) ||
          candidate.role?.toLowerCase().includes(query) ||
          candidate.skills?.some((skill) => skill.toLowerCase().includes(query))
      );
      setFilteredCandidates(filtered);
    }
  }, [searchQuery, candidates]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 80) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const handleViewPortfolio = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleCloseModal = () => {
    setSelectedCandidate(null);
  };

  const handleHire = async (candidate: Candidate) => {
    console.log("Hire clicked for:", candidate.name);
    const discordSent = await sendDiscordWebhook(candidate, "Employer (Hire)");
    const employerId = localStorage.getItem('edubridge_user_id') || 'anonymous';
    await recordEmployerInterest(candidate.id, employerId, 'hire');
    
    if (discordSent) {
      alert(`Hire request sent for ${candidate.name}! The team has been notified.`);
    } else {
      alert(`Hire request sent for ${candidate.name}!`);
    }
  };

  const handleContact = async (candidate: Candidate) => {
    console.log("Contact clicked for:", candidate.name);
    const skillsList = candidate.skills?.slice(0, 5).join(", ") || "Not specified";
    const telegramMessage = `I want to hire ${candidate.name}. Match: ${candidate.match_score}%. Skills: ${skillsList}.`;
    const encodedMessage = encodeURIComponent(telegramMessage);
    const telegramUrl = `https://t.me/Edubridge_AI2026?text=${encodedMessage}`;
    window.open(telegramUrl, "_blank");
    
    await sendDiscordWebhook(candidate, "Employer (Contact)");
    const employerId = localStorage.getItem('edubridge_user_id') || 'anonymous';
    await recordEmployerInterest(candidate.id, employerId, 'contact');
    console.log("Contact workflow completed for:", candidate.name);
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      const savedProfile = localStorage.getItem('employer_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let cvUrl = profile.cv_url;

      if (selectedFile) {
        const supabaseClient = supabase;
        if (supabaseClient) {
          const fileName = `employer_cv/${Date.now()}_${selectedFile.name}`;
          const { error } = await supabaseClient
            .storage
            .from('assignments')
            .upload(fileName, selectedFile);

          if (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please try again.');
            setIsSaving(false);
            return;
          }

          const { data: { publicUrl } } = supabaseClient
            .storage
            .from('assignments')
            .getPublicUrl(fileName);
          
          cvUrl = publicUrl;
        }
      }

      const updatedProfile = { ...profile, cv_url: cvUrl };
      localStorage.setItem('employer_profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      
      alert('Profile updated successfully!');
      setIsEditMode(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSelectedFile(null);
    const savedProfile = localStorage.getItem('employer_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile({
        company_name: '',
        industry: '',
        location: '',
        description: '',
        website: '',
        cv_url: ''
      });
    }
  };

  const handleProfileChange = (field: keyof EmployerProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-[var(--text-primary)]">AI Portfolios</h1>
          <p className="text-[var(--text-secondary)]">Browse candidates from AI-generated portfolios</p>
        </div>
        
        {/* Edit Profile Button */}
        <button
          onClick={handleEditToggle}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-blue)] hover:opacity-90 text-white rounded-lg transition-colors"
        >
          <Edit2 size={18} />
          {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
        </button>
        
        {/* Social Media Links */}
        <div className="flex gap-3">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <Github className="w-5 h-5 text-[var(--accent-blue)]" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <Linkedin className="w-5 h-5 text-[var(--accent-blue)]" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <Twitter className="w-5 h-5 text-[var(--accent-blue)]" />
          </a>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
          <input
            type="text"
            placeholder="Search by name, role or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
          />
        </div>
      </div>

      {/* Edit Profile Section */}
      {isEditMode && (
        <div className="max-w-7xl mx-auto mb-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Edit Your Profile</h2>
            <button
              onClick={handleCancelEdit}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-muted)]"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Company Name</label>
              <input
                type="text"
                value={profile.company_name}
                onChange={(e) => handleProfileChange('company_name', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)]"
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Industry</label>
              <input
                type="text"
                value={profile.industry}
                onChange={(e) => handleProfileChange('industry', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)]"
                placeholder="e.g., Technology, Finance, Healthcare"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleProfileChange('location', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)]"
                placeholder="City, Country"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Website</label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => handleProfileChange('website', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)]"
                placeholder="https://yourcompany.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => handleProfileChange('description', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)] h-24 resize-none"
                placeholder="Tell candidates about your company..."
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Upload CV/Portfolio</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                >
                  <Upload size={18} />
                  {selectedFile ? selectedFile.name : 'Choose file'}
                </button>
                {profile.cv_url && !selectedFile && (
                  <a
                    href={profile.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[var(--accent-blue)] text-sm"
                  >
                    <FileText size={16} />
                    View current file
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg hover:opacity-80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[var(--accent-blue)] animate-spin mr-2" />
            <span className="text-[var(--text-secondary)]">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="max-w-7xl mx-auto mb-4">
            <p className="text-[var(--text-secondary)] text-sm">Showing {filteredCandidates.length} candidates</p>
          </div>

          {/* Candidate Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[var(--accent-blue)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)]">{candidate.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(candidate.match_score)}`}>
                    {candidate.match_score}%
                  </span>
                </div>

                <p className="text-[var(--text-secondary)] text-sm mb-3">{candidate.role}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {(candidate.skills || []).map((skill, i) => (
                    <span key={i} className="text-xs bg-[var(--bg-tertiary)] text-[var(--accent-blue)] px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => handleViewPortfolio(candidate)}
                  className="w-full py-2 bg-[var(--accent-blue)] hover:opacity-90 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  View Portfolio
                  <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCandidates.length === 0 && (
            <div className="max-w-7xl mx-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-8 text-center">
              <p className="text-[var(--text-secondary)]">
                {searchQuery ? "No candidates match your search." : "No candidates available."}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal for Candidate Details */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="h-24 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-t-2xl">
              <button onClick={handleCloseModal} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30">
                <X size={18} className="text-white" />
              </button>
            </div>
            <div className="px-6 pb-6 -mt-12">
              <div className="w-16 h-16 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center border-4 border-[var(--bg-secondary)] shadow-md">
                <User className="w-8 h-8 text-[var(--accent-blue)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mt-3">{selectedCandidate.name}</h2>
              <p className="text-[var(--accent-blue)] font-medium">{selectedCandidate.role}</p>
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium mt-2 ${getScoreColor(selectedCandidate.match_score)}`}>
                {selectedCandidate.match_score}% Match
              </span>

              <div className="mt-5 space-y-3">
                <div className="flex gap-4 text-[var(--text-secondary)] text-sm">
                  {selectedCandidate.location && (
                    <span className="flex items-center gap-1"><MapPin size={14} /> {selectedCandidate.location}</span>
                  )}
                  {selectedCandidate.experience && (
                    <span className="flex items-center gap-1"><Clock size={14} /> {selectedCandidate.experience}</span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {(selectedCandidate.skills || []).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--accent-blue)] text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">About</h4>
                  <p className="text-[var(--text-primary)] text-sm bg-[var(--bg-tertiary)] p-3 rounded-lg">
                    {selectedCandidate.summary || "No summary available."}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleContact(selectedCandidate)} className="flex-1 py-2 bg-[var(--accent-blue)] hover:opacity-90 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                    <Mail size={16} /> Contact
                  </button>
                  <button onClick={() => handleHire(selectedCandidate)} className="flex-1 py-2 bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                    <Briefcase size={16} /> Hire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

