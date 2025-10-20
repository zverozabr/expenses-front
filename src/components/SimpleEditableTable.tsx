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

/**
 * Simple editable table component using shadcn/ui Table
 * Mobile-optimized with horizontal and vertical scrolling
 */
export const SimpleEditableTable = memo(function SimpleEditableTable({
  data: initialData,
  onDataChange,
  loading = false
}: EditableTableProps) {
  const [data, setData] = useState<ReceiptData>(initialData)

  // Update local state when prop changes
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleCellChange = useCallback((rowIndex: number, field: string, value: string) => {
    setData(prevData => {
      const newData = [...prevData]
      const numericFields = ['#', 'Qty', 'Price', 'Net', 'VAT', 'Total']

      newData[rowIndex] = {
        ...newData[rowIndex],
        [field]: numericFields.includes(field) ? Number(value) || 0 : value
      }

      return newData
    })
  }, [])

  const handleAddRow = useCallback(() => {
    if (data.length > 0) {
      const emptyRow = Object.keys(data[0]).reduce((acc, key) => {
        acc[key] = key === '#' ? data.length + 1 : ''
        return acc
      }, {} as any)

      setData(prevData => [...prevData, emptyRow])
    }
  }, [data])

  const handleDeleteLastRow = useCallback(() => {
    if (data.length > 0) {
      setData(prevData => prevData.slice(0, -1))
    }
  }, [data.length])

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
      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-2 sm:flex-wrap">
        <div className="flex gap-2">
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
            onClick={handleDeleteLastRow}
            disabled={data.length === 0}
            variant="destructive"
            size="sm"
            className="flex-1 sm:flex-none"
            aria-label="Delete last row"
          >
            <span className="hidden sm:inline">Delete Last Row</span>
            <span className="sm:hidden">Delete</span>
          </Button>
        </div>
        <span className="text-sm text-gray-600 self-center sm:self-start">
          {data.length} {data.length === 1 ? 'row' : 'rows'}
        </span>
      </div>

      {/* Table - Mobile-optimized with shadcn/ui components */}
      <div className="border rounded-lg shadow-sm mb-4 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0 z-10">
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className="font-semibold text-gray-800 whitespace-nowrap text-xs sm:text-sm border-b-2 border-blue-200"
                    style={{
                      minWidth: column === 'Item' ? '180px' :
                                column === '#' ? '50px' :
                                ['Qty', 'Unit'].includes(column) ? '70px' : '90px'
                    }}
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-blue-50 transition-colors"
                >
                  {columns.map((column) => (
                    <TableCell key={column} className="p-2">
                      <input
                        type={['#', 'Qty', 'Price', 'Net', 'VAT', 'Total'].includes(column) ? 'number' : 'text'}
                        value={row[column] || ''}
                        onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                        className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
                        style={{
                          minWidth: column === 'Item' ? '170px' :
                                    column === '#' ? '40px' :
                                    ['Qty', 'Unit'].includes(column) ? '60px' : '80px',
                          fontSize: column === 'Item' ? '14px' : '13px'
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

      {/* Mobile scroll hint */}
      <div className="text-xs text-gray-500 text-center mb-2 sm:hidden">
        ← Swipe to see all columns →
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={loading}
        size="lg"
        className="w-full sm:w-auto"
        aria-label="Save changes and send data back to bot"
      >
        {loading ? (
          <>
            <span className="hidden sm:inline">💾 Saving...</span>
            <span className="sm:hidden">💾 Saving...</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">💾 Save & Send Back</span>
            <span className="sm:hidden">💾 Save</span>
          </>
        )}
      </Button>
    </div>
  )
})
