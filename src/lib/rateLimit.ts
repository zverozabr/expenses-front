/**
 * Simple in-memory rate limiter for API protection
 * In production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests

    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if request should be allowed
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @returns Object with allowed status and remaining requests
   */
  check(identifier: string): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      }
    }

    if (entry.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment counter
    entry.count++
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.requests.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.requests.delete(key))
  }

  /**
   * Get current stats for debugging
   */
  getStats(): { totalKeys: number; entries: [string, RateLimitEntry][] } {
    const entries: [string, RateLimitEntry][] = []
    this.requests.forEach((value, key) => {
      entries.push([key, value])
    })

    return {
      totalKeys: this.requests.size,
      entries
    }
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter()

/**
 * Middleware function for rate limiting API routes
 */
export async function rateLimitMiddleware(
  request: Request,
  identifier?: string
): Promise<{
  allowed: boolean
  headers: Record<string, string>
  error?: { message: string; retryAfter?: number }
}> {
  // Use IP address as identifier if not provided
  const clientId = identifier || getClientIP(request)

  const result = rateLimiter.check(clientId)

  const headers = {
    'X-RateLimit-Limit': rateLimiter['maxRequests'].toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.resetTime / 1000).toString(),
  }

  if (!result.allowed) {
    return {
      allowed: false,
      headers,
      error: {
        message: 'Too many requests',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      }
    }
  }

  return {
    allowed: true,
    headers
  }
}

/**
* Extract client IP from request headers
*/
function getClientIP(request: Request): string {
// Handle different header types (Node.js Headers vs Web Headers)
const getHeader = (name: string) => {
  if (request.headers instanceof Headers) {
    return request.headers.get(name)
    }
  // For Node.js style headers
  return (request.headers as any)[name.toLowerCase()] ||
 (request.headers as any)[name]
}

  // Try different headers that might contain the real IP
  const forwarded = getHeader('x-forwarded-for')
  const realIP = getHeader('x-real-ip')
  const clientIP = getHeader('x-client-ip')

  // Use the first available IP, fallback to a default
  return forwarded?.split(',')[0]?.trim() ||
          realIP ||
          clientIP ||
          'unknown'
}

/**
 * Rate limiting for specific API endpoints
 */
export const apiRateLimits = {
  // Session operations (create, read, update)
  session: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // 100 requests per 15 minutes
  },

  // General API protection
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 requests per minute
  }
}
