import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkTelegramUpdatesTableExists, createTelegramUpdatesTable } from '@/lib/db-helpers'

/**
 * Telegram Webhook Endpoint
 *
 * This endpoint receives updates from Telegram Bot API and stores them in the database
 * for processing by the backend bot.
 *
 * Architecture:
 * Telegram → Vercel /api/webhook/telegram → Database (telegram_updates table)
 *                                             ↓
 *                                    Backend bot (polling)
 */

// Ensure table exists (lazy initialization)
let tableChecked = false

async function ensureTable() {
  if (tableChecked) return

  const exists = await checkTelegramUpdatesTableExists()
  if (!exists) {
    console.log('📋 Creating telegram_updates table...')
    await createTelegramUpdatesTable()
    console.log('✅ telegram_updates table created')
  }
  tableChecked = true
}

export async function POST(request: NextRequest) {
  try {
    // Ensure table exists
    await ensureTable()

    // Parse Telegram update
    const update = await request.json()

    // Validate update has required fields
    if (!update || typeof update.update_id !== 'number') {
      return NextResponse.json(
        { error: 'Invalid update format' },
        { status: 400 }
      )
    }

    // Store update in database for backend bot to process
    await sql`
      INSERT INTO telegram_updates (
        update_id,
        update_data,
        processed,
        created_at
      )
      VALUES (
        ${update.update_id},
        ${JSON.stringify(update)},
        false,
        NOW()
      )
      ON CONFLICT (update_id) DO NOTHING
    `

    console.log(`✅ Webhook: Stored update ${update.update_id}`)

    // Telegram expects 200 OK response
    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('❌ Webhook error:', error)

    // Still return 200 to Telegram to avoid retries
    return NextResponse.json({ ok: true })
  }
}

// Health check for webhook
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/webhook/telegram',
    message: 'Telegram webhook endpoint is active'
  })
}
