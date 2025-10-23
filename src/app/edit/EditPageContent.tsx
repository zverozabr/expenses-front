'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useSessionData } from '@/hooks/useSessionData'
import { SimpleEditableTable as EditableTable } from '@/components/SimpleEditableTable'
import { usePWA } from '@/components/PWAProvider'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Wifi, WifiOff } from 'lucide-react'
import { ReceiptData } from '@/types'
import { getAppVersion } from '@/lib/version'

/**
 * Content component for the edit page that uses search params
 */
export function EditPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { data, loading, error, saveData } = useSessionData(sessionId)
  const { isInstallable, isOffline, installPWA } = usePWA()

  // Initialize Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp

      // Initialize WebApp
      tg.ready()

      // Expand to full height
      tg.expand()

      console.log('Telegram WebApp initialized:', {
        version: tg.version,
        platform: tg.platform,
        isExpanded: tg.isExpanded,
        viewportHeight: tg.viewportHeight
      })
    } else {
      console.log('Telegram WebApp not available (running in browser)')
    }
  }, [])

  // Wrap saveData to close Telegram WebApp after successful save
  const handleSaveData = useCallback(async (newData: ReceiptData) => {
    try {
      await saveData(newData)

      // Close Telegram WebApp after successful save
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        console.log('Closing Telegram WebApp...')

        // Small delay to ensure toast is visible
        setTimeout(() => {
          window.Telegram?.WebApp?.close()
        }, 500)
      } else {
        console.log('Telegram WebApp not available (running in browser)')
      }
    } catch (error) {
      console.error('Failed to save data:', error)
      // Don't close WebApp if save failed
    }
  }, [saveData])

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="mb-4">{error}</AlertDescription>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </div>
    )
  }

  if (!sessionId) {
    return (
      <div className="p-4">
        <Alert>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            No session ID provided. Please access this page through the Telegram bot.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-4 max-w-6xl mx-auto">
      {/* Version badge - top right corner */}
      <div className="fixed top-2 right-2 z-50">
        <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200" title={`Git commit: ${process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || 'dev'}`}>
          {getAppVersion()}
        </span>
      </div>

      <header className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">Edit Receipt</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3">
              Edit the receipt data and save to send back to Telegram.
            </p>
            <div className="text-xs sm:text-sm text-gray-500 space-y-1 hidden sm:block">
              <p>💡 <strong>Tips:</strong> Double-click cells to edit, use checkboxes to select rows for deletion</p>
              <p>🔢 <strong>Numbers:</strong> Qty, Price, Net, VAT, Total fields accept only numeric values</p>
              <p>📊 <strong>Large tables:</strong> Automatic pagination and virtual scrolling for better performance</p>
            </div>
            {/* Mobile tips - collapsed */}
            <details className="sm:hidden text-xs text-gray-500">
              <summary className="cursor-pointer font-medium mb-1">📖 How to use</summary>
              <div className="space-y-1 mt-2 pl-2 border-l-2 border-gray-200">
                <p>💡 Tap cells to edit values</p>
                <p>🔢 Numeric fields: Qty, Price, Net, VAT, Total</p>
                <p>☑️ Checkboxes to select rows for deletion</p>
              </div>
            </details>
          </div>

          {/* PWA Install Button */}
          {isInstallable && (
            <Button onClick={installPWA} size="sm" className="flex items-center gap-2 self-start">
              <Wifi className="w-4 h-4" />
              <span className="hidden sm:inline">Install App</span>
              <span className="sm:hidden">Install</span>
            </Button>
          )}
        </div>

        {/* Offline indicator */}
        {isOffline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Offline Mode</AlertTitle>
            <AlertDescription>
              Some features may not work
            </AlertDescription>
          </Alert>
        )}
      </header>

      <main>
        <EditableTable data={data} onDataChange={handleSaveData} loading={loading} />
      </main>
    </div>
  )
}
