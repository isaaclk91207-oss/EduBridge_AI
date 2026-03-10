-- Add content column for rich text submissions if not exists
ALTER TABLE user_assignments ADD COLUMN IF NOT EXISTS content TEXT;

-- Add submission_type column if not exists  
ALTER TABLE user_assignments ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'file';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_assignments_user_id ON user_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assignments_submission_type ON user_assignments(submission_type);
