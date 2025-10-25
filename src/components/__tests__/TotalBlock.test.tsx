import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SimpleEditableTable } from '../SimpleEditableTable'
import { ReceiptData } from '@/types'

describe('Total Block Recalculation', () => {
  const mockOnDataChange = jest.fn()

  const initialData: ReceiptData = [
    { '#': 1, 'Qty': 2, 'Unit': 'pcs', 'Item': 'Test Item 1', 'Price': 10, 'Net': 20, 'VAT%': 10, 'VAT': 2, 'Total': 22 },
    { '#': 2, 'Qty': 1, 'Unit': 'pcs', 'Item': 'Test Item 2', 'Price': 50, 'Net': 50, 'VAT%': 20, 'VAT': 10, 'Total': 60 }
  ]

  beforeEach(() => {
    mockOnDataChange.mockClear()
    // Set mobile viewport
    global.innerWidth = 400
    global.innerHeight = 844
  })

  it('should display Total block with correct initial values', () => {
    render(<SimpleEditableTable data={initialData} onDataChange={mockOnDataChange} />)

    // Check that Total block exists and has correct values
    expect(screen.getByText(/Items:/)).toBeInTheDocument()
    expect(screen.getByText(/Items: 2/)).toBeInTheDocument()
    expect(screen.getByText(/NET: 70.00/)).toBeInTheDocument()
    expect(screen.getByText(/VAT: 12.00/)).toBeInTheDocument()
    expect(screen.getByText(/TOTAL: 82.00/)).toBeInTheDocument()
  })

  it('should recalculate Total block when values change', async () => {
    const { rerender } = render(<SimpleEditableTable data={initialData} onDataChange={mockOnDataChange} />)

    // Simulate data change
    const updatedData: ReceiptData = [
      { '#': 1, 'Qty': 5, 'Unit': 'pcs', 'Item': 'Test Item 1', 'Price': 100, 'Net': 500, 'VAT%': 20, 'VAT': 100, 'Total': 600 },
      { '#': 2, 'Qty': 1, 'Unit': 'pcs', 'Item': 'Test Item 2', 'Price': 50, 'Net': 50, 'VAT%': 20, 'VAT': 10, 'Total': 60 }
    ]

    rerender(<SimpleEditableTable data={updatedData} onDataChange={mockOnDataChange} />)

    await waitFor(() => {
      expect(screen.getByText(/NET: 550.00/)).toBeInTheDocument()
      expect(screen.getByText(/VAT: 110.00/)).toBeInTheDocument()
      expect(screen.getByText(/TOTAL: 660.00/)).toBeInTheDocument()
    })
  })

  it('should recalculate Total block when row is added', async () => {
    render(<SimpleEditableTable data={initialData} onDataChange={mockOnDataChange} />)

    // Click Add button
    const addButton = screen.getByLabelText('Add new row')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/Items: 3/)).toBeInTheDocument()
    })
  })

  it('should recalculate Total block when row is deleted', async () => {
    render(<SimpleEditableTable data={initialData} onDataChange={mockOnDataChange} />)

    // Select first row
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    // Click Delete button
    const deleteButton = screen.getByLabelText('Delete selected rows')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText(/Items: 1/)).toBeInTheDocument()
      expect(screen.getByText(/TOTAL: 60.00/)).toBeInTheDocument()
    })
  })

  it('should verify TOTAL equals NET plus VAT', () => {
    render(<SimpleEditableTable data={initialData} onDataChange={mockOnDataChange} />)

    // Get the displayed values
    const netText = screen.getByText(/NET:/).parentElement?.textContent || ''
    const vatText = screen.getByText(/VAT:/).parentElement?.textContent || ''
    const totalText = screen.getByText(/TOTAL:/).parentElement?.textContent || ''

    const net = parseFloat(netText.match(/NET:\s*([\d.]+)/)?.[1] || '0')
    const vat = parseFloat(vatText.match(/VAT:\s*([\d.]+)/)?.[1] || '0')
    const total = parseFloat(totalText.match(/TOTAL:\s*([\d.]+)/)?.[1] || '0')

    // Verify TOTAL = NET + VAT
    expect(total).toBeCloseTo(net + vat, 2)
  })
})
