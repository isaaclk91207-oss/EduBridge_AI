-- ============================================
-- EduBridge AI - Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- SECTION 1: USER PROGRESS & CERTIFICATES
-- ============================================

-- 1. User Progress Table (for Active Courses & Certificates)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID,
  course_name TEXT,
  status TEXT DEFAULT 'in_progress', -- 'enrolled', 'in_progress', 'completed'
  progress_percentage INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_id UUID,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID,
  course_name TEXT NOT NULL,
  certificate_number TEXT UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT,
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- SECTION 2: MESSAGING & NOTIFICATIONS
-- ============================================

-- 3. Messages Table (for Employer-Student Chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'message', 'application', 'certificate', 'course'
  title TEXT NOT NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 3: LECTURE PROGRESS & COURSES
-- ============================================

-- 6. Lecture Progress Table (tracks individual lecture progress)
CREATE TABLE IF NOT EXISTS lecture_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL,
  lecture_id UUID NOT NULL,
  status TEXT DEFAULT 'in_progress', -- 'not_started', 'in_progress', 'completed'
  watch_time_seconds INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id, lecture_id)
);

-- 7. Course Lectures Table (to track all lectures in a course)
CREATE TABLE IF NOT EXISTS course_lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INT DEFAULT 0,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Employee Notification Table (for employer dashboard sync)
CREATE TABLE IF NOT EXISTS employee_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'course_completed', 'profile_match', 'new_application'
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 4: EMPLOYER INTERESTS
-- ============================================

-- 9. Employer Interests Table (for tracking candidate contacts)
CREATE TABLE IF NOT EXISTS employer_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id INTEGER NOT NULL,
  employer_id TEXT NOT NULL,
  interest_type TEXT NOT NULL DEFAULT 'contact', -- 'contact', 'hire', 'view'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 5: ASSIGNMENTS
-- ============================================

-- 10. User Assignments Table
CREATE TABLE IF NOT EXISTS user_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT,
  course_id TEXT,
  course_name TEXT,
  assignment_title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  status TEXT DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graded_at TIMESTAMP WITH TIME ZONE,
  grade TEXT,
  feedback TEXT
);

-- 11. Assignment Notifications Table (for Employer Dashboard)
CREATE TABLE IF NOT EXISTS assignment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT,
  course_id TEXT,
  course_name TEXT,
  assignment_title TEXT,
  file_name TEXT,
  file_url TEXT,
  notification_type TEXT DEFAULT 'assignment_submitted',
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 6: INDEXES FOR PERFORMANCE
-- ============================================

-- User Progress indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);

-- Certificates indexes
CREATE INDEX idx_certificates_user_id ON certificates(user_id);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Conversations indexes
CREATE INDEX idx_conversations_participant ON conversations(participant1_id, participant2_id);

-- Lecture Progress indexes
CREATE INDEX idx_lecture_progress_user_course ON lecture_progress(user_id, course_id);
CREATE INDEX idx_lecture_progress_user ON lecture_progress(user_id);

-- Course Lectures indexes
CREATE INDEX idx_course_lectures_course ON course_lectures(course_id);

-- Employee Notifications indexes
CREATE INDEX idx_employee_notifications_employer ON employee_notifications(employer_id);

-- Employer Interests indexes
CREATE INDEX idx_employer_interests_candidate_id ON employer_interests(candidate_id);
CREATE INDEX idx_employer_interests_employer_id ON employer_interests(employer_id);

-- User Assignments indexes
CREATE INDEX idx_user_assignments_user_id ON user_assignments(user_id);
CREATE INDEX idx_user_assignments_course_id ON user_assignments(course_id);

-- Assignment Notifications indexes
CREATE INDEX idx_notifications_employer_id ON assignment_notifications(employer_id);
CREATE INDEX idx_notifications_is_read ON assignment_notifications(is_read);

-- ============================================
-- SECTION 7: REALTIME CONFIGURATION
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE lecture_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE user_progress;

-- ============================================
-- SECTION 8: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 9: RLS POLICIES
-- ============================================

-- User Progress Policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own progress" ON user_progress
  FOR INSERT ON user_progress
  WITH CHECK (auth.uid() = user_id);

-- Certificates Policies
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

