import { ReceiptData } from '@/types'

/**
 * Demo data for development when database is not available
 * Real Makro receipt data for testing mobile UI
 *
 * SRP: Separated from useSessionData hook to keep concerns separate
 * DRY: Can be reused in tests and other places
 */
export const demoReceiptData: ReceiptData = [
  {
    "#": 1,
    "Qty": 1,
    "Unit": "pcs",
    "Price": 89.00,
    "Art": "2115083",
    "Item": "Term A. Kor. R2 / เทอม เอ. กอร์. R2",
    "Net": 89.00,
    "VAT": 0.00,
    "Total": 89.00
  },
  {
    "#": 2,
    "Qty": 5,
    "Unit": "pcs",
    "Price": 10.00,
    "Art": "5195440",
    "Item": "Line accessories / ไลน์ อุปกรณ์เสริม",
    "Net": 50.00,
    "VAT": 0.00,
    "Total": 50.00
  },
  {
    "#": 3,
    "Qty": 1.85,
    "Unit": "pcs",
    "Price": 84.72,
    "Art": "2119699",
    "Item": "SE large item set / เซ็ต สินค้าชิ้นใหญ่",
    "Net": 157.01,
    "VAT": 10.99,
    "Total": 168.00
  },
  {
    "#": 4,
    "Qty": 3,
    "Unit": "pcs",
    "Price": 15.00,
    "Art": "2110696",
    "Item": "Unit / UNIT .",
    "Net": 45.00,
    "VAT": 0.00,
    "Total": 45.00
  },
  {
    "#": 5,
    "Qty": 7,
    "Unit": "pcs",
    "Price": 189.00,
    "Art": "2110632",
    "Item": "Big Ang product / ผลิตภัณฑ์ใหญ่ อังกฤษ",
    "Net": 1323.00,
    "VAT": 0.00,
    "Total": 1323.00
  },
  {
    "#": 6,
    "Qty": 1.98,
    "Unit": "pcs",
    "Price": 29.00,
    "Art": "2051663",
    "Item": "Dara Line Place / ดารา ไลน์ เพลส",
    "Net": 57.50,
    "VAT": 0.00,
    "Total": 57.50
  },
  {
    "#": 7,
    "Qty": 2.02,
    "Unit": "pcs",
    "Price": 29.00,
    "Art": "2165763",
    "Item": "Horn on K.L. / แตรบน ก.ล.",
    "Net": 58.50,
    "VAT": 0.00,
    "Total": 58.50
  },
  {
    "#": 8,
    "Qty": 2.03,
    "Unit": "pcs",
    "Price": 29.00,
    "Art": "2177636",
    "Item": "Training manual / คู่มือฝึกอบรม",
    "Net": 58.75,
    "VAT": 0.00,
    "Total": 58.75
  },
  {
    "#": 9,
    "Qty": 3,
    "Unit": "pcs",
    "Price": 145.00,
    "Art": "2009088",
    "Item": "F7 Bhor / F7 บ่อ",
    "Net": 406.54,
    "VAT": 28.46,
    "Total": 435.00
  },
  {
    "#": 10,
    "Qty": 1.41,
    "Unit": "pcs",
    "Price": 19.00,
    "Art": "2851604",
    "Item": "Product pack 200 / แพ็คสินค้า 200",
    "Net": 26.75,
    "VAT": 0.00,
    "Total": 26.75
  },
  {
    "#": 11,
    "Qty": 38,
    "Unit": "pcs",
    "Price": 15.00,
    "Art": "90-9729",
    "Item": "A Rai product / สินค้า เอ ไร่",
    "Net": 532.71,
    "VAT": 37.29,
    "Total": 570.00
  }
]
