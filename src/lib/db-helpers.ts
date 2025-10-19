import { sql } from '@/lib/db'

/**
 * Check if sessions table exists in database
 * @returns Promise<boolean>
 */
export async function checkSessionsTableExists(): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'sessions'
        AND table_schema = 'public'
      ) as table_exists
    `
    return (result as any)?.[0]?.table_exists === true
  } catch (error) {
    console.error('Error checking sessions table:', error)
    return false
  }
}

/**
 * Create sessions table with all required components
 * @returns Promise<void>
 */
export async function createSessionsTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY,
      data JSONB NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ready')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_id ON sessions(id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at)`

  // Create trigger function
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql'
  `

  // Create trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_sessions_updated_at
        BEFORE UPDATE ON sessions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  `
}
