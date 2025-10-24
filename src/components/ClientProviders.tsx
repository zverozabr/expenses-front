'use client'

import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PWAProvider } from '@/components/PWAProvider'

interface ClientProvidersProps {
  children: ReactNode
}

/**
 * Client-side providers wrapper
 * This component ensures that all client-side context providers
 * are only rendered on the client, avoiding SSR/build errors
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <PWAProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <Toaster />
    </PWAProvider>
  )
}
