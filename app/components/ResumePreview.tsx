'use client';

import React from 'react';
import { FileText, Mail, Linkedin, Github, Phone, Award, CheckCircle } from 'lucide-react';

interface Skill {
  name: string;
  level: string;
  source: 'ai' | 'manual';
}

interface Project {
  title: string;
  description: string;
  link: string;
  source: 'ai' | 'manual';
}

interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface ResumePreviewProps {
  name: string;
  title: string;
  email: string;
  linkedin: string;
  github: string;
  phone?: string;
  university: string;
  major: string;
  graduationYear: string;
  cgpa: string;
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  suggestedRole: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  name,
  title,
  email,
  linkedin,
  github,
  phone = '+95 9XXXXXXXXX',
  university,
  major,
  graduationYear,
  cgpa,
  skills,
  projects,
  experiences,
  suggestedRole,
}) => {
  // Generate AI-verified summary based on suggested role and skills
  const generateSummary = () => {
    const skillNames = skills.map(s => s.name).join(', ');
    const expertiseLevel = skills.some(s => s.level === 'Expert') ? 'extensive' : 
                          skills.some(s => s.level === 'Advanced') ? 'strong' : 
                          skills.some(s => s.level === 'Intermediate') ? 'solid' : 'growing';
    
    return `A highly skilled ${suggestedRole} with verified expertise in ${skillNames}, ready for the Myanmar tech sector. Possesses ${expertiseLevel} practical experience in developing innovative solutions and is well-prepared to contribute to Yangon-based tech companies and fintech startups.`;
  };

  // Get skill badge color based on level
  const getSkillBadgeColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Advanced': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Intermediate': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white text-gray-900 p-8 max-w-4xl mx-auto shadow-lg print:shadow-none print:p-0">
      {/* Header Section */}
      <header className="border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
        <p className="text-xl text-[#0070f3] font-medium mt-1">{title}</p>
        
        {/* Contact Information */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-[#0070f3]">
            <Mail size={14} /> {email}
          </a>
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#0070f3]">
            <Linkedin size={14} /> LinkedIn
          </a>
          <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#0070f3]">
            <Github size={14} /> GitHub
          </a>
          <span className="flex items-center gap-1">
            <Phone size={14} /> {phone}
          </span>
        </div>
      </header>

      {/* AI-Verified Summary Section */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Award size={18} className="text-[#0070f3]" />
          <h2 className="text-lg font-bold text-gray-900">Professional Summary</h2>
          <span className="bg-[#0070f3]/10 text-[#0070f3] text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle size={12} /> AI-Generated
          </span>
        </div>
        <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
          {generateSummary()}
        </p>
      </section>

      {/* Skills Section with AI Verification */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Award size={18} className="text-[#0070f3]" />
          <h2 className="text-lg font-bold text-gray-900">Skills</h2>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
            AI Verified
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span 
              key={index} 
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getSkillBadgeColor(skill.level)} flex items-center gap-1`}
            >
              {skill.name}
              {skill.source === 'ai' && <CheckCircle size={12} />}
              <span className="text-xs opacity-75 ml-1">({skill.level})</span>
            </span>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Award size={18} className="text-[#0070f3]" />
          <h2 className="text-lg font-bold text-gray-900">Education</h2>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{university}</h3>
              <p className="text-gray-700">{major}</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Graduated: {graduationYear}</p>
              <p>CGPA: {cgpa}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Work Experience Section */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Award size={18} className="text-[#0070f3]" />
          <h2 className="text-lg font-bold text-gray-900">Work Experience</h2>
        </div>
        <div className="space-y-3">
          {experiences.map((exp, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                  <p className="text-gray-700">{exp.company}</p>
                </div>
                <span className="text-sm text-gray-500">{exp.duration}</span>
              </div>
              <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={18} className="text-[#0070f3]" />
          <h2 className="text-lg font-bold text-gray-900">Projects</h2>
        </div>
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900">{project.title}</h3>
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#0070f3] text-sm hover:underline"
                >
                  View Project →
                </a>
              </div>
              <p className="text-gray-600 mt-1 text-sm">{project.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 pt-4 mt-8 text-center text-sm text-gray-500">
        <p>Generated by EduBridge AI - Myanmar's Premier Business & IT Student Ecosystem</p>
        <p className="mt-1">Verified Resume for Myanmar Job Market</p>
      </footer>
    </div>
  );
};

export default ResumePreview;
