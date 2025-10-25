import { useCallback } from 'react'
import { ReceiptData } from '@/types'
import { recalculateRowNumbers } from '@/lib/tableUtils'

/**
 * Custom hook for table row operations (add, delete, move, copy)
 * SRP: Separates row manipulation logic from table component
 * DRY: Eliminates duplication of row number recalculation
 *
 * @param data - Current table data
 * @param setData - State setter for data
 * @param setOriginalData - State setter for originalData
 * @param selectedRows - Set of selected row indices
 * @param setSelectedRows - State setter for selectedRows
 * @returns Row operation handlers
 */
export function useTableRowOperations(
  data: ReceiptData,
  setData: React.Dispatch<React.SetStateAction<ReceiptData>>,
  setOriginalData: React.Dispatch<React.SetStateAction<ReceiptData>>,
  selectedRows: Set<number>,
  setSelectedRows: React.Dispatch<React.SetStateAction<Set<number>>>
) {
  /**
   * Update both data and originalData with the same transformation
   * DRY: Eliminates duplication when updating both states
   */
  const updateBothDataStates = useCallback((updater: (data: ReceiptData) => ReceiptData) => {
    const newData = updater(data)
    setData(newData)
    setOriginalData(newData)
    return newData
  }, [data, setData, setOriginalData])

  /**
   * Add a new empty row to the table
   */
  const handleAddRow = useCallback(() => {
    if (data.length > 0) {
      const emptyRow = {
        '#': data.length + 1,
        Qty: 1,
        Unit: 'pcs',
        Price: 0,
        Art: '',
        Item: 'New Item',
        Net: 0,
        VAT: 0,
        Total: 0
      }

      updateBothDataStates(prevData => [...prevData, emptyRow])
    }
  }, [data, updateBothDataStates])

  /**
   * Toggle row selection
   */
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
  }, [setSelectedRows])

  /**
   * Move selected rows up by one position
   */
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

    // Recalculate row numbers and update both states
    const recalculatedData = recalculateRowNumbers(newData)
    setData(recalculatedData)
    setOriginalData(recalculatedData)

    // Update selected rows indices
    const newSelectedRows = new Set(sortedIndices.map(i => i - 1))
    setSelectedRows(newSelectedRows)
  }, [selectedRows, data, setData, setOriginalData, setSelectedRows])

  /**
   * Move selected rows down by one position
   */
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

    // Recalculate row numbers and update both states
    const recalculatedData = recalculateRowNumbers(newData)
    setData(recalculatedData)
    setOriginalData(recalculatedData)

    // Update selected rows indices
    const newSelectedRows = new Set(sortedIndices.map(i => i + 1))
    setSelectedRows(newSelectedRows)
  }, [selectedRows, data, setData, setOriginalData, setSelectedRows])

  /**
   * Copy selected rows and insert them after the last selected row
   */
  const handleCopySelected = useCallback(() => {
    if (selectedRows.size === 0) return

    const sortedIndices = Array.from(selectedRows).sort((a, b) => a - b)
    const lastSelectedIndex = sortedIndices[sortedIndices.length - 1]

    // Get copies of selected rows
    const copiedRows = sortedIndices.map(index => ({ ...data[index] }))

    // Insert copied rows after the last selected row
    const newData = [
      ...data.slice(0, lastSelectedIndex + 1),
      ...copiedRows,
      ...data.slice(lastSelectedIndex + 1)
    ]

    // Recalculate row numbers and update both states
    const recalculatedData = recalculateRowNumbers(newData)
    setData(recalculatedData)
    setOriginalData(recalculatedData)

    // Clear selection
    setSelectedRows(new Set())
  }, [selectedRows, data, setData, setOriginalData, setSelectedRows])

  /**
   * Delete selected rows
   * DRY: Uses recalculateRowNumbers utility
   */
  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size > 0) {
      updateBothDataStates(prevData =>
        recalculateRowNumbers(
          prevData.filter((_, index) => !selectedRows.has(index))
        )
      )
      setSelectedRows(new Set())
    }
  }, [selectedRows, updateBothDataStates, setSelectedRows])

  return {
    handleAddRow,
    handleToggleRow,
    handleMoveUp,
    handleMoveDown,
    handleCopySelected,
    handleDeleteSelected,
  }
}