-- Messages Policies (participants can view)
CREATE POLICY "Participants can view messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Conversations Policies
CREATE POLICY "Participants can view conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  );

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Lecture Progress Policies
CREATE POLICY "Users can view own lecture progress" ON lecture_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lecture progress" ON lecture_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lecture progress" ON lecture_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Course Lectures Policies (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view course lectures" ON course_lectures
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Employee Notifications Policies
CREATE POLICY "Employers can view own notifications" ON employee_notifications
  FOR SELECT USING (auth.uid() = employer_id);

-- Employer Interests Policies
CREATE POLICY "Employers can view own interests" ON employer_interests
  FOR SELECT USING (employer_id = auth.uid()::text);

-- User Assignments Policies
CREATE POLICY "Users can view own assignments" ON user_assignments
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own assignments" ON user_assignments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own assignments" ON user_assignments
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own assignments" ON user_assignments
  FOR DELETE USING (auth.uid()::text = user_id);

-- Assignment Notifications Policies
CREATE POLICY "Employers can view all notifications" ON assignment_notifications
  FOR SELECT USING (true);

CREATE POLICY "Auto insert notifications" ON assignment_notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- SECTION 10: STORAGE POLICIES
-- ============================================

-- Storage: Allow authenticated users to upload to assignments bucket
CREATE POLICY "Allow authenticated users to upload to assignments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage: Allow users to view their own assignment files
CREATE POLICY "Allow users to view their own assignment files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assignments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage: Allow users to delete their own assignment files
CREATE POLICY "Allow users to delete their own assignment files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'assignments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage: Allow users to update their own assignment files
CREATE POLICY "Allow users to update their own assignment files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assignments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- SECTION 11: FUNCTIONS & TRIGGERS
-- ============================================

-- 1. PostgreSQL Function to calculate course progress
CREATE OR REPLACE FUNCTION calculate_course_progress(user_uuid UUID, course_uuid UUID)
RETURNS TABLE (
  progress_percentage NUMERIC,
  completed_lectures INT,
  total_lectures INT,
  status TEXT
) AS $$
DECLARE
  completed_count INT;
  total_count INT;
  progress_val NUMERIC;
  status_val TEXT;
BEGIN
  -- Get total lectures in the course
  SELECT COUNT(*) INTO total_count
  FROM course_lectures
  WHERE course_id = course_uuid;
  
  -- Get completed lectures count
  SELECT COUNT(*) INTO completed_count
  FROM lecture_progress
  WHERE user_id = user_uuid 
    AND course_id = course_uuid 
    AND status = 'completed';
  
  -- Calculate percentage
  IF total_count > 0 THEN
    progress_val := ROUND((completed_count::NUMERIC / total_count::NUMERIC) * 100, 2);
  ELSE
    progress_val := 0;
  END IF;
  
  -- Determine status
  IF completed_count = 0 THEN
    status_val := 'not_started';
  ELSIF completed_count = total_count AND total_count > 0 THEN
    status_val := 'completed';
  ELSE
    status_val := 'in_progress';
  END IF;
  
  RETURN QUERY SELECT progress_val, completed_count, total_count, status_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to update user_progress when lecture is completed
CREATE OR REPLACE FUNCTION on_lecture_completed()
RETURNS TRIGGER AS $$
DECLARE
  course_progress RECORD;
BEGIN
  -- Only proceed if status changed to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calculate new progress
    SELECT * INTO course_progress
    FROM calculate_course_progress(NEW.user_id, NEW.course_id);
    
    -- Update or insert into user_progress
    INSERT INTO user_progress (user_id, course_id, status, progress_percentage, completed_at, updated_at)
    VALUES (
      NEW.user_id, 
      NEW.course_id, 
      course_progress.status,
      course_progress.progress_percentage,
      CASE WHEN course_progress.status = 'completed' THEN NOW() ELSE NULL END,
      NOW()
    )
    ON CONFLICT (user_id, course_id) 
    DO UPDATE SET
      status = course_progress.status,
      progress_percentage = course_progress.progress_percentage,
      completed_at = CASE 
        WHEN course_progress.status = 'completed' AND user_progress.status != 'completed' THEN NOW() 
        ELSE user_progress.completed_at 
      END,
      updated_at = NOW();
    
    -- If course completed, trigger notification
    IF course_progress.status = 'completed' THEN
      -- Insert notification for the student
      INSERT INTO notifications (user_id, type, title, content)
      VALUES (
        NEW.user_id,
        'certificate',
        '🎉 Course Completed!',
        'Congratulations! You have completed the course. Your AI-Verified Profile has been updated.'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger for lecture completion
DROP TRIGGER IF EXISTS trigger_lecture_completed ON lecture_progress;
CREATE TRIGGER trigger_lecture_completed
  AFTER UPDATE ON lecture_progress
  FOR EACH ROW
  EXECUTE FUNCTION on_lecture_completed();

-- 4. Function to notify employers when student completes course
CREATE OR REPLACE FUNCTION notify_employers_on_course_complete(student_uuid UUID, course_uuid UUID)
RETURNS void AS $$
DECLARE
  course_name TEXT;
  matching_employers RECORD;
BEGIN
  -- Get course name
  SELECT title INTO course_name
  FROM course_lectures
  WHERE course_id = course_uuid
  LIMIT 1;
  
  -- Find matching employers (those who have posted jobs matching student's skills)
  FOR matching_employers IN
    SELECT DISTINCT e.user_id as employer_id
    FROM user_progress up
    JOIN job_posts j ON j.required_skills @> (
      SELECT jsonb_agg(DISTINCT skill)
      FROM user_skills us
      WHERE us.user_id = student_uuid
    )
    WHERE up.user_id = student_uuid
  LOOP
    INSERT INTO employee_notifications (employer_id, student_id, type, title, content, metadata)
    VALUES (
      matching_employers.employer_id,
      student_uuid,
      'course_completed',
      '📚 Student Course Completed',
      jsonb_build_object(
        'message', 'A student has completed a course: ' || COALESCE(course_name, 'Unknown Course'),
        'student_id', student_uuid,
        'course_id', course_uuid
      )::text
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to Handle Assignment Upload & Notification
CREATE OR REPLACE FUNCTION handle_assignment_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for employer
  INSERT INTO assignment_notifications (
    employer_id,
    student_id,
    student_name,
    course_id,
    course_name,
    assignment_title,
    file_name,
    file_url,
    notification_type,
    message
  )
  SELECT 
    'employer' AS employer_id,
    NEW.user_id,
    NEW.user_name,
    NEW.course_id,
    NEW.course_name,
    NEW.assignment_title,
    NEW.file_name,
    NEW.file_url,
    'assignment_submitted',
    'New Assignment Submitted by ' || COALESCE(NEW.user_name, 'Student') || ' for ' || COALESCE(NEW.course_name, 'Course') || ': ' || NEW.assignment_title
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create Trigger for Assignment Upload
DROP TRIGGER IF EXISTS assignment_upload_trigger ON user_assignments;
CREATE TRIGGER assignment_upload_trigger
  AFTER INSERT ON user_assignments
  FOR EACH ROW
  EXECUTE FUNCTION handle_assignment_upload();

-- ============================================
-- SECTION 12: CANDIDATES (AI PORTFOLIO)
-- ============================================

-- Candidates Table (for AI Portfolio / Edit Profile)
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT,
  industry TEXT,
  location TEXT,
  website TEXT,
  description TEXT,
  cv_url TEXT,
  skills JSONB DEFAULT '[]',
  experience_years INT DEFAULT 0,
  is_open_to_work BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates Table Indexes
CREATE INDEX idx_candidates_user_id ON candidates(user_id);

-- Enable RLS on candidates table
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Candidates RLS Policies
CREATE POLICY "Users can view own candidate profile" ON candidates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own candidate profile" ON candidates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own candidate profile" ON candidates
  FOR UPDATE USING (auth.uid() = user_id);

-- Employers can view candidate profiles
CREATE POLICY "Employers can view all candidates" ON candidates
  FOR SELECT TO authenticated
  USING (true);

-- Add candidates to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE candidates;

-- ============================================
-- SECTION 13: VIEWS
-- ============================================

-- Create a view that aliases candidates to students_portfolios
CREATE OR REPLACE VIEW students_portfolios AS 
SELECT * FROM candidates;

-- ============================================
-- SECTION 14: ADDITIONAL COLUMNS
-- ============================================

-- Add Telegram username field to candidates (if not exists)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS discord_webhook_url TEXT;

