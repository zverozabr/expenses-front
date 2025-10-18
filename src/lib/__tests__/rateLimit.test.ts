import { rateLimiter, rateLimitMiddleware, apiRateLimits } from '../rateLimit'

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear rate limiter state
    rateLimiter['requests'].clear()
  })

  describe('RateLimiter class', () => {
    it('should allow requests within limit', () => {
      const clientId = 'test-client'

      // First 100 requests should be allowed
      for (let i = 0; i < 100; i++) {
        const result = rateLimiter.check(clientId)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(99 - i)
      }
    })

    it('should block requests over limit', () => {
      const clientId = 'test-client'

      // Use up all requests
      for (let i = 0; i < 100; i++) {
        rateLimiter.check(clientId)
      }

      // Next request should be blocked
      const result = rateLimiter.check(clientId)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', () => {
      const clientId = 'test-client'

      // Use up requests
      for (let i = 0; i < 100; i++) {
        rateLimiter.check(clientId)
      }

      // Mock window expiry by manipulating internal state
      const entry = rateLimiter['requests'].get(clientId)
      if (entry) {
        entry.resetTime = Date.now() - 1000 // Set to past
      }

      // Next request should be allowed again
      const result = rateLimiter.check(clientId)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(99)
    })

    it('should handle different clients independently', () => {
      const client1 = 'client-1'
      const client2 = 'client-2'

      // Client 1 uses all requests
      for (let i = 0; i < 100; i++) {
        rateLimiter.check(client1)
      }

      // Client 2 should still be allowed
      const result = rateLimiter.check(client2)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(99)
    })
  })

  describe('rateLimitMiddleware', () => {
    it('should allow requests within limit', async () => {
      const request = {
        url: 'http://localhost/api/test',
        method: 'GET',
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      } as any

      const result = await rateLimitMiddleware(request)

      expect(result.allowed).toBe(true)
      expect(result.headers).toHaveProperty('X-RateLimit-Limit')
      expect(result.headers).toHaveProperty('X-RateLimit-Remaining')
      expect(result.headers).toHaveProperty('X-RateLimit-Reset')
    })

    it('should block requests over limit', async () => {
      const clientId = 'blocked-client'

      // Exhaust the limit
      for (let i = 0; i < 100; i++) {
        const request = {
          url: 'http://localhost/api/test',
          method: 'GET',
          headers: {
            'x-forwarded-for': '192.168.1.100'
          }
        } as any
        await rateLimitMiddleware(request, clientId)
      }

      // Next request should be blocked
      const blockedRequest = {
        url: 'http://localhost/api/test',
        method: 'GET',
        headers: {
          'x-forwarded-for': '192.168.1.100'
        }
      } as any
      const result = await rateLimitMiddleware(blockedRequest, clientId)

      expect(result.allowed).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Too many requests')
      expect(result.error?.retryAfter).toBeDefined()
    })

    it('should extract IP from headers', async () => {
      const request = {
        url: 'http://localhost/api/test',
        method: 'GET',
        headers: {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1',
          'x-real-ip': '192.168.1.200'
        }
      } as any

      // First request should work
      const result1 = await rateLimitMiddleware(request)
      expect(result1.allowed).toBe(true)

      // Second request with same IP should be counted
      const result2 = await rateLimitMiddleware(request)
      expect(result2.allowed).toBe(true)
      expect(parseInt(result2.headers['X-RateLimit-Remaining'])).toBeLessThan(
        parseInt(result1.headers['X-RateLimit-Remaining'])
      )
    })
  })

  describe('API integration', () => {
    it('should include rate limit headers in API responses', async () => {
      // Create a mock request that simulates what Next.js would create
      const mockRequest = {
        url: 'http://localhost/api/session?session_id=550e8400-e29b-41d4-a716-446655440000',
        method: 'GET',
        headers: {
          get: (name: string) => {
            const headers: Record<string, string> = {
              'user-agent': 'test-agent',
              'x-forwarded-for': '192.168.1.1'
            }
            return headers[name.toLowerCase()] || null
          }
        }
      } as any

      // Test the middleware directly
      const result = await rateLimitMiddleware(mockRequest)

      expect(result.allowed).toBe(true)
      expect(result.headers).toHaveProperty('X-RateLimit-Limit')
      expect(result.headers).toHaveProperty('X-RateLimit-Remaining')
      expect(result.headers).toHaveProperty('X-RateLimit-Reset')
    })

    it('should return 429 when rate limit exceeded', async () => {
      // Exhaust the rate limit for a specific IP
      for (let i = 0; i < 100; i++) {
        const mockRequest = {
          url: 'http://localhost/api/session',
          method: 'GET',
          headers: {
            get: () => '192.168.1.100' // Same IP to trigger rate limit
          }
        } as any

        await rateLimitMiddleware(mockRequest)
      }

      // Next request should be rate limited
      const blockedRequest = {
        url: 'http://localhost/api/session',
        method: 'GET',
        headers: {
          get: () => '192.168.1.100'
        }
      } as any

      const result = await rateLimitMiddleware(blockedRequest)
      expect(result.allowed).toBe(false)
      expect(result.error).toHaveProperty('message', 'Too many requests')
      expect(result.error).toHaveProperty('retryAfter')
    })
  })
})
