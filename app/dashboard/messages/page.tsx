'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Users, Globe, Loader2 } from 'lucide-react';

export default function MessagesPage() {
  const [userType, setUserType] = useState<string>('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const type = localStorage.getItem('edubridge_user_type') || 'student';
    setUserType(type);
    setLoading(false);
  }, []);

  const handleJoinCommunity = () => {
    let message = '';
    
    if (userType === 'employer') {
      message = 'I am an Employer joining the Edubridge Community to connect with talented students.';
    } else if (userType === 'private_student') {
      message = 'I am a Private Student joining the Edubridge Community.';
    } else if (userType === 'public_student') {
      message = 'I am a Public Student joining the Edubridge Community.';
    } else if (userType === 'non_graduate') {
      message = 'I am a Non-Graduate joining the Edubridge Community.';
    } else {
      message = 'I am joining the Edubridge Community.';
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://t.me/edubridge_community?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[var(--accent-blue)]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Community Hub</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Connect with students, employers, and the Edubridge network
        </p>

        <div className="grid gap-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-[var(--accent-blue)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="text-[var(--accent-blue)]" size={40} />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Join the Edubridge Community</h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              Connect with {userType === 'employer' ? 'talented students and graduates' : 'employers and fellow students'} through our Telegram community.
            </p>

            <button
              onClick={handleJoinCommunity}
              className="px-8 py-4 bg-[var(--accent-blue)] hover:opacity-90 rounded-xl font-semibold text-white transition-all flex items-center space-x-2 mx-auto"
            >
              <MessageCircle size={20} />
              <span>Join Community</span>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6">
              <Users className="text-[var(--accent-blue)] mb-3" size={24} />
              <h3 className="font-semibold mb-2">Network</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Connect with students, employers, and educators
              </p>
            </div>
            
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6">
              <MessageCircle className="text-green-500 mb-3" size={24} />
              <h3 className="font-semibold mb-2">Real-time Chat</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Get instant responses and support
              </p>
            </div>
            
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6">
              <Globe className="text-purple-500 mb-3" size={24} />
              <h3 className="font-semibold mb-2">Global Access</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Access from anywhere, anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

