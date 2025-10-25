'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface PWAContextType {
  isInstallable: boolean
  isOffline: boolean
  installPWA: () => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function usePWA() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    // Return default values during SSR
    if (typeof window === 'undefined') {
      return {
        isInstallable: false,
        isOffline: false,
        installPWA: () => {},
      }
    }
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

interface PWAProviderProps {
  children: ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const { toast } = useToast()

  // Effect 1: Register service worker and handle updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  toast({
                    title: "New version available!",
                    description: "Refresh to update.",
                    action: (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        Refresh
                      </Button>
                    ),
                  })
                }
              })
            }
          })
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [toast])

  // Effect 2: Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)

      toast({
        title: "App can be installed!",
        description: "Tap the install button.",
      })
    }

    const handleAppInstalled = () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
      toast({
        title: "Success!",
        description: "App installed successfully!",
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [toast])

  // Effect 3: Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      toast({
        title: "Back online!",
      })
    }

    const handleOffline = () => {
      setIsOffline(true)
      toast({
        title: "You are offline",
        description: "Some features may not work.",
        variant: "destructive",
      })
    }

    // Initial offline check
    setIsOffline(!navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [toast])

  const installPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          toast({
            title: "Installation started!",
          })
        }
        setDeferredPrompt(null)
        setIsInstallable(false)
      })
    }
  }

  return (
    <PWAContext.Provider value={{ isInstallable, isOffline, installPWA }}>
      {children}
    </PWAContext.Provider>
  )
}
