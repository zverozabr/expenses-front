-- Database initialization script for Telegram Receipt Editor
-- Run this script after creating the database

-- Create sessions table with proper indexes
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC);

-- JSON indexes for querying receipt data (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_sessions_data_item ON sessions USING gin ((data->>'Item'));
CREATE INDEX IF NOT EXISTS idx_sessions_data_qty ON sessions USING gin ((data->>'Qty'));
CREATE INDEX IF NOT EXISTS idx_sessions_data_total ON sessions USING gin ((data->>'Total'));

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_status_updated ON sessions(status, updated_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE sessions IS 'Stores receipt editing sessions with JSON data';
COMMENT ON COLUMN sessions.id IS 'Unique session identifier (UUID)';
COMMENT ON COLUMN sessions.data IS 'Receipt data in JSON format';
COMMENT ON COLUMN sessions.status IS 'Session status: pending or ready';
COMMENT ON COLUMN sessions.created_at IS 'Session creation timestamp';
COMMENT ON COLUMN sessions.updated_at IS 'Last update timestamp';

-- Insert sample data for testing (optional)
-- This is commented out by default
/*
INSERT INTO sessions (id, data, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', '[
  {"#": 1, "Qty": 1, "Unit": "pcs", "Price": 89.00, "Art": "21150…", "Item": "Est Cola", "Net": 89.00, "VAT": 0.00, "Total": 89.00}
]'::jsonb, 'pending');
*/

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON sessions TO your_app_user;

-- Analyze tables for query optimization
ANALYZE sessions;
