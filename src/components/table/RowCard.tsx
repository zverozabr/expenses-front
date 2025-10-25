'use client'

import React, { memo } from 'react'
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import styles from './table.module.css'

interface RowCardProps {
  row: Record<string, string | number>
  rowIndex: number
  isSelected: boolean
  onToggleRow: (rowIndex: number) => void
  onCellChange: (rowIndex: number, field: string, value: string) => void
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void
}

/**
 * RowCard component - displays a single row in accordion format
 * Extracted from SimpleEditableTable to improve maintainability
 */
export const RowCard = memo(function RowCard({
  row,
  rowIndex,
  isSelected,
  onToggleRow,
  onCellChange,
  onFocus,
}: RowCardProps) {
  const itemName = row['Item'] || `Item ${rowIndex + 1}`
  const total = row['Total'] || 0
  const rowNumber = row['#'] || rowIndex + 1

  return (
    <AccordionItem
      value={`item-${rowIndex}`}
      className={`rounded-xl border mb-0.5 ${
        isSelected ? 'bg-destructive/10 border-destructive' : 'bg-white'
      }`}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className={`flex items-center w-full pr-2 ${styles.rowTrigger}`}>
          <span className={`text-sm font-medium text-gray-600 ${styles.rowNumber}`}>
            {rowNumber}
          </span>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onToggleRow(rowIndex)
            }}
            onClick={(e) => e.stopPropagation()}
            className={`w-5 h-5 cursor-pointer accent-destructive ${styles.rowCheckbox}`}
            aria-label={`Select row ${rowIndex + 1}`}
          />
          <span className={`text-sm font-normal text-gray-700 ${styles.rowQty}`}>
            {row['Qty']}
          </span>
          <div className={`text-left text-sm font-normal ${styles.rowItem}`}>
            {itemName}
          </div>
          <div className={`font-bold text-sm ${styles.rowTotal}`}>
            {total}
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
              onChange={(e) => onCellChange(rowIndex, 'Item', e.target.value)}
              onFocus={onFocus}
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
                onChange={(e) => onCellChange(rowIndex, 'Art', e.target.value)}
                onFocus={onFocus}
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
                onChange={(e) => onCellChange(rowIndex, 'Unit', e.target.value)}
                onFocus={onFocus}
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
                onChange={(e) => onCellChange(rowIndex, 'Qty', e.target.value)}
                onFocus={onFocus}
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
                onChange={(e) => onCellChange(rowIndex, 'Price', e.target.value)}
                onFocus={onFocus}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-right"
                step="0.01"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Row 4: Net (37.5%) | VAT (25%) | Total (37.5%) */}
          <div className={`grid gap-3 ${styles.gridNetVatTotal}`}>
            <div className="space-y-1">
              <Label htmlFor={`${rowIndex}-Net`} className="text-xs font-medium text-gray-600">
                Net
              </Label>
              <input
                id={`${rowIndex}-Net`}
                type="number"
                value={row['Net'] || ''}
                onChange={(e) => onCellChange(rowIndex, 'Net', e.target.value)}
                onFocus={onFocus}
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
                onChange={(e) => onCellChange(rowIndex, 'VAT', e.target.value)}
                onFocus={onFocus}
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
                onChange={(e) => onCellChange(rowIndex, 'Total', e.target.value)}
                onFocus={onFocus}
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
})
