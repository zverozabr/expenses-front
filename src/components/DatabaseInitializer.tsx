'use client'

import { useEffect, useState } from 'react'
import { initDatabase } from '@/lib/initDb'

export function DatabaseInitializer() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Only run on client side and only once
    if (typeof window !== 'undefined' && !initialized) {
      console.log('🚀 Starting database initialization...')

      initDatabase().then((success) => {
        if (success) {
          console.log('✅ Database initialized successfully')
          setInitialized(true)
        } else {
          console.warn('⚠️ Database initialization failed, but app will continue')
          setInitialized(true) // Still mark as initialized to avoid retries
        }
      })
    }
  }, [initialized])

  // This component doesn't render anything
  return null
}
