
-- Add assignment_id column to voice_practice_sessions
ALTER TABLE voice_practice_sessions ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES student_assignments(id);
