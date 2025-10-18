import { NextRequest, NextResponse } from 'next/server'
import { sessionService } from '@/lib/sessionService'
import { ApiResponse, ReceiptData } from '@/types'
import { validateSessionId, safeValidateReceiptData, validateReceiptData } from '@/lib/validation'
import { rateLimitMiddleware, apiRateLimits } from '@/lib/rateLimit'
import { logger, logAPIRequest, logSessionOperation, logValidationError, logRateLimitExceeded } from '@/lib/logger'

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = request.headers.get('x-client-ip')

  return forwarded?.split(',')[0]?.trim() ||
         realIP ||
         clientIP ||
         'unknown'
}

/**
 * GET /api/session?session_id={id}
 * Retrieves session data for editing
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ReceiptData>>> {
  const startTime = Date.now()
  const url = new URL(request.url)
  const userAgent = request.headers.get('user-agent') || undefined

  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request)
  if (!rateLimitResult.allowed) {
    logRateLimitExceeded(
      getClientIP(request),
      url.pathname,
      rateLimitResult.error?.retryAfter || 60
    )

    const response = NextResponse.json(
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

    logAPIRequest('GET', url.pathname, 429, Date.now() - startTime, userAgent, getClientIP(request))
    return response
  }

  const { searchParams } = new URL(request.url)
  const sessionIdParam = searchParams.get('session_id')

  if (!sessionIdParam) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400, headers: rateLimitResult.headers }
    )
  }

  try {
    // Validate session ID format
    const sessionId = validateSessionId(sessionIdParam)

    const session = await sessionService.getSession(sessionId)
    if (!session) {
      logSessionOperation('read', sessionId, undefined, false, 'Session not found')

      const response = NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404, headers: rateLimitResult.headers }
      )

      logAPIRequest('GET', url.pathname, 404, Date.now() - startTime, userAgent, getClientIP(request))
      return response
    }

    logSessionOperation('read', sessionId, undefined, true)

    const response = NextResponse.json(
      { data: session.data },
      { headers: rateLimitResult.headers }
    )

    logAPIRequest('GET', url.pathname, 200, Date.now() - startTime, userAgent, getClientIP(request))
    return response
  } catch (error) {
    console.error('GET /api/session error:', error)

    // Handle validation errors specifically
    if (error instanceof Error && error.message.includes('Invalid session ID')) {
      logValidationError('sessionId', sessionIdParam, error.message)

      const response = NextResponse.json(
        { error: error.message },
        { status: 400, headers: rateLimitResult.headers }
      )

      logAPIRequest('GET', url.pathname, 400, Date.now() - startTime, userAgent, getClientIP(request))
      return response
    }

    logger.error('GET /api/session internal error:', { error: error instanceof Error ? error.message : 'Unknown error' })

    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitResult.headers }
    )

    logAPIRequest('GET', url.pathname, 500, Date.now() - startTime, userAgent, getClientIP(request))
    return response
  }
}

/**
 * POST /api/session
 * Updates session data and marks it as ready for the bot
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const startTime = Date.now()
  const url = new URL(request.url)
  const userAgent = request.headers.get('user-agent') || undefined

  // Apply rate limiting
  const rateLimitResult = await rateLimitMiddleware(request)
  if (!rateLimitResult.allowed) {
    logRateLimitExceeded(
      getClientIP(request),
      url.pathname,
      rateLimitResult.error?.retryAfter || 60
    )

    const response = NextResponse.json(
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

    logAPIRequest('POST', url.pathname, 429, Date.now() - startTime, userAgent, getClientIP(request))
    return response
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
      )
    }

    // Validate session ID format
    const validSessionId = validateSessionId(session_id)

    // Validate receipt data structure and content
    const validationResult = safeValidateReceiptData(data)
    if (!validationResult.success) {
      logValidationError('receiptData', data, validationResult.error)

      const response = NextResponse.json(
        { error: `Invalid receipt data: ${validationResult.error}` },
        { status: 400, headers: rateLimitResult.headers }
      )

      logAPIRequest('POST', url.pathname, 400, Date.now() - startTime, userAgent, getClientIP(request))
      return response
    }

    // Update session with validated data
    await sessionService.updateSession(validSessionId, validationResult.data)
    logSessionOperation('update', validSessionId, undefined, true)

    const response = NextResponse.json(
      { success: true },
      { headers: rateLimitResult.headers }
    )

    logAPIRequest('POST', url.pathname, 200, Date.now() - startTime, userAgent, getClientIP(request))
    return response
  } catch (error) {
    console.error('POST /api/session error:', error)

    // Handle validation errors specifically
    if (error instanceof Error && (error.message.includes('Invalid') || error.message.includes('receipt data'))) {
      logValidationError('receiptData', data || body.data || 'unknown', error.message)

      const response = NextResponse.json(
        { error: error.message },
        { status: 400, headers: rateLimitResult.headers }
      )

      logAPIRequest('POST', url.pathname, 400, Date.now() - startTime, userAgent, getClientIP(request))
      return response
    }

    logger.error('POST /api/session internal error:', { error: error instanceof Error ? error.message : 'Unknown error' })

    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitResult.headers }
    )

    logAPIRequest('POST', url.pathname, 500, Date.now() - startTime, userAgent, getClientIP(request))
    return response
  }
}
