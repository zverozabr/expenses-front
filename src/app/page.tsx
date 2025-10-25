'use client'

import { useState } from 'react'
import { SimpleEditableTable } from '@/components/SimpleEditableTable'
import { ReceiptData } from '@/types'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

// Sample fixture data
const FIXTURE_DATA: ReceiptData = [
  {
    '#': 1,
    Qty: 2,
    Unit: 'pcs',
    Item: 'Laptop',
    Price: 1200,
    Art: 'LAP001',
    Net: 2400,
    VAT: 168,
    Total: 2568
  },
  {
    '#': 2,
    Qty: 3,
    Unit: 'pcs',
    Item: 'Mouse',
    Price: 25,
    Art: 'MOU001',
    Net: 75,
    VAT: 5.25,
    Total: 80.25
  },
  {
    '#': 3,
    Qty: 1,
    Unit: 'pcs',
    Item: 'Keyboard',
    Price: 80,
    Art: 'KEY001',
    Net: 80,
    VAT: 5.6,
    Total: 85.6
  },
  {
    '#': 4,
    Qty: 5,
    Unit: 'pcs',
    Item: 'USB Cable',
    Price: 10,
    Art: 'USB001',
    Net: 50,
    VAT: 3.5,
    Total: 53.5
  },
  {
    '#': 5,
    Qty: 2,
    Unit: 'pcs',
    Item: 'Monitor',
    Price: 350,
    Art: 'MON001',
    Net: 700,
    VAT: 49,
    Total: 749
  }
]

export default function Home() {
  const [data, setData] = useState<ReceiptData>(FIXTURE_DATA)

  const handleDataChange = async (newData: ReceiptData) => {
    setData(newData)
    console.log('Data updated:', newData)
  }

  return (
    <main className="p-2 max-w-6xl mx-auto">
      <header className="mb-4">
        <h1 className="text-lg font-bold text-gray-900 mb-2">Receipt Editor - Demo Mode</h1>
        <p className="text-xs text-gray-600">
          This is a demo page with sample data. Changes are not saved to the server.
        </p>
      </header>
      <SimpleEditableTable data={data} onDataChange={handleDataChange} loading={false} />
    </main>
  )
}
