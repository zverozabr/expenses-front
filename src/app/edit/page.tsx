'use client'

import { Suspense } from 'react'
import { EditPageContent } from './EditPageContent'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

/**
 * Page component for editing JSON data from Telegram bot
 * Displays an editable table and handles saving changes
 * Includes PWA installation prompt
 */
export default function EditPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <EditPageContent />
    </Suspense>
  )
}
