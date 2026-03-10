// Dynamic CV Generator - Export Student Profile to PDF
// Uses jsPDF library for PDF generation

import { jsPDF } from 'jspdf';

interface StudentProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certificates: Certificate[];
  projects?: Project[];
  avatarUrl?: string;
}

interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
}

interface Certificate {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

interface Project {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
}

export async function generateCV(profile: StudentProfile): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  const checkNewPage = (neededSpace: number) => {
    if (yPosition + neededSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  const primaryColor: [number, number, number] = [37, 99, 235];
  const textColor: [number, number, number] = [30, 30, 30];
  const secondaryColor: [number, number, number] = [100, 100, 100];

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  if (profile.avatarUrl) {
    try {
      doc.addImage(profile.avatarUrl, 'JPEG', margin, 8, 30, 30);
    } catch {
      doc.setFillColor(255, 255, 255);
      doc.circle(margin + 15, 23, 15, 'F');
    }
  } else {
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 15, 23, 15, 'F');
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.text(profile.name.charAt(0).toUpperCase(), margin + 15, 28, { align: 'center' });
  }

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.name, margin + 45, 20);

  if (profile.headline) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.headline, margin + 45, 30);
  }

  doc.setFontSize(10);
  const contactInfo = [
    profile.email,
    profile.phone,
    profile.location,
  ].filter(Boolean).join(' | ');
  doc.text(contactInfo, margin + 45, 38);

  yPosition = 55;

  if (profile.summary) {
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL SUMMARY', margin, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    
    const summaryLines = doc.splitTextToSize(profile.summary, contentWidth);
    doc.text(summaryLines, margin, yPosition);
    yPosition += summaryLines.length * 5 + 10;
  }

  if (profile.skills && profile.skills.length > 0) {
    checkNewPage(25);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('SKILLS', margin, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    
    const skillsPerRow = 4;
    for (let i = 0; i < profile.skills.length; i += skillsPerRow) {
      const rowSkills = profile.skills.slice(i, i + skillsPerRow);
      doc.text(rowSkills.join(' • '), margin, yPosition);
      yPosition += 6;
    }
    yPosition += 5;
  }

  if (profile.experience && profile.experience.length > 0) {
    checkNewPage(40);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPERIENCE', margin, yPosition);
    yPosition += 8;

    profile.experience.forEach((exp) => {
      checkNewPage(25);
      
      doc.setFontSize(12);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.role, margin, yPosition);
      
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      const dateRange = exp.current 
        ? `${exp.startDate} - Present` 
        : `${exp.startDate} - ${exp.endDate || 'Present'}`;
      doc.text(dateRange, pageWidth - margin, yPosition, { align: 'right' });
      
      yPosition += 6;
      
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'normal');
      doc.text(exp.company, margin, yPosition);
      yPosition += 6;
      
      if (exp.description) {
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        const descLines = doc.splitTextToSize(exp.description, contentWidth);
        doc.text(descLines, margin, yPosition);
        yPosition += descLines.length * 5;
      }
      yPosition += 8;
    });
  }

  if (profile.education && profile.education.length > 0) {
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATION', margin, yPosition);
    yPosition += 8;

    profile.education.forEach((edu) => {
      checkNewPage(20);
      
      doc.setFontSize(12);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree, margin, yPosition);
      
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      const eduDate = edu.endDate ? `${edu.startDate} - ${edu.endDate}` : edu.startDate;
      doc.text(eduDate, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 6;
      
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'normal');
      doc.text(edu.institution, margin, yPosition);
      if (edu.field) {
        doc.text(` - ${edu.field}`, margin + doc.getTextWidth(edu.institution), yPosition);
      }
      yPosition += 12;
    });
  }

  if (profile.certificates && profile.certificates.length > 0) {
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATIONS', margin, yPosition);
    yPosition += 8;

    profile.certificates.forEach((cert) => {
      checkNewPage(15);
      
      doc.setFontSize(11);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(cert.name, margin, yPosition);
      
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.text(`${cert.issuer} - ${cert.date}`, margin, yPosition + 5);
      yPosition += 12;
    });
  }

  if (profile.projects && profile.projects.length > 0) {
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECTS', margin, yPosition);
    yPosition += 8;

    profile.projects.forEach((project) => {
      checkNewPage(20);
      
      doc.setFontSize(11);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(project.name, margin, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      if (project.technologies && project.technologies.length > 0) {
        doc.text(`Technologies: ${project.technologies.join(', ')}`, margin, yPosition);
        yPosition += 5;
      }
      
      doc.setTextColor(...textColor);
      const descLines = doc.splitTextToSize(project.description, contentWidth);
      doc.text(descLines, margin, yPosition);
      yPosition += descLines.length * 5 + 5;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(
      `Generated by EduBridge AI | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

export function downloadCV(profile: StudentProfile, filename?: string): void {
  generateCV(profile).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${profile.name.replace(/\s+/g, '_')}_CV.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

export async function generateCVFromSupabase(userId: string): Promise<void> {
  const { supabase: supabaseClient } = await import('@/lib/supabase');
  
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('Profile error:', profileError);
    throw new Error('Profile not found');
  }

  const [certificatesRes] = await Promise.all([
    supabaseClient.from('certificates').select('*').eq('user_id', userId),
  ]);

  const cvProfile: StudentProfile = {
    name: profile.full_name || 'Student',
    email: profile.email || '',
    phone: profile.phone,
    location: profile.location,
    headline: profile.headline,
    summary: profile.bio,
    skills: profile.skills || [],
    experience: [],
    education: profile.education || [],
    certificates: certificatesRes.data || [],
  };

  downloadCV(cvProfile, `${profile.full_name}_CV.pdf`);
}
