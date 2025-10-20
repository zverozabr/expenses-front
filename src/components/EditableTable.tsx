'use client'

import React, { useEffect, useRef, useCallback, memo, useState } from 'react'
import { EditableTableProps, ReceiptData } from '@/types'
import { Button } from '@/components/ui/button'

// Tabulator will be loaded dynamically on client side
import type { Tabulator as TabulatorType } from 'tabulator-tables'

/**
 * Editable table component using Tabulator.js
 * Allows users to edit JSON data in a table format
 */
export const EditableTable = memo(function EditableTable({
  data,
  onDataChange,
  loading = false
}: EditableTableProps) {
  const tableRef = useRef<HTMLDivElement>(null)
  const tabulatorRef = useRef<TabulatorType | null>(null)
  const [Tabulator, setTabulator] = useState<any>(null)

  // Load Tabulator dynamically on client side
  useEffect(() => {
    import('tabulator-tables').then((module) => {
      setTabulator(() => module.TabulatorFull || module.Tabulator)
    })
  }, [])

  useEffect(() => {
    if (!tableRef.current || !Tabulator) return

    // KISS: Don't initialize table until we have data
    // This prevents creating a table without columns
    if (data.length === 0) return

    const columns = Object.keys(data[0]).map(key => {
      return {
        title: key,
        field: key,
        editor: key === 'Qty' || key === 'Price' || key === 'Net' || key === 'VAT' || key === 'Total'
          ? 'number'
          : key === '#' ? 'number' : 'input',
        width: key === '#' ? 60 : key === 'Qty' || key === 'Unit' ? 80 : undefined,
        minWidth: key === 'Item' ? 120 : undefined, // Ensure Item column has minimum width
      }
    })

    const config: any = {
      data: data,
      columns: columns,
      layout: 'fitData',
      addRowPos: 'bottom',
      placeholder: loading ? 'Loading...' : 'No data available',

      // Performance optimizations for large datasets
      ...(data.length > 50 && {
        height: '400px',
        pagination: true,
        paginationSize: 50,
      }),
    }

    // Destroy existing table if it exists (for data structure changes)
    if (tabulatorRef.current) {
      tabulatorRef.current.destroy()
    }

    tabulatorRef.current = new Tabulator(tableRef.current, config)

    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy()
        tabulatorRef.current = null
      }
    }
  }, [data.length, Tabulator]) // Re-initialize when data length changes or Tabulator loads

  const handleSave = useCallback(async () => {
    if (tabulatorRef.current && onDataChange) {
      try {
        const currentData = tabulatorRef.current.getData() as ReceiptData
        await onDataChange(currentData)
      } catch (error) {
        console.error('Failed to save data:', error)
        // Error is already handled in the hook
      }
    }
  }, [onDataChange])

  const handleAddRow = useCallback(() => {
    if (tabulatorRef.current && data.length > 0) {
      // Create empty row based on existing data structure
      const emptyRow = Object.keys(data[0]).reduce((acc, key) => {
        acc[key] = key === '#' ? data.length + 1 : '' // Auto-increment # field
        return acc
      }, {} as any)

      tabulatorRef.current.addRow(emptyRow, false) // Add at bottom
    }
  }, [data])

  const handleDeleteRow = useCallback(() => {
    if (tabulatorRef.current && data.length > 0) {
      // Delete last row for simplicity
      const rows = tabulatorRef.current.getRows()
      if (rows.length > 0) {
        rows[rows.length - 1].delete()
      }
    }
  }, [data])

  return (
    <div>
      {/* Table Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-2 sm:flex-wrap">
        <div className="flex gap-2">
          <Button
            onClick={handleAddRow}
            disabled={data.length === 0}
            variant="default"
            size="sm"
            className="flex-1 sm:flex-none"
            aria-label="Add new row"
          >
            <span className="hidden sm:inline">+ Add Row</span>
            <span className="sm:hidden">+ Row</span>
          </Button>
          <Button
            onClick={handleDeleteRow}
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
          {data.length > 0 ? `${data.length} rows` : 'No data'}
        </span>
      </div>

      {/* Table */}
      <div
        ref={tableRef}
        role="table"
        aria-label="Editable JSON data table"
        className="mb-4 min-h-[200px] border rounded overflow-hidden"
      />

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
            <span className="hidden sm:inline">💾 Save and Send Back</span>
            <span className="sm:hidden">💾 Save & Send</span>
          </>
        )}
      </Button>
    </div>
  )
})
