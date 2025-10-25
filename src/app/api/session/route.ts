import { NextRequest, NextResponse } from 'next/server'
import { sessionService } from '@/lib/sessionService'
import { ApiResponse, ReceiptData } from '@/types'
import { validateSessionId, safeValidateReceiptData, validateReceiptData } from '@/lib/validation'
import { logger, withAPILogging, logSessionOperation, logValidationError } from '@/lib/logger'
import { withRateLimit } from '@/lib/apiHelpers'

// Note: getClientIP is now in logger.ts for reuse

/**
 * GET /api/session?session_id={id}
 * Retrieves session data for editing
 */
async function _GET(request: NextRequest, rateLimitHeaders: Record<string, string>): Promise<NextResponse<ApiResponse<ReceiptData>>> {
  const { searchParams } = new URL(request.url)
  const sessionIdParam = searchParams.get('session_id')

  if (!sessionIdParam) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400, headers: rateLimitHeaders }
    ) as NextResponse<ApiResponse<ReceiptData>>
  }

  try {
    // Validate session ID format
    let sessionId: string
    try {
      sessionId = validateSessionId(sessionIdParam)
    } catch (validationError) {
      logValidationError('sessionId', sessionIdParam, validationError instanceof Error ? validationError.message : 'Invalid session ID format')
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid session ID format' },
        { status: 400, headers: rateLimitHeaders }
      ) as NextResponse<ApiResponse<ReceiptData>>
    }

    const session = await sessionService.getSession(sessionId)
    if (!session) {
      logSessionOperation('read', sessionId, undefined, false, 'Session not found')

      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404, headers: rateLimitHeaders }
      ) as NextResponse<ApiResponse<ReceiptData>>
    }

    logSessionOperation('read', sessionId, undefined, true)

    return NextResponse.json(
      { data: session.data },
      { headers: rateLimitHeaders }
    ) as NextResponse<ApiResponse<ReceiptData>>
  } catch (error) {
    console.error('GET /api/session error:', error)

    logger.error('GET /api/session internal error:', { error: error instanceof Error ? error.message : 'Unknown error' })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitHeaders }
    ) as NextResponse<ApiResponse<ReceiptData>>
  }
}

/**
 * POST /api/session
 * Updates session data and marks it as ready for the bot
 */
async function _POST(request: NextRequest, rateLimitHeaders: Record<string, string>): Promise<NextResponse<ApiResponse>> {
  let body: any = {}
  let data: any = null

  try {
    body = await request.json()
    const { session_id, data: requestData } = body
    data = requestData

    // Validate required fields presence
    if (!session_id || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id and data' },
        { status: 400, headers: rateLimitHeaders }
      ) as NextResponse<ApiResponse>
    }

    // Validate session ID format
    let validSessionId: string
    try {
      validSessionId = validateSessionId(session_id)
    } catch (validationError) {
      logValidationError('sessionId', session_id, validationError instanceof Error ? validationError.message : 'Invalid session ID format')
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid session ID format' },
        { status: 400, headers: rateLimitHeaders }
      ) as NextResponse<ApiResponse>
    }

    // Validate receipt data early
    try {
      validateReceiptData(data)
    } catch (validationError) {
      logValidationError('receiptData', data, validationError instanceof Error ? validationError.message : 'Validation failed')
      return NextResponse.json(
        { error: `Invalid receipt data: ${validationError instanceof Error ? validationError.message : 'Validation failed'}` },
        { status: 400, headers: rateLimitHeaders }
      ) as NextResponse<ApiResponse>
    }

    // KISS: Use UPSERT to handle both create and update in one operation
    // This eliminates the need to check if session exists first
    await sessionService.upsertSession(validSessionId, data)
    logSessionOperation('update', validSessionId, undefined, true)

    return NextResponse.json(
      { success: true },
      { headers: rateLimitHeaders }
    ) as NextResponse<ApiResponse>
  } catch (error) {
    console.error('POST /api/session error:', error)

    logger.error('POST /api/session internal error:', { error: error instanceof Error ? error.message : 'Unknown error' })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitHeaders }
    ) as NextResponse<ApiResponse>
  }
}

// Export wrapped functions with rate limiting and logging
// Note: withRateLimit wraps the handler first, then withAPILogging wraps the result
export const GET = withAPILogging(withRateLimit(_GET))
export const POST = withAPILogging(withRateLimit(_POST))
