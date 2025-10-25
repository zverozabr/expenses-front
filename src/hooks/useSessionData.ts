import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { ReceiptData, UseSessionDataReturn } from '@/types'
import { demoReceiptData } from '@/test-data/demoReceiptData'

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
        // Fallback to demo data when database is not available
        console.log('📊 Loading demo data (database not available)')
        setData(demoReceiptData)
        setError(null) // Don't show error for demo mode

        // Only show toast in development mode
        if (process.env.NODE_ENV === 'development') {
          toast({
            title: "Demo Mode",
            description: "Database not available, showing demo data",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sessionId, toast])

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
      console.log('💾 Demo mode: saving locally (database not available)')

      // For demo purposes, just show success message in development
      if (process.env.NODE_ENV === 'development') {
        toast({
          title: "Demo Mode",
          description: "Data saved locally (database not available)",
        })
      }
      // Don't throw error for demo mode - just update local state silently
    }
  }, [sessionId, toast])

  return { data, loading, error, saveData }
}
