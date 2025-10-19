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

    // KISS: Simple success response matching API contract
    return NextResponse.json({
      success: true,
      database: {
        connection: 'successful',
        provider: 'Prisma Postgres',
        sessions_table: tableExistsNow ? 'exists' : 'missing',
        auto_migration: tableExistedInitially ? 'not_needed' : (tableExistsNow ? 'successful' : 'failed')
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Health check failed:', error)

    // KISS: Simple error response matching API contract
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

