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
   * Centralized error handling and logging
   * Eliminates DRY violations and improves maintainability
   */
  private handleError(operation: 'create' | 'read' | 'update', sessionId: string, error: unknown): never {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logDatabaseError(operation, 'sessions', message, { sessionId })
    logSessionOperation(operation, sessionId, undefined, false, message)
    throw new Error(`Failed to ${operation} session data`)
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

      const rows = await sql`
        SELECT id, data, status
        FROM sessions
        WHERE id = ${sessionId}
      ` as any[]

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
      this.handleError('read', sessionId, error)
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
      this.handleError('update', sessionId, error)
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
      this.handleError('create', sessionId, error)
    }
  }

  /**
   * Creates or updates session data (UPSERT)
   * KISS: Single method for both create and update operations
   * DRY: Reuses validation and cache invalidation logic
   * SOLID: Single Responsibility - manages session persistence
   *
   * @param sessionId - Unique identifier for the session
   * @param data - Receipt data to save
   */
  async upsertSession(sessionId: string, data: ReceiptData): Promise<void> {
    try {
      // Validate data before saving (DRY: same validation as create/update)
      validateReceiptData(data)

      // KISS: Simple UPSERT pattern using PostgreSQL ON CONFLICT
      await sql`
        INSERT INTO sessions (id, data, status, created_at, updated_at)
        VALUES (
          ${sessionId},
          ${JSON.stringify(data)},
          'ready',
          NOW(),
          NOW()
        )
        ON CONFLICT (id)
        DO UPDATE SET
          data = EXCLUDED.data,
          status = 'ready',
          updated_at = NOW()
      `

      // Invalidate cache after update (DRY: consistent cache management)
      this.cache.delete(sessionId)
    } catch (error) {
      this.handleError('update', sessionId, error)
    }
  }
}

/**
 * Singleton instance of SessionService
 * Use this for dependency injection throughout the application
 */
export const sessionService = new SessionService()
