-- Migration: Create sessions table for Telegram bot integration
-- Version: 001
-- Date: 2025-10-18
-- Description: Creates the sessions table needed for frontend-backend communication

-- Create the sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ready')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster status lookups (bot polling)
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Create index for faster UUID lookups
CREATE INDEX IF NOT EXISTS idx_sessions_id ON sessions(id);

-- Create index for updated_at (for cleanup queries)
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at);

-- Add trigger for automatic updated_at updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE sessions IS 'Telegram bot editing sessions for frontend integration';
COMMENT ON COLUMN sessions.id IS 'UUID primary key for session identification';
COMMENT ON COLUMN sessions.data IS 'JSONB data containing receipt items for editing';
COMMENT ON COLUMN sessions.status IS 'Session status: pending (being edited) or ready (completed)';
COMMENT ON COLUMN sessions.created_at IS 'Timestamp when session was created';
COMMENT ON COLUMN sessions.updated_at IS 'Timestamp when session was last updated';

-- Verify table creation with metadata
DO $$
BEGIN
    RAISE NOTICE 'Migration 001 completed successfully';
    RAISE NOTICE 'Created table: sessions with % columns', (
        SELECT count(*) FROM information_schema.columns
        WHERE table_name = 'sessions' AND table_schema = 'public'
    );
END $$;
