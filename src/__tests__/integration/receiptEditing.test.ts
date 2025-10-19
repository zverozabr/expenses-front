/**
 * Integration tests for receipt editing workflow
 * Tests the complete flow from receiving receipt data to editing and saving
 */

import { makroReceiptJson, makroReceiptEditedJson, smallReceiptJson } from '@/test-data/receiptData'

// Mock the entire Next.js API layer
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(url: string) {
      this.url = url
    }
    url: string
    headers = new Map([['x-forwarded-for', '127.0.0.1']])
    json = jest.fn()
  },
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
      headers: options?.headers || {}
    }))
  }
}))

// Mock sessionService
jest.mock('@/lib/sessionService', () => ({
  sessionService: {
    getSession: jest.fn(),
    upsertSession: jest.fn(),
  },
}))

import { GET, POST } from '@/app/api/session/route'
import { sessionService } from '@/lib/sessionService'

const mockGetSession = sessionService.getSession as jest.MockedFunction<typeof sessionService.getSession>
const mockUpsertSession = sessionService.upsertSession as jest.MockedFunction<typeof sessionService.upsertSession>

describe('Receipt Editing Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Receipt Workflow', () => {
    it('should handle loading and editing Makro receipt', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000'

      // Mock loading receipt data
      const mockSession = {
        id: sessionId,
        data: makroReceiptJson,
        status: 'pending'
      }
      mockGetSession.mockResolvedValueOnce(mockSession)

      // Test GET request
      const getRequest = new (require('next/server').NextRequest)(`http://localhost/api/session?session_id=${sessionId}`)
      const getResponse = await GET(getRequest)

      expect(getResponse.status).toBe(200)
      const getResult = await getResponse.json()
      expect(getResult.data).toEqual(makroReceiptJson)
      expect(getResult.data).toHaveLength(7)

      // Verify receipt structure
      expect(getResult.data[0]).toEqual(
        expect.objectContaining({
          "#": 1,
          "Qty": 1,
          "Unit": "pcs",
          "Price": 89.00,
          "Item": "Est Cola / เอส.",
          "Total": 89.00
        })
      )

      // Mock saving edited data
      mockUpsertSession.mockResolvedValueOnce(undefined)

      // Test POST request with edited data
      const postRequest = new (require('next/server').NextRequest)('http://localhost/api/session')
      postRequest.json.mockResolvedValueOnce({
        session_id: sessionId,
        data: makroReceiptEditedJson
      })

      const postResponse = await POST(postRequest)

      expect(postResponse.status).toBe(200)
      const postResult = await postResponse.json()
      expect(postResult.success).toBe(true)
      expect(mockUpsertSession).toHaveBeenCalledWith(sessionId, makroReceiptEditedJson)
    })

    it('should handle quantity modifications in receipt', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440001'

      // Original receipt
      const originalReceipt = makroReceiptJson
      mockGetSession.mockResolvedValueOnce({
        id: sessionId,
        data: originalReceipt,
        status: 'pending'
      })

      // Load original
      const getRequest = new (require('next/server').NextRequest)(`http://localhost/api/session?session_id=${sessionId}`)
      const getResponse = await GET(getRequest)
      const getResult = await getResponse.json()

      expect(getResult.data[1].Qty).toBe(2) // Kratingdaeng original quantity

      // Modify quantities (increase Kratingdaeng from 2 to 4)
      const modifiedReceipt = getResult.data.map((item: any) =>
        item['#'] === 2
          ? {
              ...item,
              Qty: 4,
              Net: item.Net * 2, // Double the net amount
              VAT: item.VAT * 2, // Double the VAT
              Total: item.Total * 2 // Double the total
            }
          : item
      )

      // Save modifications
      mockUpsertSession.mockResolvedValueOnce(undefined)
      const postRequest = new (require('next/server').NextRequest)('http://localhost/api/session')
      postRequest.json.mockResolvedValueOnce({
        session_id: sessionId,
        data: modifiedReceipt
      })

      const postResponse = await POST(postRequest)
      const postResult = await postResponse.json()

      expect(postResult.success).toBe(true)
      expect(mockUpsertSession).toHaveBeenCalledWith(sessionId, modifiedReceipt)

      // Verify the modification
      const modifiedItem = modifiedReceipt.find((item: any) => item['#'] === 2)
      expect(modifiedItem.Qty).toBe(4)
      expect(modifiedItem.Total).toBe(336.00) // 168 * 2
    })

    it('should handle item removal from receipt', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440002'

      mockGetSession.mockResolvedValueOnce({
        id: sessionId,
        data: makroReceiptJson,
        status: 'pending'
      })

      // Load original
      const getRequest = new (require('next/server').NextRequest)(`http://localhost/api/session?session_id=${sessionId}`)
      const getResponse = await GET(getRequest)
      const getResult = await getResponse.json()

      expect(getResult.data).toHaveLength(7)

      // Remove items (snack products)
      const filteredReceipt = getResult.data.filter((item: any) =>
        !item.Item.includes('Snack') && !item.Item.includes('Food Product')
      )

      expect(filteredReceipt).toHaveLength(5) // Removed 2 items

      // Save filtered receipt
      mockUpsertSession.mockResolvedValueOnce(undefined)
      const postRequest = new (require('next/server').NextRequest)('http://localhost/api/session')
      postRequest.json.mockResolvedValueOnce({
        session_id: sessionId,
        data: filteredReceipt
      })

      const postResponse = await POST(postRequest)
      const postResult = await postResponse.json()

      expect(postResult.success).toBe(true)
      expect(mockUpsertSession).toHaveBeenCalledWith(sessionId, filteredReceipt)
    })

    it('should handle adding new items to receipt', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440003'

      mockGetSession.mockResolvedValueOnce({
        id: sessionId,
        data: smallReceiptJson,
        status: 'pending'
      })

      // Load original
      const getRequest = new (require('next/server').NextRequest)(`http://localhost/api/session?session_id=${sessionId}`)
      const getResponse = await GET(getRequest)
      const getResult = await getResponse.json()

      const originalLength = getResult.data.length

      // Add new item
      const newItem = {
        "#": 8,
        "Qty": 1,
        "Unit": "pcs",
        "Price": 250.00,
        "Art": "NEW123",
        "Item": "Premium Chocolate Bar",
        "Net": 250.00,
        "VAT": 17.50,
        "Total": 267.50
      }

      const receiptWithNewItem = [...getResult.data, newItem]

      expect(receiptWithNewItem).toHaveLength(originalLength + 1)

      // Save receipt with new item
      mockUpsertSession.mockResolvedValueOnce(undefined)
      const postRequest = new (require('next/server').NextRequest)('http://localhost/api/session')
      postRequest.json.mockResolvedValueOnce({
        session_id: sessionId,
        data: receiptWithNewItem
      })

      const postResponse = await POST(postRequest)
      const postResult = await postResponse.json()

      expect(postResult.success).toBe(true)
      expect(mockUpsertSession).toHaveBeenCalledWith(sessionId, receiptWithNewItem)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440004'

      // Mock database error
      mockGetSession.mockRejectedValueOnce(new Error('Database connection failed'))

      const request = new (require('next/server').NextRequest)(`http://localhost/api/session?session_id=${sessionId}`)
      const response = await GET(request)

      expect(response.status).toBe(500)
      const result = await response.json()
      expect(result.error).toBe('Internal server error')
    })

    it('should validate receipt data structure', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440005'

      // Invalid data - not an array
      const postRequest = new (require('next/server').NextRequest)('http://localhost/api/session')
      postRequest.json.mockResolvedValueOnce({
        session_id: sessionId,
        data: "invalid data"
      })

      const response = await POST(postRequest)

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toContain('Invalid receipt data')
    })
  })
})
