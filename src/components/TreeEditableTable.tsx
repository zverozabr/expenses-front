'use client'

import React, { useState, useCallback, memo } from 'react'
import { EditableTableProps, ReceiptData, ReceiptItem } from '@/types'
import { Button } from '@/components/ui/button'
import { TreeView, TreeDataItem } from '@/components/tree-view'
import { FileText } from 'lucide-react'

/**
 * Tree-based editable table component
 * Organizes receipt data in a hierarchical structure to avoid horizontal scrolling
 * Groups fields into "Basic Info" and "Financial" categories
 */
export const TreeEditableTable = memo(function TreeEditableTable({
  data: initialData,
  onDataChange,
  loading = false,
}: EditableTableProps) {
  const [data, setData] = useState<ReceiptData>(initialData)
  const [originalData, setOriginalData] = useState<ReceiptData>(initialData)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>()

  // Update local state when prop changes
  React.useEffect(() => {
    setData(initialData)
    setOriginalData(initialData)
    setSelectedRows(new Set())
    setSelectedItemId(undefined)
  }, [initialData])

  // Recalculate row based on field changes
  const recalculateRow = useCallback((row: ReceiptItem, changedField: string, newValue: number): ReceiptItem => {
    const updatedRow = { ...row, [changedField]: newValue }

    // If Qty or Price changed, recalculate Net
    if (changedField === 'Qty' || changedField === 'Price') {
      const qty = changedField === 'Qty' ? newValue : (row['Qty'] || 0)
      const price = changedField === 'Price' ? newValue : (row['Price'] || 0)
      updatedRow['Net'] = qty * price
    }

    // If Net or VAT changed, recalculate Total
    if (changedField === 'Net' || changedField === 'VAT' || changedField === 'Qty' || changedField === 'Price') {
      const net = changedField === 'Net' ? newValue : (updatedRow['Net'] || 0)
      const vat = changedField === 'VAT' ? newValue : (row['VAT'] || 0)
      updatedRow['Total'] = net + vat
    }

    return updatedRow
  }, [])

  // Handle field change directly in tree
  const handleFieldChange = useCallback((rowIndex: number, field: string, value: string) => {
    const numericFields = ['#', 'Qty', 'Price', 'Net', 'VAT', 'Total']
    const newValue = numericFields.includes(field) ? Number(value) || 0 : value

    // Determine if we should recalculate related fields
    const shouldRecalculate = ['Qty', 'Price', 'Net', 'VAT', 'Total'].includes(field)

    const updateRow = (prevData: ReceiptData) => {
      const newData = [...prevData]
      const currentRow = newData[rowIndex]

      newData[rowIndex] = shouldRecalculate
        ? recalculateRow(currentRow, field, newValue as number)
        : { ...currentRow, [field]: newValue }

      return newData
    }

    setData(updateRow)
    setOriginalData(updateRow)
  }, [recalculateRow])

  // Convert receipt data to tree structure with inline editing
  const convertToTreeData = useCallback((): TreeDataItem[] => {
    return data.map((row, rowIndex) => {
      const rowId = `row-${rowIndex}`

      return {
        id: rowId,
        name: `${row['#'] || rowIndex + 1}. ${row['Item'] || 'Unnamed Item'}`,
        icon: FileText,
        children: [
          {
            id: `${rowId}-qty`,
            name: 'Qty:',
            actions: (
              <input
                type="number"
                value={row['Qty'] || ''}
                onChange={(e) => handleFieldChange(rowIndex, 'Qty', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
          {
            id: `${rowId}-unit`,
            name: 'Unit:',
            actions: (
              <input
                type="text"
                value={row['Unit'] || ''}
                onChange={(e) => handleFieldChange(rowIndex, 'Unit', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-28 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
          {
            id: `${rowId}-art`,
            name: 'Art:',
            actions: (
              <input
                type="text"
                value={row['Art'] || ''}
                onChange={(e) => handleFieldChange(rowIndex, 'Art', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-36 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
          {
            id: `${rowId}-item`,
            name: 'Item:',
            actions: (
              <input
                type="text"
                value={row['Item'] || ''}
                onChange={(e) => handleFieldChange(rowIndex, 'Item', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-52 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
          {
            id: `${rowId}-price`,
            name: 'Price:',
            actions: (
              <input
                type="number"
                step="0.01"
                value={row['Price'] || ''}
                onChange={(e) => handleFieldChange(rowIndex, 'Price', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-right hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
          {
            id: `${rowId}-net`,
            name: 'Net:',
            actions: (
              <input
                type="number"
                step="0.01"
                value={row['Net'] || ''}
                onChange={(e) => handleFieldChange(rowIndex, 'Net', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-right hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
          {
            id: `${rowId}-vat`,
            name: 'VAT:',
            actions: (
              <input
                type="number"
                step="0.01"
                value={row['VAT'] || ''}
                onChange={(e) => handleFieldChange(rowIndex, 'VAT', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-right hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
          {
            id: `${rowId}-total`,
            name: 'Total:',
            actions: (
              <input
                type="number"
                step="0.01"
                value={row['Total'] || ''}
                onChange={(e) => handleFieldChange(rowIndex, 'Total', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-right font-semibold hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
        ],
      }
    })
  }, [data, handleFieldChange])

  const handleAddRow = useCallback(() => {
    if (data.length > 0) {
      const emptyRow = Object.keys(data[0]).reduce((acc, key) => {
        if (key === '#') {
          acc[key] = data.length + 1
        } else if (key === 'Qty') {
          acc[key] = 1
        } else if (key === 'Unit') {
          acc[key] = 'pcs'
        } else if (key === 'Art') {
          acc[key] = ''
        } else if (key === 'Item') {
          acc[key] = 'New Item'
        } else if (['Price', 'Net', 'VAT', 'Total'].includes(key)) {
          acc[key] = 0
        } else {
          acc[key] = ''
        }
        return acc
      }, {} as any)

      setData(prevData => [...prevData, emptyRow])
      setOriginalData(prevData => [...prevData, emptyRow])
    }
  }, [data])

  const handleToggleRow = useCallback((rowIndex: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex)
      } else {
        newSet.add(rowIndex)
      }
      return newSet
    })
  }, [])

  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size > 0) {
      setData(prevData => prevData.filter((_, index) => !selectedRows.has(index)))
      setOriginalData(prevData => prevData.filter((_, index) => !selectedRows.has(index)))
      setSelectedRows(new Set())
    }
  }, [selectedRows])

  const handleSave = useCallback(async () => {
    if (onDataChange) {
      try {
        await onDataChange(data)
      } catch (error) {
        console.error('Failed to save data:', error)
      }
    }
  }, [data, onDataChange])

  const handleSelectChange = useCallback((item: TreeDataItem | undefined) => {
    setSelectedItemId(item?.id)
  }, [])

  if (data.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <p className="text-gray-600">No data available</p>
      </div>
    )
  }

  const treeData = convertToTreeData()

  return (
    <div className="w-full">
      {/* Table Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-2 sm:flex-wrap sm:items-center">
        <div className="flex gap-2 flex-1">
          <Button
            onClick={handleAddRow}
            variant="default"
            size="sm"
            className="flex-1 sm:flex-none"
            aria-label="Add new row"
          >
            <span className="hidden sm:inline">+ Add Row</span>
            <span className="sm:hidden">+ Row</span>
          </Button>
          <Button
            onClick={handleDeleteSelected}
            disabled={selectedRows.size === 0}
            variant="destructive"
            size="sm"
            className="flex-1 sm:flex-none"
            aria-label="Delete selected rows"
          >
            <span className="hidden sm:inline">Delete Selected ({selectedRows.size})</span>
            <span className="sm:hidden">Delete ({selectedRows.size})</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            size="sm"
            className="flex-1 sm:flex-none sm:ml-auto"
            aria-label="Save changes and send data back to bot"
          >
            {loading ? (
              <>
                <span className="hidden sm:inline">💾 Saving...</span>
                <span className="sm:hidden">💾</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">💾 Save & Send Back</span>
                <span className="sm:hidden">💾 Save</span>
              </>
            )}
          </Button>
        </div>
        <span className="text-sm text-gray-600 self-center sm:self-start">
          {data.length} {data.length === 1 ? 'row' : 'rows'}
        </span>
      </div>

      {/* Tree View */}
      <div className="w-full rounded-md border mb-4 overflow-hidden bg-white">
        <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <TreeView
            data={treeData}
            initialSelectedItemId={selectedItemId}
            onSelectChange={handleSelectChange}
            expandAll={false}
            className="p-2"
          />
        </div>
      </div>

      {/* Mobile hint */}
      <div className="text-xs text-gray-500 text-center mb-2">
        💡 Expand rows to edit values directly in the tree
      </div>
    </div>
  )
})
