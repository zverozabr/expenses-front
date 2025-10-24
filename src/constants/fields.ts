/**
 * Field type constants for receipt items
 * Used for validation, formatting, and calculations
 */

/**
 * Fields that should be treated as numeric values
 */
export const NUMERIC_FIELDS = ['#', 'Qty', 'Price', 'Net', 'VAT', 'Total'] as const

/**
 * Fields that trigger automatic recalculation when changed
 */
export const RECALCULATION_FIELDS = ['Qty', 'Price', 'Net', 'VAT', 'Total'] as const

/**
 * Fields that should be right-aligned (typically monetary values)
 */
export const RIGHT_ALIGNED_FIELDS = ['Price', 'Net', 'VAT', 'Total'] as const

/**
 * Check if a field is numeric
 */
export function isNumericField(field: string): boolean {
  return NUMERIC_FIELDS.includes(field as any)
}

/**
 * Check if a field triggers recalculation
 */
export function isRecalculationField(field: string): boolean {
  return RECALCULATION_FIELDS.includes(field as any)
}

/**
 * Check if a field should be right-aligned
 */
export function isRightAlignedField(field: string): boolean {
  return RIGHT_ALIGNED_FIELDS.includes(field as any)
}
