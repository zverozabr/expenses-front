'use client'

import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import styles from './table.module.css'

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
    <div className={`flex flex-col ${styles.controlsContainer}`}>
      <div className={`flex items-center ${styles.controlsRow}`}>
        <Button
          onClick={onAddRow}
          variant="outline"
          size="sm"
          aria-label="Add new row"
          className={`${styles.buttonBase} ${styles.buttonFlex10}`}
        >
          +
        </Button>
        <Button
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          variant="outline"
          size="sm"
          aria-label="Delete selected rows"
          className={`${styles.buttonBase} ${styles.buttonFlex10}`}
        >
          −
        </Button>
        <div className={styles.spacerFlex10} />
        <Button
          onClick={onMoveUp}
          disabled={!hasSelection}
          variant="outline"
          size="sm"
          aria-label="Move selected rows up"
          className={`${styles.buttonBase} ${styles.buttonFlex7}`}
        >
          ↑
        </Button>
        <Button
          onClick={onMoveDown}
          disabled={!hasSelection}
          variant="outline"
          size="sm"
          aria-label="Move selected rows down"
          className={`${styles.buttonBase} ${styles.buttonFlex7}`}
        >
          ↓
        </Button>
        <Button
          onClick={onCopySelected}
          disabled={!hasSelection}
          variant="outline"
          size="sm"
          aria-label="Copy selected rows"
          className={`${styles.buttonBase} ${styles.buttonFlex7}`}
        >
          📋
        </Button>
        <div className={styles.spacerFlex10} />
        <Button
          onClick={onSave}
          disabled={loading}
          variant="outline"
          size="sm"
          aria-label="Save changes and send data back to bot"
          className={styles.saveButton}
        >
          {loading ? '💾 Saving...' : '💾 Save'}
        </Button>
      </div>
    </div>
  )
})
