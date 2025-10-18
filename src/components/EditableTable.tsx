'use client'

import { useEffect, useRef, useCallback, memo } from 'react'
import { Tabulator } from 'tabulator-tables'
import { EditableTableProps, ReceiptData } from '@/types'
import { Button } from '@/components/ui/button'

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
  const tabulatorRef = useRef<Tabulator | null>(null)

  useEffect(() => {
    if (!tableRef.current) return

    const columns = data.length > 0 ? Object.keys(data[0]).map(key => {
      // Define responsive priorities (lower number = higher priority, 0 = never hide)
      const responsivePriority = {
        '#': 0,      // Always show
        'Item': 0,   // Always show
        'Qty': 0,    // Always show
        'Price': 0,  // Always show
        'Total': 0,  // Always show
        'Unit': 1,   // Hide first on mobile
        'Art': 1,    // Hide first on mobile
        'Net': 2,    // Hide second on mobile
        'VAT': 2,    // Hide second on mobile
      }[key] || 0

      return {
        title: key,
        field: key,
        editor: key === 'Qty' || key === 'Price' || key === 'Net' || key === 'VAT' || key === 'Total'
          ? 'number'
          : key === '#' ? 'number' : 'input',
        headerFilter: data.length > 10 ? 'input' : false, // Filters for larger datasets
        width: key === '#' ? 60 : key === 'Qty' || key === 'Unit' ? 80 : undefined,
        responsive: responsivePriority,
        minWidth: key === 'Item' ? 120 : undefined, // Ensure Item column has minimum width
      }
    }) : []

    const config: any = {
      data: data.length > 0 ? data : [],
      columns: [
        // Add checkbox column for row selection
        ...(data.length > 0 ? [{
          formatter: 'rowSelection',
          titleFormatter: 'rowSelection',
          hozAlign: 'center',
          headerSort: false,
          width: 40,
          cellClick: function(e: any, cell: any) {
            cell.getRow().toggleSelect()
          }
        }] : []),
        ...columns
      ],
      layout: 'fitDataTable', // Better for mobile - fits data to screen
      responsiveLayout: 'collapse', // Hide columns on small screens
      responsiveLayoutCollapseStartOpen: false,
      addRowPos: 'bottom',
      reactiveData: true,
      movableColumns: true,
      resizableRows: true,
      placeholder: loading ? 'Loading...' : 'No data available',
      selectableRows: true, // Enable row selection
      selectableRowsCheck: true, // Show checkboxes

      // Performance optimizations for large datasets
      ...(data.length > 50 && {
        virtualDom: 'viewport', // Virtual DOM for large tables with viewport scrolling
        pagination: 'local',
        paginationSize: 50,
        paginationSizeSelector: [25, 50, 100],
        paginationCounter: 'rows',
        paginationButtonCount: 5,
      }),

      // Virtual DOM for smaller datasets too for smooth scrolling
      ...(data.length > 10 && {
        virtualDom: 'viewport',
      }),

      // Additional features for better UX
      tooltips: true,
    }

    tabulatorRef.current = new Tabulator(tableRef.current, config)

    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy()
      }
    }
  }, []) // Initialize only once

  // Update data when it changes
  useEffect(() => {
    if (tabulatorRef.current) {
      if (data.length > 0) {
        tabulatorRef.current.replaceData(data)
      } else {
        tabulatorRef.current.clearData()
      }
    }
  }, [data])

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
    if (tabulatorRef.current) {
      const selectedRows = tabulatorRef.current.getSelectedRows()
      selectedRows.forEach(row => row.delete())
    }
  }, [])

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
            aria-label="Delete selected rows"
          >
            <span className="hidden sm:inline">🗑️ Delete Selected</span>
            <span className="sm:hidden">🗑️ Delete</span>
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
