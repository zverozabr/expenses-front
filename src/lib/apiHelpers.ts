import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/rateLimit'
import { logRateLimitExceeded, getClientIP } from '@/lib/logger'

/**
 * Higher-Order Function that wraps API route handlers with rate limiting
 * DRY: Eliminates duplication of rate limiting logic across API routes
 *
 * @param handler - The API route handler function
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * ```typescript
 * async function _GET(request: NextRequest, rateLimitHeaders: Record<string, string>) {
 *   // Your handler logic here
 *   return NextResponse.json({ data: 'success' }, { headers: rateLimitHeaders })
 * }
 *
 * export const GET = withRateLimit(withAPILogging(_GET))
 * ```
 */
export function withRateLimit<T = any>(
  handler: (request: NextRequest, rateLimitHeaders: Record<string, string>) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
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
      ) as NextResponse<T>
    }

    // Call the original handler with rate limit headers
    return handler(request, rateLimitResult.headers)
  }
}
