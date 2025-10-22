import { ReceiptItem } from '@/types'

/**
 * Rounds a number to 2 decimal places
 * @param value - The number to round
 * @returns The rounded number
 */
export function round(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Recalculates row fields based on which field was changed
 *
 * Business rules:
 * - Net = Price × Qty
 * - Total = Net + VAT
 * - When VAT changes: Price adjusts to keep Total constant
 * - When Total changes: Price adjusts to keep VAT constant
 * - When Net changes: Price and Total adjust
 * - All monetary values are rounded to 2 decimal places
 *
 * @param row - The current row data
 * @param changedField - The field that was changed
 * @param newValue - The new value for the changed field
 * @returns Updated row with recalculated fields
 */
export function recalculateRow(
  row: ReceiptItem,
  changedField: string,
  newValue: number
): ReceiptItem {
  // Start with the updated field
  const updated = { ...row, [changedField]: newValue }

  // Apply business logic based on which field changed
  switch (changedField) {
    case 'Qty':
    case 'Price':
      // Recalculate Net and Total
      updated.Net = round(updated.Price * updated.Qty)
      updated.Total = round(updated.Net + updated.VAT)
      break

    case 'VAT':
      // Total stays constant, adjust Price
      // Price = (Total - VAT) / Qty
      if (updated.Qty !== 0) {
        updated.Price = round((updated.Total - updated.VAT) / updated.Qty)
        updated.Net = round(updated.Price * updated.Qty)
      }
      break

    case 'Total':
      // VAT stays constant, adjust Price
      // Net = Total - VAT
      // Price = Net / Qty
      updated.Net = round(updated.Total - updated.VAT)
      if (updated.Qty !== 0) {
        updated.Price = round(updated.Net / updated.Qty)
      }
      break

    case 'Net':
      // Recalculate Price and Total
      // Price = Net / Qty
      if (updated.Qty !== 0) {
        updated.Price = round(updated.Net / updated.Qty)
      }
      updated.Total = round(updated.Net + updated.VAT)
      break

    default:
      // For non-numeric fields (Item, Unit, Art, #), no recalculation needed
      break
  }

  return updated
}
