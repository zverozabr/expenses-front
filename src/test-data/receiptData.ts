import { TableRow } from '@/types'

/**
 * Test data resembling Makro receipt format in JSON
 * This is the expected incoming data structure from the bot
 * Based on the table format: | # | Qty | Unit | Price | Art | Item | Net | VAT | Total |
 */

// Original receipt data as it would be received from the bot
export const makroReceiptJson: TableRow[] = [
  {
    "#": 1,
    "Qty": 1,
    "Unit": "pcs",
    "Price": 89.00,
    "Art": "21150…",
    "Item": "Est Cola / เอส.",
    "Net": 89.00,
    "VAT": 0.00,
    "Total": 89.00
  },
  {
    "#": 2,
    "Qty": 2,
    "Unit": "pack",
    "Price": 84.00,
    "Art": "25195…",
    "Item": "Kratingdaeng Ene…",
    "Net": 157.01,
    "VAT": 10.99,
    "Total": 168.00
  },
  {
    "#": 3,
    "Qty": 49,
    "Unit": "pcs",
    "Price": 27.00,
    "Art": "29516…",
    "Item": "Fresh Milk 200 m…",
    "Net": 1236.45,
    "VAT": 86.55,
    "Total": 1323.00
  },
  {
    "#": 4,
    "Qty": 2.5,
    "Unit": "pcs",
    "Price": 29.00,
    "Art": "21657…",
    "Item": "Snack product No…",
    "Net": 58.50,
    "VAT": 0.00,
    "Total": 58.50
  },
  {
    "#": 5,
    "Qty": 2.5,
    "Unit": "pcs",
    "Price": 29.00,
    "Art": "21657…",
    "Item": "Food Product / ผ…",
    "Net": 58.75,
    "VAT": 0.00,
    "Total": 58.75
  },
  {
    "#": 6,
    "Qty": 2.5,
    "Unit": "kg",
    "Price": 148.67,
    "Art": "21106…",
    "Item": "Large Tofu per k…",
    "Net": 406.54,
    "VAT": 28.46,
    "Total": 435.00
  },
  {
    "#": 7,
    "Qty": 1,
    "Unit": "pack",
    "Price": 570.00,
    "Art": "92597…",
    "Item": "Aro Instant Nood…",
    "Net": 532.71,
    "VAT": 37.29,
    "Total": 570.00
  }
]

// Edited receipt - quantity changes, item removal, addition
export const makroReceiptEditedJson: TableRow[] = [
  {
    "#": 1,
    "Qty": 1,
    "Unit": "pcs",
    "Price": 89.00,
    "Art": "21150…",
    "Item": "Est Cola / เอส. (Price corrected)",
    "Net": 89.00,
    "VAT": 0.00,
    "Total": 89.00
  },
  {
    "#": 2,
    "Qty": 3, // Increased quantity
    "Unit": "pack",
    "Price": 84.00,
    "Art": "25195…",
    "Item": "Kratingdaeng Energy Drink",
    "Net": 235.51, // Recalculated: 84 * 3 * 0.93 (VAT rate)
    "VAT": 16.49,
    "Total": 252.00
  },
  {
    "#": 3,
    "Qty": 50, // Corrected quantity
    "Unit": "pcs",
    "Price": 27.00,
    "Art": "29516…",
    "Item": "Fresh Milk 200 ml",
    "Net": 1263.45, // Recalculated
    "VAT": 88.44,
    "Total": 1351.89
  },
  // Items 4 and 5 removed (snack products)
  {
    "#": 6,
    "Qty": 3.0, // Increased weight
    "Unit": "kg",
    "Price": 145.00, // Price corrected
    "Art": "21106…",
    "Item": "Large Tofu per kg (Premium)",
    "Net": 406.35, // Recalculated
    "VAT": 28.44,
    "Total": 434.79
  },
  {
    "#": 7,
    "Qty": 2, // Added another pack
    "Unit": "pack",
    "Price": 560.00, // Discounted price
    "Art": "92597…",
    "Item": "Aro Instant Noodles",
    "Net": 1046.73, // Recalculated
    "VAT": 73.27,
    "Total": 1120.00
  },
  // New item added
  {
    "#": 8,
    "Qty": 1,
    "Unit": "pcs",
    "Price": 150.00,
    "Art": "NEW001",
    "Item": "Premium Chocolate Bar",
    "Net": 150.00,
    "VAT": 10.50,
    "Total": 160.50
  }
]

// Different receipt types for testing
export const smallReceiptJson: TableRow[] = [
  {
    "#": 1,
    "Qty": 2,
    "Unit": "pcs",
    "Price": 25.00,
    "Art": "A001",
    "Item": "Bread",
    "Net": 50.00,
    "VAT": 0.00,
    "Total": 50.00
  },
  {
    "#": 2,
    "Qty": 1,
    "Unit": "liter",
    "Price": 30.00,
    "Art": "B002",
    "Item": "Milk",
    "Net": 28.04,
    "VAT": 1.96,
    "Total": 30.00
  }
]

// Receipt with errors for testing validation
export const invalidReceiptJson = [
  {
    "#": 1,
    "Qty": "invalid", // Should be number
    "Unit": "pcs",
    "Price": 25.00,
    "Art": "A001",
    "Item": "Bread",
    "Net": 50.00,
    "VAT": 0.00,
    "Total": 50.00
  }
]

// Simple test data for basic functionality (backward compatibility)
export const simpleTestData: TableRow[] = [
  { name: 'John', age: 30, city: 'NYC' },
  { name: 'Jane', age: 25, city: 'LA' }
]

export const simpleTestDataEdited: TableRow[] = [
  { name: 'John Doe', age: 31, city: 'NYC' },
  { name: 'Jane Smith', age: 26, city: 'LA' },
  { name: 'Bob', age: 35, city: 'Chicago' }
]

// Mock functions for testing
export const createMockReceipt = (overrides: Partial<TableRow> = {}): TableRow => ({
  "#": 1,
  "Qty": 1,
  "Unit": "pcs",
  "Price": 100.00,
  "Art": "TEST001",
  "Item": "Test Product",
  "Net": 93.46,
  "VAT": 6.54,
  "Total": 100.00,
  ...overrides
})

export const generateReceiptWithItems = (count: number): TableRow[] => {
  return Array.from({ length: count }, (_, i) => ({
    "#": i + 1,
    "Qty": Math.floor(Math.random() * 10) + 1,
    "Unit": ["pcs", "kg", "liter", "pack"][Math.floor(Math.random() * 4)],
    "Price": Math.round((Math.random() * 200 + 10) * 100) / 100,
    "Art": `ART${String(i + 1).padStart(3, '0')}`,
    "Item": `Product ${i + 1}`,
    "Net": 0, // Would be calculated
    "VAT": 0, // Would be calculated
    "Total": 0  // Would be calculated
  }))
}
