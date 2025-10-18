/**
 * Types for the Telegram JSON Editor application
 */

import { ReceiptData, ReceiptItem } from '@/lib/validation'

// Generic table row type - allows any key-value pairs
export interface TableRow extends Record<string, any> {}

// Session data structure with proper typing
export interface SessionData {
  id: string
  data: ReceiptData // Use validated type instead of generic TableRow[]
  status: 'pending' | 'ready'
}

// API response types with proper generics
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
}

// Session service interface for dependency injection
export interface ISessionService {
  getSession(sessionId: string): Promise<SessionData | null>
  updateSession(sessionId: string, data: ReceiptData): Promise<void>
}

// Hook return type with proper typing
export interface UseSessionDataReturn {
  data: ReceiptData
  loading: boolean
  error: string | null
  saveData: (newData: ReceiptData) => Promise<void>
}

// Component props with proper typing
export interface EditableTableProps {
  data: ReceiptData
  onDataChange?: (data: ReceiptData) => void
  loading?: boolean
}

// Re-export validation types for convenience
export type { ReceiptData, ReceiptItem }
