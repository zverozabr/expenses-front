import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to prevent caching for Telegram WebApp pages
 *
 * Telegram aggressively caches WebApp content, even when URL parameters change.
 * This middleware adds strict no-cache headers to ensure users always see the latest version.
 *
 * Headers:
 * - Cache-Control: no-store - Prevents any caching
 * - Cache-Control: no-cache - Requires revalidation
 * - Cache-Control: must-revalidate - Forces cache to check with server
 * - Pragma: no-cache - HTTP/1.0 compatibility
 * - Expires: 0 - Immediately expires cached content
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Strict no-cache headers for Telegram WebApp
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
  )
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  // Additional header to prevent proxy caching
  response.headers.set('Surrogate-Control', 'no-store')

  return response
}

// Apply middleware only to /edit pages (where Telegram WebApp loads)
export const config = {
  matcher: '/edit/:path*',
}
