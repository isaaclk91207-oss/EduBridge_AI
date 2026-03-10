-- Fix RLS policy for user_assignments table to allow inserts without authentication
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own assignments" ON user_assignments;
DROP POLICY IF EXISTS "Users can insert own assignments" ON user_assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON user_assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON user_assignments;

-- Create new policies that allow inserts for any user (authenticated or not)
-- This allows users to upload assignments without being logged in via Supabase Auth
CREATE POLICY "Anyone can view assignments" ON user_assignments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert assignments" ON user_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update assignments" ON user_assignments
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete assignments" ON user_assignments
  FOR DELETE USING (true);

-- If you want to restrict to only authenticated users, use this instead:
/*
CREATE POLICY "Users can view own assignments" ON user_assignments
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'anonymous');

CREATE POLICY "Users can insert own assignments" ON user_assignments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own assignments" ON user_assignments
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own assignments" ON user_assignments
  FOR DELETE USING (auth.uid()::text = user_id);
*/
