'use client'

import React, { useState, useCallback, memo } from 'react'
import { EditableTableProps, ReceiptData } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { recalculateRow } from '@/lib/calculations'
import { useSelectOnFocus } from '@/hooks/useSelectOnFocus'
import { NUMERIC_FIELDS, RECALCULATION_FIELDS, isNumericField, isRecalculationField, isRightAlignedField } from '@/constants/fields'

// Sort direction type
type SortDirection = 'asc' | 'desc' | null

// Chevron Down Icon for sorting
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/**
 * Simple editable table component using shadcn/ui Table
 * Mobile-optimized with horizontal and vertical scrolling
 * Supports column sorting by clicking on headers
 */
export const SimpleEditableTable = memo(function SimpleEditableTable({
  data: initialData,
  onDataChange,
  loading = false
}: EditableTableProps) {
  const [data, setData] = useState<ReceiptData>(initialData)
  const [originalData, setOriginalData] = useState<ReceiptData>(initialData)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const handleFocus = useSelectOnFocus()

  // Update local state when prop changes
  React.useEffect(() => {
    setData(initialData)
    setOriginalData(initialData)
    setSortColumn(null)
    setSortDirection(null)
    setSelectedRows(new Set())
  }, [initialData])

  // Handle column sorting
  const handleSort = useCallback((column: string) => {
    let newDirection: SortDirection = 'asc'

    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        newDirection = 'desc'
      } else if (sortDirection === 'desc') {
        newDirection = null
      }
    }

    setSortColumn(newDirection ? column : null)
    setSortDirection(newDirection)

    if (newDirection) {
      const sorted = [...originalData].sort((a, b) => {
        const aVal = a[column as keyof typeof a]
        const bVal = b[column as keyof typeof b]

        // Handle numeric fields
        if (isNumericField(column)) {
          const aNum = Number(aVal) || 0
          const bNum = Number(bVal) || 0
          return newDirection === 'asc' ? aNum - bNum : bNum - aNum
        }

        // Handle string fields
        const aStr = String(aVal || '').toLowerCase()
        const bStr = String(bVal || '').toLowerCase()
        if (newDirection === 'asc') {
          return aStr.localeCompare(bStr)
        } else {
          return bStr.localeCompare(aStr)
        }
      })
      setData(sorted)
    } else {
      // Reset to original order
      setData([...originalData])
    }
  }, [sortColumn, sortDirection, originalData])

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

  const handleAddRow = useCallback(() => {
    if (data.length > 0) {
      const emptyRow: typeof data[0] = {
        '#': data.length + 1,
        Qty: 1, // Default quantity to 1 (must be positive)
        Unit: 'pcs', // Default unit
        Item: 'New Item', // Default item name (cannot be empty)
        Price: 0,
        Art: '',
        Net: 0,
        VAT: 0,
        Total: 0
      }

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

  // Move selected rows up
  const handleMoveUp = useCallback(() => {
    if (selectedRows.size === 0) return

    const sortedIndices = Array.from(selectedRows).sort((a, b) => a - b)

    // Check if first selected row is already at the top
    if (sortedIndices[0] === 0) return

    const newData = [...data]

    // Move each selected row up by one position
    sortedIndices.forEach(index => {
      const temp = newData[index]
      newData[index] = newData[index - 1]
      newData[index - 1] = temp
    })

    // Recalculate Item IDs
    const recalculatedData = newData.map((row, index) => ({
      ...row,
      '#': index + 1
    }))

    setData(recalculatedData)
    setOriginalData(recalculatedData)

    // Update selected rows indices
    const newSelectedRows = new Set(sortedIndices.map(i => i - 1))
    setSelectedRows(newSelectedRows)
  }, [selectedRows, data])

  // Move selected rows down
  const handleMoveDown = useCallback(() => {
    if (selectedRows.size === 0) return

    const sortedIndices = Array.from(selectedRows).sort((a, b) => b - a)

    // Check if last selected row is already at the bottom
    if (sortedIndices[0] === data.length - 1) return

    const newData = [...data]

    // Move each selected row down by one position
    sortedIndices.forEach(index => {
      const temp = newData[index]
      newData[index] = newData[index + 1]
      newData[index + 1] = temp
    })

    // Recalculate Item IDs
    const recalculatedData = newData.map((row, index) => ({
      ...row,
      '#': index + 1
    }))

    setData(recalculatedData)
    setOriginalData(recalculatedData)

    // Update selected rows indices
    const newSelectedRows = new Set(sortedIndices.map(i => i + 1))
    setSelectedRows(newSelectedRows)
  }, [selectedRows, data])

  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size > 0) {
      setData(prevData =>
        prevData
          .filter((_, index) => !selectedRows.has(index))
          .map((row, index) => ({ ...row, '#': index + 1 }))
      )
      setOriginalData(prevData =>
        prevData
          .filter((_, index) => !selectedRows.has(index))
          .map((row, index) => ({ ...row, '#': index + 1 }))
      )
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

  if (data.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <p className="text-gray-600">No data available</p>
      </div>
    )
  }

  const columns = Object.keys(data[0])

  return (
    <div className="w-full">
      {/* Table Controls */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center" style={{ width: '100%' }}>
          <Button
            onClick={handleAddRow}
            variant="default"
            size="sm"
            aria-label="Add new row"
            style={{ flex: '15' }}
          >
            + Add
          </Button>
          <div style={{ flex: '3' }} />
          <Button
            onClick={handleDeleteSelected}
            disabled={selectedRows.size === 0}
            variant="destructive"
            size="sm"
            aria-label="Delete selected rows"
            style={{ flex: '15' }}
          >
            - Delete
          </Button>
          <div style={{ flex: '10' }} />
          <Button
            onClick={handleMoveUp}
            disabled={selectedRows.size === 0}
            variant="outline"
            size="sm"
            aria-label="Move selected rows up"
            style={{ flex: '10' }}
          >
            <ChevronUp className="h-4 w-4" />
            Up
          </Button>
          <Button
            onClick={handleMoveDown}
            disabled={selectedRows.size === 0}
            variant="outline"
            size="sm"
            aria-label="Move selected rows down"
            style={{ flex: '10' }}
          >
            <ChevronDown className="h-4 w-4" />
            Down
          </Button>
          <div style={{ flex: '3' }} />
          <Button
            onClick={handleSave}
            disabled={loading}
            size="sm"
            aria-label="Save changes and send data back to bot"
            style={{ flex: '15' }}
          >
            {loading ? '💾 Saving...' : '💾 Save'}
          </Button>
        </div>
      </div>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden md:block w-full rounded-md border mb-4 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                <TableHead className="h-10 px-2 text-center align-middle font-medium whitespace-nowrap text-xs sm:text-sm w-10">
                  ☑️
                </TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-xs sm:text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{
                      minWidth: column === 'Item' ? '200px' :
                                column === '#' ? '60px' :
                                ['Qty', 'Unit'].includes(column) ? '80px' :
                                ['Price', 'Net', 'VAT', 'Total'].includes(column) ? '100px' : '120px'
                    }}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column}</span>
                      {sortColumn === column && (
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform ${
                            sortDirection === 'desc' ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={selectedRows.has(rowIndex) ? 'bg-destructive/10' : ''}
                >
                  <TableCell className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => handleToggleRow(rowIndex)}
                      className="w-4 h-4 cursor-pointer accent-destructive"
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column} className="p-2">
                      <input
                        type={isNumericField(column) ? 'number' : 'text'}
                        value={row[column as keyof typeof row] || ''}
                        onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                        onFocus={handleFocus}
                        className={`w-full px-2 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                          column === 'Item' ? 'font-medium' : ''
                        } ${
                          isRightAlignedField(column) ? 'text-right' : ''
                        }`}
                        style={{
                          minWidth: column === 'Item' ? '190px' :
                                    column === '#' ? '50px' :
                                    ['Qty', 'Unit'].includes(column) ? '70px' : '90px'
                        }}
                        step={isRightAlignedField(column) ? '0.01' : '1'}
                        inputMode={isNumericField(column) ? 'decimal' : 'text'}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Accordion Cards - Shown only on mobile */}
      <div className="md:hidden space-y-3 mb-4">
        <Accordion type="multiple" className="w-full">
          {data.map((row, rowIndex) => {
            const itemName = row['Item'] || `Item ${rowIndex + 1}`
            const total = row['Total'] || 0
            const rowNumber = row['#'] || rowIndex + 1

            return (
              <AccordionItem
                key={rowIndex}
                value={`item-${rowIndex}`}
                className={`rounded-xl border mb-3 ${
                  selectedRows.has(rowIndex) ? 'bg-destructive/10 border-destructive' : 'bg-white'
                }`}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 min-w-[24px]">
                        {rowNumber}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleToggleRow(rowIndex)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 cursor-pointer accent-destructive"
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-sm font-normal" style={{ marginLeft: '-2px' }}>
                          {typeof row['Qty'] === 'number' ? row['Qty'].toFixed(2) : row['Qty']} {itemName}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-sm">
                      {typeof total === 'number' ? total.toFixed(2) : total}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {/* Row 1: Item (100%) */}
                    <div className="space-y-1">
                      <Label htmlFor={`${rowIndex}-Item`} className="text-xs font-medium text-gray-600">
                        Item
                      </Label>
                      <input
                        id={`${rowIndex}-Item`}
                        type="text"
                        value={row['Item'] || ''}
                        onChange={(e) => handleCellChange(rowIndex, 'Item', e.target.value)}
                        onFocus={handleFocus}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-medium"
                      />
                    </div>

                    {/* Row 2: Art (50%) | Unit (50%) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`${rowIndex}-Art`} className="text-xs font-medium text-gray-600">
                          Art
                        </Label>
                        <input
                          id={`${rowIndex}-Art`}
                          type="text"
                          value={row['Art'] || ''}
                          onChange={(e) => handleCellChange(rowIndex, 'Art', e.target.value)}
                          onFocus={handleFocus}
                          className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${rowIndex}-Unit`} className="text-xs font-medium text-gray-600">
                          Unit
                        </Label>
                        <input
                          id={`${rowIndex}-Unit`}
                          type="text"
                          value={row['Unit'] || ''}
                          onChange={(e) => handleCellChange(rowIndex, 'Unit', e.target.value)}
                          onFocus={handleFocus}
                          className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Row 3: Qty (50%) | Price (50%) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`${rowIndex}-Qty`} className="text-xs font-medium text-gray-600">
                          Qty
                        </Label>
                        <input
                          id={`${rowIndex}-Qty`}
                          type="number"
                          value={row['Qty'] || ''}
                          onChange={(e) => handleCellChange(rowIndex, 'Qty', e.target.value)}
                          onFocus={handleFocus}
                          className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-right"
                          step="0.01"
                          inputMode="decimal"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${rowIndex}-Price`} className="text-xs font-medium text-gray-600">
                          Price
                        </Label>
                        <input
                          id={`${rowIndex}-Price`}
                          type="number"
                          value={row['Price'] || ''}
                          onChange={(e) => handleCellChange(rowIndex, 'Price', e.target.value)}
                          onFocus={handleFocus}
                          className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-right"
                          step="0.01"
                          inputMode="decimal"
                        />
                      </div>
                    </div>

                    {/* Row 4: Net (37.5%) | VAT (25%) | Total (37.5%) */}
                    <div className="grid gap-3" style={{ gridTemplateColumns: '3fr 2fr 3fr' }}>
                      <div className="space-y-1">
                        <Label htmlFor={`${rowIndex}-Net`} className="text-xs font-medium text-gray-600">
                          Net
                        </Label>
                        <input
                          id={`${rowIndex}-Net`}
                          type="number"
                          value={row['Net'] || ''}
                          onChange={(e) => handleCellChange(rowIndex, 'Net', e.target.value)}
                          onFocus={handleFocus}
                          className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-right"
                          step="0.01"
                          inputMode="decimal"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${rowIndex}-VAT`} className="text-xs font-medium text-gray-600">
                          VAT
                        </Label>
                        <input
                          id={`${rowIndex}-VAT`}
                          type="number"
                          value={row['VAT'] || ''}
                          onChange={(e) => handleCellChange(rowIndex, 'VAT', e.target.value)}
                          onFocus={handleFocus}
                          className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-right"
                          step="0.01"
                          inputMode="decimal"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${rowIndex}-Total`} className="text-xs font-medium text-gray-600">
                          Total
                        </Label>
                        <input
                          id={`${rowIndex}-Total`}
                          type="number"
                          value={row['Total'] || ''}
                          onChange={(e) => handleCellChange(rowIndex, 'Total', e.target.value)}
                          onFocus={handleFocus}
                          className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-right font-bold"
                          step="0.01"
                          inputMode="decimal"
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
})
