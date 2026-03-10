import { useMemo } from 'react';

interface Skill {
  name: string;
  level: string;
  source: 'ai' | 'manual';
}

interface Assignment {
  id: string;
  title: string;
  status: 'Pending' | 'Graded';
}

interface Job {
  title: string;
  company: string;
  location: string;
}

interface CareerIntelligence {
  suggestedRole: string;
  careerColor: string;
  recommendedJobs: Job[];
  localReadinessInsight: string;
}

export function useCareerIntelligence(
  skills: Skill[], 
  assignments: Assignment[]
): CareerIntelligence {
  return useMemo(() => {
    // Check if user has Python as Expert OR has Business Analytics graded
    const isPythonExpert = skills.some(
      s => s.name.toLowerCase().includes('python') && s.level === 'Expert'
    );
    const hasGradedBusinessAssignment = assignments.some(
      a => a.title.toLowerCase().includes('business') && a.status === 'Graded'
    );
    
    // If Python is Expert OR has Business Analytics graded -> Data Scientist
    if (isPythonExpert || hasGradedBusinessAssignment) {
      return {
        suggestedRole: 'Data Scientist',
        careerColor: '#8b5cf6', // Purple
        localReadinessInsight: 'Your profile is a 90% match for top-tier tech roles in Yangon\'s banking and fintech sectors.',
        recommendedJobs: [
          { title: 'Junior Data Analyst', company: 'KBZ Bank', location: 'Yangon, Myanmar' },
          { title: 'Business Intelligence Developer', company: 'Wave Money', location: 'Yangon, Myanmar' },
          { title: 'Data Scientist', company: 'MPT', location: 'Yangon, Myanmar' }
        ]
      };
    }
    
    // Otherwise -> Web Developer
    return {
      suggestedRole: 'Web Developer',
      careerColor: '#0070f3', // Blue
      localReadinessInsight: 'Your profile is a 90% match for top-tier tech roles in Yangon\'s banking and fintech sectors.',
      recommendedJobs: [
        { title: 'Frontend Engineer', company: 'NexLabs', location: 'Yangon, Myanmar' },
        { title: 'React Developer', company: '7Days Digital', location: 'Yangon, Myanmar' },
        { title: 'Full Stack Developer', company: 'Dot-Mill', location: 'Remote (Myanmar)' }
      ]
    };
  }, [skills, assignments]);
}

// Default career intelligence for pages without skills/assignments
export function useDefaultCareerIntelligence(): CareerIntelligence {
  return useMemo(() => {
    return {
      suggestedRole: 'Web Developer',
      careerColor: '#0070f3',
      localReadinessInsight: 'Your profile is a 90% match for top-tier tech roles in Yangon\'s banking and fintech sectors.',
      recommendedJobs: [
        { title: 'Frontend Engineer', company: 'NexLabs', location: 'Yangon, Myanmar' },
        { title: 'React Developer', company: '7Days Digital', location: 'Yangon, Myanmar' },
        { title: 'Full Stack Developer', company: 'Dot-Mill', location: 'Remote (Myanmar)' }
      ]
    };
  }, []);
}
