import { NextResponse } from 'next/server'
import { checkSessionsTableExists, createSessionsTable } from '@/lib/db-helpers'

export async function POST() {
try {
console.log('🚀 Starting database migration...')

await createSessionsTable()

console.log('✅ Migration completed successfully')

return NextResponse.json({
success: true,
message: 'Database migration completed successfully',
timestamp: new Date().toISOString()
})

  } catch (error) {
console.error('❌ Migration failed:', error)

return NextResponse.json({
  success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
  timestamp: new Date().toISOString()
}, { status: 500 })
}
}

// GET method for status check
export async function GET() {
try {
const tableExists = await checkSessionsTableExists()

    return NextResponse.json({
  migration_status: tableExists ? 'completed' : 'pending',
  sessions_table_exists: tableExists,
message: tableExists
? 'Database migration has been completed'
: 'Database migration is pending. Use POST /api/migrate to run it',
  timestamp: new Date().toISOString()
    })

} catch (error) {
return NextResponse.json({
migration_status: 'error',
error: error instanceof Error ? error.message : 'Unknown error',
message: 'Cannot check migration status',
timestamp: new Date().toISOString()
}, { status: 500 })
}
}
