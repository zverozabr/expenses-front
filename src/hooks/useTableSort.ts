import { useState, useCallback, useEffect } from 'react'
import { ReceiptData } from '@/types'
import { isNumericField } from '@/constants/fields'

// Sort direction type
export type SortDirection = 'asc' | 'desc' | null

/**
 * Custom hook for table sorting functionality
 * SRP: Separates sorting logic from table component
 * DRY: Reusable sorting logic
 *
 * @param initialData - Initial data to sort
 * @returns Sorting state and handlers
 */
export function useTableSort(initialData: ReceiptData) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [sortedData, setSortedData] = useState<ReceiptData>(initialData)

  // Reset sorting when initial data changes
  useEffect(() => {
    setSortedData(initialData)
    setSortColumn(null)
    setSortDirection(null)
  }, [initialData])

  /**
   * Handle column sorting with three states: asc -> desc -> none
   */
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
      const sorted = [...initialData].sort((a, b) => {
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
      setSortedData(sorted)
    } else {
      // Reset to original order
      setSortedData([...initialData])
    }
  }, [sortColumn, sortDirection, initialData])

  return {
    sortColumn,
    sortDirection,
    sortedData,
    handleSort,
  }
}
