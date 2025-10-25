'use client'

import React, { memo } from 'react'
import { Button } from '@/components/ui/button'

interface TableControlsProps {
  selectedRowsCount: number
  loading: boolean
  onAddRow: () => void
  onDeleteSelected: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onCopySelected: () => void
  onSave: () => void
}

/**
 * TableControls component - displays action buttons for table manipulation
 * Extracted from SimpleEditableTable to improve maintainability
 */
export const TableControls = memo(function TableControls({
  selectedRowsCount,
  loading,
  onAddRow,
  onDeleteSelected,
  onMoveUp,
  onMoveDown,
  onCopySelected,
  onSave,
}: TableControlsProps) {
  const hasSelection = selectedRowsCount > 0

  return (
    <div className="flex flex-col" style={{ marginBottom: '2px' }}>
      <div className="flex items-center" style={{ width: '100%', gap: 0 }}>
        <Button
          onClick={onAddRow}
          variant="outline"
          size="sm"
          aria-label="Add new row"
          style={{ flex: '10 1 0%', fontSize: '1.3em', minWidth: 0, padding: '0.5rem 0', boxSizing: 'border-box' }}
        >
          +
        </Button>
        <Button
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          variant="outline"
          size="sm"
          aria-label="Delete selected rows"
          style={{ flex: '10 1 0%', fontSize: '1.3em', minWidth: 0, padding: '0.5rem 0', boxSizing: 'border-box' }}
        >
          −
        </Button>
        <div style={{ flex: '10 1 0%' }} />
        <Button
          onClick={onMoveUp}
          disabled={!hasSelection}
          variant="outline"
          size="sm"
          aria-label="Move selected rows up"
          style={{ flex: '7 1 0%', fontSize: '1.3em', minWidth: 0, padding: '0.5rem 0', boxSizing: 'border-box' }}
        >
          ↑
        </Button>
        <Button
          onClick={onMoveDown}
          disabled={!hasSelection}
          variant="outline"
          size="sm"
          aria-label="Move selected rows down"
          style={{ flex: '7 1 0%', fontSize: '1.3em', minWidth: 0, padding: '0.5rem 0', boxSizing: 'border-box' }}
        >
          ↓
        </Button>
        <Button
          onClick={onCopySelected}
          disabled={!hasSelection}
          variant="outline"
          size="sm"
          aria-label="Copy selected rows"
          style={{ flex: '7 1 0%', fontSize: '1.3em', minWidth: 0, padding: '0.5rem 0', boxSizing: 'border-box' }}
        >
          📋
        </Button>
        <div style={{ flex: '10 1 0%' }} />
        <Button
          onClick={onSave}
          disabled={loading}
          variant="outline"
          size="sm"
          aria-label="Save changes and send data back to bot"
          style={{ flex: '10 1 0%', minWidth: 0, padding: '0.5rem 0.25rem', boxSizing: 'border-box' }}
        >
          {loading ? '💾 Saving...' : '💾 Save'}
        </Button>
      </div>
    </div>
  )
})
