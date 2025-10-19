-- SQL Script for Creating Sessions Table in Vercel Postgres
-- Run this in Vercel Dashboard → Storage → Postgres → Query tab

-- Create the sessions table for Telegram bot integration
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ready')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by status
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Create index for faster UUID lookups
CREATE INDEX IF NOT EXISTS idx_sessions_id ON sessions(id);

-- Optional: Add a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify table creation
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'sessions';
