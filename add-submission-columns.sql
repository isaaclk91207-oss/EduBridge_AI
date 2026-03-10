-- Add content and submission_type columns to user_assignments table
-- Run this in your Supabase SQL Editor

ALTER TABLE user_assignments 
ADD COLUMN IF NOT EXISTS content TEXT;

ALTER TABLE user_assignments 
ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'file';
-- submission_type can be: 'file', 'link', 'essay'
