'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // သင့် path အမှန်ဖြစ်ပါစေ

// ပိုမိုကောင်းမွန်သော TypeScript typing အတွက်
interface Assignment {
  id: string;
  assignment_title: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

export default function AssignmentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true); // Data ဆွဲထုတ်နေခြင်းကို စစ်ဆေးရန် state
  const [submissions, setSubmissions] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }
      const { data, error } = await supabase
        .from('user_assignments')
        .select('*')
        .order('created_at', { ascending: false }); 
      
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err: any) {
      setError("Data Fetching Error - " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!file || !assignmentTitle.trim()) {
      setError('Please provide both an assignment title and a file.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`; // File name တွင် space များဖယ်ရှားခြင်း
      
      // 1. Storage သို့ တင်ခြင်း
      const { error: uploadError } = await supabase.storage
        .from('assignments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. URL ရယူခြင်း
      const { data: { publicUrl } } = supabase.storage.from('assignments').getPublicUrl(fileName);
      
      // 3. Database သို့ သိမ်းခြင်း
      const { error: dbError } = await supabase.from('user_assignments').insert({
        assignment_title: assignmentTitle,
        file_url: publicUrl,
        file_name: file.name
      });

      if (dbError) throw dbError;

      setSuccess('Assignment submitted successfully!');
      setFile(null);
      setAssignmentTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchSubmissions();
    } catch (err: any) {
      setError('Error - ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">Assignment Submission</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {success && <p className="text-green-600 mb-4">{success}</p>}

      <div className="bg-white p-6 rounded-lg shadow border mb-8">

        <input className="w-full mb-4 p-2 border rounded" placeholder="Assignment Title"
          value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} />

        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} ref={fileInputRef} />

        <button onClick={handleSubmit} disabled={submitting} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">
          {submitting ? 'Submitting...' : 'Submit Assignment'}
        </button>

      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">All Submissions</h2>
        {submissions.map((s) => (
          <div key={s.id} className="p-4 border-b">
            <p className="font-medium">{s.assignment_title}</p>
            <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm">View File</a>
          </div>
        ))}
      </div>

    </div>
  );

} 