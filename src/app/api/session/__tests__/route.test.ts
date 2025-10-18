import { sessionService } from '@/lib/sessionService'
import { makroReceiptJson, makroReceiptEditedJson, smallReceiptJson, invalidReceiptJson } from '@/test-data/receiptData'
import { ReceiptData } from '@/types'

// Mock the service methods
jest.mock('@/lib/sessionService')

const mockGetSession = sessionService.getSession as jest.MockedFunction<typeof sessionService.getSession>
const mockUpdateSession = sessionService.updateSession as jest.MockedFunction<typeof sessionService.updateSession>

describe('SessionService with Receipt Data Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSession with receipt data', () => {
    it('returns Makro receipt data for valid session_id', async () => {
      const sessionId = 'receipt-session'
      const mockSession = { id: sessionId, data: makroReceiptJson, status: 'pending' as const }

      mockGetSession.mockResolvedValueOnce(mockSession)

      const result = await sessionService.getSession(sessionId)

      expect(result).toEqual(mockSession)
      expect(result?.data).toHaveLength(7) // 7 items in receipt
      expect(result?.data[0]).toHaveProperty('Item', 'Est Cola / เอส.')
      expect(mockGetSession).toHaveBeenCalledWith(sessionId)
    })

    it('returns null for non-existent session', async () => {
      mockGetSession.mockResolvedValueOnce(null)

      const result = await sessionService.getSession('nonexistent')

      expect(result).toBeNull()
    })

    it('validates data from database and throws on invalid data', async () => {
      const sessionId = 'corrupted-session'
      // Mock corrupted data in database
      mockGetSession.mockImplementationOnce(async () => {
        throw new Error('Corrupted data in database')
      })

      await expect(sessionService.getSession(sessionId)).rejects.toThrow('Corrupted data in database')
    })
  })

  describe('updateSession with receipt data validation', () => {
    it('updates session with edited receipt data after validation', async () => {
      const sessionId = 'receipt-session'

      mockUpdateSession.mockResolvedValueOnce(undefined)

      await sessionService.updateSession(sessionId, makroReceiptEditedJson)

      expect(mockUpdateSession).toHaveBeenCalledWith(sessionId, makroReceiptEditedJson)
      expect(makroReceiptEditedJson).toHaveLength(6) // Original 7, removed 2, added 1
    })

    it('handles small receipt data', async () => {
      const sessionId = 'small-receipt-session'

      mockUpdateSession.mockResolvedValueOnce(undefined)

      await sessionService.updateSession(sessionId, smallReceiptJson)

      expect(mockUpdateSession).toHaveBeenCalledWith(sessionId, smallReceiptJson)
      expect(smallReceiptJson).toHaveLength(2)
    })

    it('handles receipt data with quantity changes', async () => {
      const sessionId = 'qty-change-session'
      const editedData: ReceiptData = makroReceiptJson.map(item =>
        item['#'] === 2 ? {
          ...item,
          Qty: 5,
          Net: 392.52,
          VAT: 27.48,
          Total: 420.00
        } : item
      )

      mockUpdateSession.mockResolvedValueOnce(undefined)

      await sessionService.updateSession(sessionId, editedData)

      expect(mockUpdateSession).toHaveBeenCalledWith(sessionId, editedData)
      const modifiedItem = editedData.find(item => item['#'] === 2)
      expect(modifiedItem?.Qty).toBe(5)
      expect(modifiedItem?.Total).toBe(420.00)
    })

    it('throws error for invalid receipt data', async () => {
      const sessionId = 'invalid-data-session'

      // Create invalid data that will fail validation
      const invalidData = [
        { "#": 1, "Qty": -1, "Unit": "pcs", "Price": 5.99, "Art": "", "Item": "", "Net": 11.98, "VAT": 0.00, "Total": 11.98 }
      ]

      // Mock to simulate validation failure
      mockUpdateSession.mockRejectedValueOnce(new Error('Failed to update session data'))

      // This should throw validation error
      await expect(sessionService.updateSession(sessionId, invalidData as any)).rejects.toThrow('Failed to update session data')
    })
  })

  describe('Error handling', () => {
    it('handles database errors in getSession', async () => {
      mockGetSession.mockRejectedValueOnce(new Error('Database connection failed'))

      await expect(sessionService.getSession('test')).rejects.toThrow('Database connection failed')
    })

    it('handles database errors in updateSession', async () => {
      mockUpdateSession.mockRejectedValueOnce(new Error('Update failed'))

      await expect(sessionService.updateSession('test', smallReceiptJson)).rejects.toThrow('Update failed')
    })
  })
})
