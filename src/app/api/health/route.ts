import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkSessionsTableExists, createSessionsTable } from '@/lib/db-helpers'

export async function GET() {
  try {
    // Test database connection
    await sql`SELECT 1 as test`

    // Check if sessions table exists
    const tableExistedInitially = await checkSessionsTableExists()

    // If table doesn't exist, try to create it automatically
    if (!tableExistedInitially) {
      console.log('📋 Sessions table not found, running auto-migration...')
      try {
        await createSessionsTable()
        console.log('✅ Auto-migration completed successfully')
      } catch (migrationError) {
        console.error('❌ Auto-migration failed:', migrationError)
      }
    }

    // Final check
    const tableExistsNow = await checkSessionsTableExists()

    return NextResponse.json({
      status: 'healthy',
      database: {
        connection: 'successful',
        provider: 'Prisma Postgres',
        sessions_table: tableExistsNow ? 'exists' : 'missing',
        auto_migration: tableExistedInitially ? 'not_needed' : (tableExistsNow ? 'successful' : 'failed')
      },
      message: tableExistsNow
        ? 'Frontend is ready for bot integration'
        : 'Database setup incomplete',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'unhealthy',
      database: {
        connection: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      message: 'Frontend is not ready for bot integration',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

