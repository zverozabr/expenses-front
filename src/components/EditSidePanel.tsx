'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ReceiptItem } from '@/types'
import { recalculateRow } from '@/lib/calculations'

interface EditSidePanelProps {
  isOpen: boolean
  onClose: () => void
  rowData: ReceiptItem | null
  rowIndex: number | null
  onSave: (rowIndex: number, updatedRow: ReceiptItem) => void
}

/**
 * Side panel for editing receipt row fields
 * Opens on mobile as a bottom sheet, on desktop as a right sidebar
 */
export function EditSidePanel({
  isOpen,
  onClose,
  rowData,
  rowIndex,
  onSave,
}: EditSidePanelProps) {
  const [editedRow, setEditedRow] = useState<ReceiptItem | null>(null)

  // Update local state when rowData changes
  useEffect(() => {
    if (rowData) {
      setEditedRow({ ...rowData })
    }
  }, [rowData])

  const handleFieldChange = useCallback((field: string, value: string) => {
    if (!editedRow) return

    const numericFields = ['#', 'Qty', 'Price', 'Net', 'VAT', 'Total']
    const newValue = numericFields.includes(field) ? Number(value) || 0 : value

    // Determine if we should recalculate related fields
    const shouldRecalculate = ['Qty', 'Price', 'Net', 'VAT', 'Total'].includes(field)

    setEditedRow(prevRow => {
      if (!prevRow) return null

      return shouldRecalculate
        ? recalculateRow(prevRow, field, newValue as number)
        : { ...prevRow, [field]: newValue }
    })
  }, [editedRow])

  const handleSave = useCallback(() => {
    if (editedRow && rowIndex !== null) {
      onSave(rowIndex, editedRow)
      onClose()
    }
  }, [editedRow, rowIndex, onSave, onClose])

  const handleCancel = useCallback(() => {
    setEditedRow(rowData ? { ...rowData } : null)
    onClose()
  }, [rowData, onClose])

  if (!editedRow || rowIndex === null) {
    return null
  }

  const columns = Object.keys(editedRow)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Row #{editedRow['#'] || rowIndex + 1}</SheetTitle>
          <SheetDescription>
            Edit the values for this receipt item. Changes to Qty, Price, Net, VAT, or Total will automatically recalculate related fields.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Basic Information Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
              📦 Основная информация
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                Row Number (#)
              </label>
              <input
                type="number"
                value={editedRow['#'] || ''}
                onChange={(e) => handleFieldChange('#', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                Article Number (Art)
              </label>
              <input
                type="text"
                value={editedRow['Art'] || ''}
                onChange={(e) => handleFieldChange('Art', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                Item Name
              </label>
              <input
                type="text"
                value={editedRow['Item'] || ''}
                onChange={(e) => handleFieldChange('Item', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Quantity
                </label>
                <input
                  type="number"
                  value={editedRow['Qty'] || ''}
                  onChange={(e) => handleFieldChange('Qty', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  step="1"
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Unit
                </label>
                <input
                  type="text"
                  value={editedRow['Unit'] || ''}
                  onChange={(e) => handleFieldChange('Unit', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
              💰 Финансы
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                Price
              </label>
              <input
                type="number"
                value={editedRow['Price'] || ''}
                onChange={(e) => handleFieldChange('Price', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-right"
                step="0.01"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                Net
              </label>
              <input
                type="number"
                value={editedRow['Net'] || ''}
                onChange={(e) => handleFieldChange('Net', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-right"
                step="0.01"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                VAT
              </label>
              <input
                type="number"
                value={editedRow['VAT'] || ''}
                onChange={(e) => handleFieldChange('VAT', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-right"
                step="0.01"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                Total
              </label>
              <input
                type="number"
                value={editedRow['Total'] || ''}
                onChange={(e) => handleFieldChange('Total', e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-right font-semibold"
                step="0.01"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleSave}
              className="flex-1"
              size="sm"
            >
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
