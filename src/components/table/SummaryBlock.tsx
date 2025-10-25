'use client'

import React, { memo } from 'react'

interface SummaryBlockProps {
  data: Array<Record<string, string | number>>
}

/**
 * SummaryBlock component - displays summary statistics for the table
 * Extracted from SimpleEditableTable to improve maintainability
 */
export const SummaryBlock = memo(function SummaryBlock({ data }: SummaryBlockProps) {
  const itemsCount = data.length
  const netTotal = data.reduce((sum, row) => sum + (parseFloat(String(row['Net'])) || 0), 0).toFixed(2)
  const vatTotal = data.reduce((sum, row) => sum + (parseFloat(String(row['VAT'])) || 0), 0).toFixed(2)
  const grandTotal = data.reduce((sum, row) => sum + (parseFloat(String(row['Total'])) || 0), 0).toFixed(2)

  return (
    <div className="bg-gray-50 px-4 py-3" style={{ border: '1px solid #e5e7eb', marginTop: '2px' }}>
      <div className="flex justify-between items-center gap-2 text-xs">
        <span className="text-gray-700">
          Items: {itemsCount}
        </span>
        <span className="text-gray-700">
          NET: {netTotal}
        </span>
        <span className="text-gray-700">
          VAT: {vatTotal}
        </span>
        <span className="text-gray-700">
          TOTAL: {grandTotal}
        </span>
      </div>
    </div>
  )
})
