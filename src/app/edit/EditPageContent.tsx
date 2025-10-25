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
import { sendSessionIdToBot } from '@/lib/telegram'

/**
 * Content component for the edit page that uses search params
 */
export function EditPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id') || null
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

  // Wrap saveData to send session ID to bot after successful save
  const handleSaveData = useCallback(async (newData: ReceiptData) => {
    try {
      await saveData(newData)

      // Send session ID to bot (this will also close the Mini App)
      if (sessionId) {
        const sent = sendSessionIdToBot(sessionId)
        if (sent) {
          console.log('Session ID sent to bot, Mini App will close automatically')
        } else {
          console.warn('Failed to send session ID to bot')
        }
      } else {
        console.warn('No session ID available to send to bot')
      }
    } catch (error) {
      console.error('Failed to save data:', error)
      // Don't close WebApp if save failed
    }
  }, [saveData, sessionId])

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
      <header className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Edit Receipt</h1>
              <div className="flex items-center gap-2">
                {/* Mobile tips - collapsed */}
                <details className="sm:hidden text-xs text-gray-500">
                  <summary className="cursor-pointer font-medium bg-gray-50 px-2 py-1 rounded border border-gray-200">📖 How to use</summary>
                  <div className="absolute right-2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-1 min-w-[200px] z-50">
                    <p>💡 Tap cells to edit values</p>
                    <p>🔢 Numeric fields: Qty, Price, Net, VAT, Total</p>
                    <p>☑️ Checkboxes to select rows for deletion</p>
                  </div>
                </details>
                <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200" title={`Git commit: ${process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || 'dev'}`}>
                  {getAppVersion()}
                </span>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 space-y-1 hidden sm:block">
              <p>💡 <strong>Tips:</strong> Double-click cells to edit, use checkboxes to select rows for deletion</p>
              <p>🔢 <strong>Numbers:</strong> Qty, Price, Net, VAT, Total fields accept only numeric values</p>
              <p>📊 <strong>Large tables:</strong> Automatic pagination and virtual scrolling for better performance</p>
            </div>
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
