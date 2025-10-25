'use client'

import React, { useState, useCallback, memo } from 'react'
import { EditableTableProps, ReceiptData } from '@/types'
import { Accordion } from '@/components/ui/accordion'
import { recalculateRow } from '@/lib/calculations'
import { useSelectOnFocus } from '@/hooks/useSelectOnFocus'
import { useTableRowOperations } from '@/hooks/useTableRowOperations'
import { isNumericField, isRecalculationField } from '@/constants/fields'
import { RowCard } from '@/components/table/RowCard'
import { TableControls } from '@/components/table/TableControls'
import { SummaryBlock } from '@/components/table/SummaryBlock'

/**
 * Simple editable table component using shadcn/ui Table
 * Mobile-optimized with horizontal and vertical scrolling
 * Refactored to use custom hooks and smaller components for better maintainability
 */
export const SimpleEditableTable = memo(function SimpleEditableTable({
  data: initialData,
  onDataChange,
  loading = false
}: EditableTableProps) {
  const [data, setData] = useState<ReceiptData>(initialData)
  const [originalData, setOriginalData] = useState<ReceiptData>(initialData)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const handleFocus = useSelectOnFocus()

  // Update local state when prop changes
  React.useEffect(() => {
    setData(initialData)
    setOriginalData(initialData)
    setSelectedRows(new Set())
  }, [initialData])

  // Use custom hook for row operations
  const {
    handleAddRow,
    handleToggleRow,
    handleMoveUp,
    handleMoveDown,
    handleCopySelected,
    handleDeleteSelected,
  } = useTableRowOperations(data, setData, setOriginalData, selectedRows, setSelectedRows)

  const handleCellChange = useCallback((rowIndex: number, field: string, value: string) => {
    const newValue = isNumericField(field) ? Number(value) || 0 : value

    // Determine if we should recalculate related fields
    const shouldRecalculate = isRecalculationField(field)

    // DRY: Single function to update a row with or without recalculation
    const updateRow = (prevData: ReceiptData) => {
      const newData = [...prevData]
      const currentRow = newData[rowIndex]

      newData[rowIndex] = shouldRecalculate
        ? recalculateRow(currentRow, field, newValue as number)
        : { ...currentRow, [field]: newValue }

      return newData
    }

    // Update both data and originalData using the same logic
    setData(updateRow)
    setOriginalData(updateRow)
  }, [])

  const handleSave = useCallback(async () => {
    if (onDataChange) {
      try {
        await onDataChange(data)
      } catch (error) {
        console.error('Failed to save data:', error)
      }
    }
  }, [data, onDataChange])

  if (data.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50" style={{ fontFamily: 'Verdana, sans-serif' }}>
        <p className="text-gray-600">No data available</p>
      </div>
    )
  }

  return (
    <div className="w-full" style={{ fontFamily: 'Verdana, sans-serif' }}>
      {/* Table Controls */}
      <TableControls
        selectedRowsCount={selectedRows.size}
        loading={loading}
        onAddRow={handleAddRow}
        onDeleteSelected={handleDeleteSelected}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onCopySelected={handleCopySelected}
        onSave={handleSave}
      />

      {/* Mobile Accordion Cards */}
      <div className="space-y-3 mb-4">
        <Accordion type="multiple" className="w-full">
          {data.map((row, rowIndex) => (
            <RowCard
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
              isSelected={selectedRows.has(rowIndex)}
              onToggleRow={handleToggleRow}
              onCellChange={handleCellChange}
              onFocus={handleFocus}
            />
          ))}
        </Accordion>

        {/* Summary Block */}
        <SummaryBlock data={data} />
      </div>
    </div>
  )
})
