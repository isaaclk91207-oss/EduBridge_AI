-- Student Analyses Table for AI Career Scanner
-- Run this in your Supabase SQL Editor

-- Create student_analyses table
CREATE TABLE IF NOT EXISTS student_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  summary TEXT,
  match_score INTEGER DEFAULT 0,
  skills JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE student_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analysis" ON student_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis" ON student_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis" ON student_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE student_analyses;

-- Create index for faster lookups
CREATE INDEX idx_student_analyses_user_id ON student_analyses(user_id);

