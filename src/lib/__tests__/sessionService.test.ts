import { SessionService } from '../sessionService'
import { ReceiptData } from '@/types'

// Mock dependencies
jest.mock('../db', () => ({
  sql: jest.fn()
}))

jest.mock('../validation', () => ({
  validateReceiptData: jest.fn(),
  safeValidateReceiptData: jest.fn()
}))

jest.mock('../logger', () => ({
  logSessionOperation: jest.fn(),
  logDatabaseError: jest.fn()
}))

const mockSql = require('../db').sql
const mockValidateReceiptData = require('../validation').validateReceiptData
const mockSafeValidateReceiptData = require('../validation').safeValidateReceiptData
const mockLogSessionOperation = require('../logger').logSessionOperation
const mockLogDatabaseError = require('../logger').logDatabaseError

describe('SessionService', () => {
  let service: SessionService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new SessionService()
  })

  describe('handleError', () => {
    it('should log database error and session operation, then throw with formatted message', () => {
      const error = new Error('Test error')
      const sessionId = 'test-session-id'

      expect(() => {
        service['handleError']('read', sessionId, error)
      }).toThrow('Failed to read session data')

      expect(mockLogDatabaseError).toHaveBeenCalledWith('read', 'sessions', 'Test error', { sessionId })
      expect(mockLogSessionOperation).toHaveBeenCalledWith('read', sessionId, undefined, false, 'Test error')
    })

    it('should handle non-Error objects', () => {
      const error = 'String error'
      const sessionId = 'test-session-id'

      expect(() => {
        service['handleError']('create', sessionId, error)
      }).toThrow('Failed to create session data')

      expect(mockLogDatabaseError).toHaveBeenCalledWith('create', 'sessions', 'Unknown error', { sessionId })
      expect(mockLogSessionOperation).toHaveBeenCalledWith('create', sessionId, undefined, false, 'Unknown error')
    })
  })

  describe('createSession', () => {
    const mockReceiptData: ReceiptData = [
      {
        '#': 1,
        Qty: 2,
        Unit: 'pcs',
        Price: 10.5,
        Art: 'ART001',
        Item: 'Test Item',
        Net: 21,
        VAT: 4.41,
        Total: 25.41
      }
    ]

    beforeEach(() => {
      mockValidateReceiptData.mockImplementation(() => {}) // No-op for success
      mockSql.mockResolvedValue([])
    })

    it('should validate data and create session successfully', async () => {
      await service.createSession('test-id', mockReceiptData)

      expect(mockValidateReceiptData).toHaveBeenCalledWith(mockReceiptData)
      expect(mockSql).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('INSERT INTO sessions')]),
        'test-id',
        JSON.stringify(mockReceiptData)
      )
    })

    it('should call handleError on database failure', async () => {
      const dbError = new Error('DB connection failed')
      mockSql.mockRejectedValue(dbError)

      await expect(service.createSession('test-id', mockReceiptData)).rejects.toThrow('Failed to create session data')

      expect(mockLogDatabaseError).toHaveBeenCalledWith('create', 'sessions', 'DB connection failed', { sessionId: 'test-id' })
      expect(mockLogSessionOperation).toHaveBeenCalledWith('create', 'test-id', undefined, false, 'DB connection failed')
    })
  })
})
