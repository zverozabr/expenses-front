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
import { recalculateRow } from '@/lib/calculations'

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
        const numericFields = ['#', 'Qty', 'Price', 'Net', 'VAT', 'Total']
        if (numericFields.includes(column)) {
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
    const numericFields = ['#', 'Qty', 'Price', 'Net', 'VAT', 'Total']
    const newValue = numericFields.includes(field) ? Number(value) || 0 : value

    // Determine if we should recalculate related fields
    const shouldRecalculate = ['Qty', 'Price', 'Net', 'VAT', 'Total'].includes(field)

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
      const emptyRow = Object.keys(data[0]).reduce((acc, key) => {
        // Set default values that pass validation
        if (key === '#') {
          acc[key] = data.length + 1
        } else if (key === 'Qty') {
          acc[key] = 1 // Default quantity to 1 (must be positive)
        } else if (key === 'Unit') {
          acc[key] = 'pcs' // Default unit
        } else if (key === 'Item') {
          acc[key] = 'New Item' // Default item name (cannot be empty)
        } else if (['Price', 'Net', 'VAT', 'Total'].includes(key)) {
          acc[key] = 0 // Default numeric values to 0
        } else {
          acc[key] = '' // Other fields can be empty
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
                        type={['#', 'Qty', 'Price', 'Net', 'VAT', 'Total'].includes(column) ? 'number' : 'text'}
                        value={row[column as keyof typeof row] || ''}
                        onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                        className={`w-full px-2 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                          column === 'Item' ? 'font-medium' : ''
                        } ${
                          ['Price', 'Net', 'VAT', 'Total'].includes(column) ? 'text-right' : ''
                        }`}
                        style={{
                          minWidth: column === 'Item' ? '190px' :
                                    column === '#' ? '50px' :
                                    ['Qty', 'Unit'].includes(column) ? '70px' : '90px'
                        }}
                        step={['Price', 'Net', 'VAT', 'Total'].includes(column) ? '0.01' : '1'}
                        inputMode={['#', 'Qty', 'Price', 'Net', 'VAT', 'Total'].includes(column) ? 'decimal' : 'text'}
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
                      <div className="text-left">
                        <div className="font-semibold text-sm">
                          {rowNumber}. {itemName}
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
                    {columns
                      .filter(column => !['select', 'index'].includes(column.toLowerCase()))
                      .map((column) => (
                        <div key={column} className="space-y-1">
                          <Label htmlFor={`${rowIndex}-${column}`} className="text-xs font-medium text-gray-600">
                            {column}
                          </Label>
                          <input
                            id={`${rowIndex}-${column}`}
                            type={['#', 'Qty', 'Price', 'Net', 'VAT', 'Total'].includes(column) ? 'number' : 'text'}
                            value={row[column as keyof typeof row] || ''}
                            onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                              column === 'Item' ? 'font-medium' : ''
                            } ${
                              ['Price', 'Net', 'VAT', 'Total'].includes(column) ? 'text-right' : ''
                            } ${
                              column === 'Total' ? 'font-bold' : ''
                            }`}
                            step={['Price', 'Net', 'VAT', 'Total'].includes(column) ? '0.01' : '1'}
                            inputMode={['#', 'Qty', 'Price', 'Net', 'VAT', 'Total'].includes(column) ? 'decimal' : 'text'}
                          />
                        </div>
                      ))}
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
