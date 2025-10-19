import { sql } from './db'
import { SessionData, ISessionService, ReceiptData } from '@/types'
import { validateReceiptData, safeValidateReceiptData } from '@/lib/validation'
import { logSessionOperation, logDatabaseError } from '@/lib/logger'
import { LRUCache } from 'lru-cache'

/**
 * Service class for managing session data in the database
 * Implements the ISessionService interface for dependency injection
 * Includes data validation for security and data integrity
 */
export class SessionService implements ISessionService {
private cache: LRUCache<string, SessionData>

constructor() {
// Cache for 5 minutes, max 100 entries
this.cache = new LRUCache({
      max: 100,
      ttl: 5 * 60 * 1000, // 5 minutes
    })
  }

  /**
    * Retrieves session data by session ID
    * @param sessionId - Unique identifier for the session
    * @returns Promise resolving to session data or null if not found
    */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      // Check cache first
      const cached = this.cache.get(sessionId)
      if (cached) {
        return cached
      }

      const { rows } = await sql`
        SELECT id, data, status
        FROM sessions
        WHERE id = ${sessionId}
      `

      if (rows.length === 0) return null

      // Validate data from database
      const validationResult = safeValidateReceiptData(rows[0].data)
      if (!validationResult.success) {
        logDatabaseError('read', 'sessions', `Corrupted data for session ${sessionId}: ${validationResult.error}`)
        throw new Error('Corrupted data in database')
      }

      const sessionData = {
        id: rows[0].id as string,
        data: validationResult.data,
        status: rows[0].status as 'pending' | 'ready',
      }

      // Cache the result
      this.cache.set(sessionId, sessionData)

      return sessionData
    } catch (error) {
      logDatabaseError('read', 'sessions', error instanceof Error ? error.message : 'Unknown error', { sessionId })
      logSessionOperation('read', sessionId, undefined, false, error instanceof Error ? error.message : 'Unknown error')
      throw new Error('Failed to retrieve session data')
    }
  }

  /**
   * Updates session data and marks it as ready
   * Includes validation to ensure data integrity
   * @param sessionId - Unique identifier for the session
   * @param data - Updated table data (validated)
   */
  async updateSession(sessionId: string, data: ReceiptData): Promise<void> {
    try {
      // Validate data before saving (double-check)
      validateReceiptData(data)

      await sql`
        UPDATE sessions
        SET data = ${JSON.stringify(data)}, status = 'ready'
        WHERE id = ${sessionId}
      `

      // Invalidate cache after update
      this.cache.delete(sessionId)
    } catch (error) {
      logDatabaseError('update', 'sessions', error instanceof Error ? error.message : 'Unknown error', { sessionId })
      logSessionOperation('update', sessionId, undefined, false, error instanceof Error ? error.message : 'Unknown error')
      throw new Error('Failed to update session data')
    }
  }

  /**
   * Creates a new session with validated data
   * @param sessionId - Unique identifier for the new session
   * @param data - Initial receipt data
   */
  async createSession(sessionId: string, data: ReceiptData): Promise<void> {
    try {
      // Validate data before saving
      validateReceiptData(data)

      await sql`
        INSERT INTO sessions (id, data, status)
        VALUES (${sessionId}, ${JSON.stringify(data)}, 'pending')
      `
    } catch (error) {
      logDatabaseError('create', 'sessions', error instanceof Error ? error.message : 'Unknown error', { sessionId })
      logSessionOperation('create', sessionId, undefined, false, error instanceof Error ? error.message : 'Unknown error')
      throw new Error('Failed to create session')
    }
  }
}

/**
 * Singleton instance of SessionService
 * Use this for dependency injection throughout the application
 */
export const sessionService = new SessionService()
