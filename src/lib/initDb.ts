import { sql } from '@/lib/db'

export async function initDatabase() {
  try {
    console.log('🔄 Initializing database...')

    // Test connection
    await sql`SELECT 1 as test`
    console.log('✅ Database connection successful')

    // Check if sessions table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'sessions'
        AND table_schema = 'public'
      ) as table_exists
    `

    const tableExists = (tableCheck as any)?.[0]?.table_exists === true

    if (!tableExists) {
      console.log('📋 Creating sessions table...')

      // Create sessions table
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

      console.log('✅ Database tables created successfully')
    } else {
      console.log('✅ Sessions table already exists')
    }

    console.log('🎉 Database initialization completed')
    return true

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    // Don't throw error - allow app to start even if DB init fails
    return false
  }
}
