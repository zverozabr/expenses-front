import { NextRequest, NextResponse } from 'next/server'
import { sessionService } from '@/lib/sessionService'
import { ApiResponse, ReceiptData } from '@/types'
import { validateSessionId, safeValidateReceiptData, validateReceiptData } from '@/lib/validation'
import { rateLimitMiddleware, apiRateLimits } from '@/lib/rateLimit'
import { logger, withAPILogging, logSessionOperation, logValidationError, logRateLimitExceeded, getClientIP } from '@/lib/logger'

// Note: getClientIP is now in logger.ts for reuse

/**
 * GET /api/session?session_id={id}
 * Retrieves session data for editing
 */
async function _GET(request: NextRequest): Promise<NextResponse<ApiResponse<ReceiptData>>> {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request)
  if (!rateLimitResult.allowed) {
    logRateLimitExceeded(
      getClientIP(request),
      new URL(request.url).pathname,
      rateLimitResult.error?.retryAfter || 60
    )

    return NextResponse.json(
      {
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
        retryAfter: rateLimitResult.error?.retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': (rateLimitResult.error?.retryAfter || 60).toString(),
          ...rateLimitResult.headers
        }
      }
    )
  }

  const { searchParams } = new URL(request.url)
  const sessionIdParam = searchParams.get('session_id')

  if (!sessionIdParam) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400, headers: rateLimitResult.headers }
    ) as NextResponse<ApiResponse<ReceiptData>>
  }

  try {
    // Validate session ID format
    const sessionId = validateSessionId(sessionIdParam)

    const session = await sessionService.getSession(sessionId)
    if (!session) {
      logSessionOperation('read', sessionId, undefined, false, 'Session not found')

      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404, headers: rateLimitResult.headers }
      ) as NextResponse<ApiResponse<ReceiptData>>
    }

    logSessionOperation('read', sessionId, undefined, true)

    return NextResponse.json(
      { data: session.data },
      { headers: rateLimitResult.headers }
    ) as NextResponse<ApiResponse<ReceiptData>>
  } catch (error) {
    console.error('GET /api/session error:', error)

    logger.error('GET /api/session internal error:', { error: error instanceof Error ? error.message : 'Unknown error' })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitResult.headers }
    ) as NextResponse<ApiResponse<ReceiptData>>
  }
}

/**
 * POST /api/session
 * Updates session data and marks it as ready for the bot
 */
async function _POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request)
  if (!rateLimitResult.allowed) {
    logRateLimitExceeded(
      getClientIP(request),
      new URL(request.url).pathname,
      rateLimitResult.error?.retryAfter || 60
    )

    return NextResponse.json(
      {
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
        retryAfter: rateLimitResult.error?.retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': (rateLimitResult.error?.retryAfter || 60).toString(),
          ...rateLimitResult.headers
        }
      }
    )
  }

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
        { status: 400, headers: rateLimitResult.headers }
      ) as NextResponse<ApiResponse>
    }

    // Validate session ID format
    const validSessionId = validateSessionId(session_id)

    // Validate receipt data early
    try {
      validateReceiptData(data)
    } catch (validationError) {
      logValidationError('receiptData', data, validationError instanceof Error ? validationError.message : 'Validation failed')
      return NextResponse.json(
        { error: `Invalid receipt data: ${validationError instanceof Error ? validationError.message : 'Validation failed'}` },
        { status: 400, headers: rateLimitResult.headers }
      ) as NextResponse<ApiResponse>
    }

    // KISS: Use UPSERT to handle both create and update in one operation
    // This eliminates the need to check if session exists first
    await sessionService.upsertSession(validSessionId, data)
    logSessionOperation('update', validSessionId, undefined, true)

    return NextResponse.json(
      { success: true },
      { headers: rateLimitResult.headers }
    ) as NextResponse<ApiResponse>
  } catch (error) {
    console.error('POST /api/session error:', error)

    logger.error('POST /api/session internal error:', { error: error instanceof Error ? error.message : 'Unknown error' })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitResult.headers }
    ) as NextResponse<ApiResponse>
  }
}

// Export wrapped functions with logging
export const GET = withAPILogging(_GET)
export const POST = withAPILogging(_POST)
