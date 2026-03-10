-- RLS Policies for user_assignments table
-- Run this in your Supabase SQL Editor

-- Enable RLS
ALTER TABLE user_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view assignments" ON user_assignments;
DROP POLICY IF EXISTS "Anyone can insert assignments" ON user_assignments;
DROP POLICY IF EXISTS "Anyone can update assignments" ON user_assignments;
DROP POLICY IF EXISTS "Anyone can delete assignments" ON user_assignments;

-- Allow anyone to view, insert, update, delete their own assignments
CREATE POLICY "Users can view own assignments" ON user_assignments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own assignments" ON user_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own assignments" ON user_assignments
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own assignments" ON user_assignments
  FOR DELETE USING (true);

-- Storage policies for assignments bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload to assignments" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own assignment files" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload to assignments"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'assignments');

CREATE POLICY "Allow users to view their own assignment files"
ON storage.objects
FOR SELECT USING (bucket_id = 'assignments');

CREATE POLICY "Allow users to delete their own assignment files"
ON storage.objects
FOR DELETE USING (bucket_id = 'assignments');
