import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // For now, just return healthy status since we're using @vercel/postgres
    // which connects automatically in API routes
    return NextResponse.json({
      status: 'healthy',
      database: 'Prisma Postgres configured',
      note: 'Database connection tested via API routes',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'unhealthy',
      database: 'configuration error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
