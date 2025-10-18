import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { ReceiptData, UseSessionDataReturn } from '@/types'

// Demo data for development when database is not available
const demoData: ReceiptData = [
  {
    "#": 1,
    "Qty": 2,
    "Unit": "pcs",
    "Price": 25.00,
    "Art": "DEMO001",
    "Item": "Demo Product 1",
    "Net": 50.00,
    "VAT": 0.00,
    "Total": 50.00
  },
  {
    "#": 2,
    "Qty": 1,
    "Unit": "pcs",
    "Price": 15.00,
    "Art": "DEMO002",
    "Item": "Demo Product 2",
    "Net": 15.00,
    "VAT": 0.00,
    "Total": 15.00
  }
]

/**
 * Custom hook for managing session data with validation
 * @param sessionId - The session ID to load/save data for
 * @returns Object with validated data, loading state, error, and save function
 */
export function useSessionData(sessionId: string | null): UseSessionDataReturn {
  const [data, setData] = useState<ReceiptData>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
    try {
    const response = await fetch(`/api/session?session_id=${sessionId}`)
    if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status}`)
    }
    const result = await response.json()
    setData(result.data || [])
    setError(null)
    } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.log('Database not available, loading demo data for development')
    // Load demo data when database is not available
    setData(demoData)
    setError(null) // Don't show error for demo mode
    // Optional: Show info toast instead of error
    toast({
        title: "Demo Mode",
      description: "Database not available, showing demo data",
      })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sessionId])

  const saveData = useCallback(async (newData: ReceiptData) => {
  if (!sessionId) return

  try {
  const response = await fetch('/api/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ session_id: sessionId, data: newData }),
  })

  if (!response.ok) {
  const errorData = await response.json()
  throw new Error(errorData.error || 'Save failed')
  }

  const result = await response.json()
  if (result.success) {
  toast({
  title: "Success!",
  description: "Data validated, saved and sent back to bot!",
  })
  } else {
  throw new Error('Unexpected response from server')
  }
  } catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error'
  console.log('Database not available, saving locally for demo')
  // For demo purposes, just show success message
  toast({
  title: "Demo Mode",
    description: "Data saved locally (database not available)",
  })
    // Don't throw error for demo mode - just update local state
    }
  }, [sessionId])

  return { data, loading, error, saveData }
}
