import { ReceiptData } from '@/types'

/**
 * Recalculates row numbers (#) based on array index
 * DRY: Eliminates duplication of row number recalculation logic
 *
 * @param data - Receipt data array
 * @returns New array with recalculated row numbers
 */
export function recalculateRowNumbers(data: ReceiptData): ReceiptData {
  return data.map((row, index) => ({ ...row, '#': index + 1 }))
}

/**
 * Updates both data states with the same transformation
 * DRY: Eliminates duplication when updating both data and originalData
 *
 * @param setData - State setter for data
 * @param setOriginalData - State setter for originalData
 * @param updater - Function to transform the data
 */
export function updateBothDataStates(
  setData: React.Dispatch<React.SetStateAction<ReceiptData>>,
  setOriginalData: React.Dispatch<React.SetStateAction<ReceiptData>>,
  updater: (data: ReceiptData) => ReceiptData
): void {
  setData(updater)
  setOriginalData(updater)
}
