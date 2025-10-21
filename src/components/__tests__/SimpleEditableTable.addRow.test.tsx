import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SimpleEditableTable } from '../SimpleEditableTable'
import { ReceiptData } from '@/types'

describe('SimpleEditableTable - Add Row Functionality', () => {
  const mockData: ReceiptData = [
    { "#": "1", "Qty": "2", "Unit": "pcs", "Price": "50", "Art": "TEST001", "Item": "Test Item 1", "Net": "100", "VAT": "0", "Total": "100" },
    { "#": "2", "Qty": "3", "Unit": "pcs", "Price": "25", "Art": "TEST002", "Item": "Test Item 2", "Net": "75", "VAT": "0", "Total": "75" }
  ]

  it('should add a new row when Add Row button is clicked', () => {
    const onDataChange = jest.fn()
    render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    // Initially 2 rows
    expect(screen.getByText(/2 rows/i)).toBeInTheDocument()

    // Click Add Row button
    const addButton = screen.getByRole('button', { name: /Add new row/i })
    fireEvent.click(addButton)

    // Now should have 3 rows
    expect(screen.getByText(/3 rows/i)).toBeInTheDocument()

    // onDataChange should NOT be called yet (only when Save is clicked)
    expect(onDataChange).not.toHaveBeenCalled()
  })

  it('should save the new row when Save button is clicked', async () => {
    const onDataChange = jest.fn()
    render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    // Add a new row
    const addButton = screen.getByRole('button', { name: /Add new row/i })
    fireEvent.click(addButton)

    // Click Save button
    const saveButton = screen.getByRole('button', { name: /Save changes and send data back to bot/i })
    fireEvent.click(saveButton)

    // onDataChange should be called with 3 rows
    await waitFor(() => {
      expect(onDataChange).toHaveBeenCalledTimes(1)
    })

    const savedData = onDataChange.mock.calls[0][0]
    expect(savedData).toHaveLength(3)
  })

  it('should allow editing the new row', async () => {
    const onDataChange = jest.fn()
    render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    // Add a new row
    const addButton = screen.getByRole('button', { name: /Add new row/i })
    fireEvent.click(addButton)

    // Find all inputs and edit the new row (last row)
    const inputs = screen.getAllByRole('textbox')
    
    // Edit quantity field of the new row (should be empty initially)
    const qtyInputs = inputs.filter(input => (input as HTMLInputElement).value === '')
    if (qtyInputs.length > 0) {
      const qtyInput = qtyInputs[0]
      fireEvent.change(qtyInput, { target: { value: '10' } })
      expect((qtyInput as HTMLInputElement).value).toBe('10')
    }

    // Save
    const saveButton = screen.getByRole('button', { name: /Save changes and send data back to bot/i })
    fireEvent.click(saveButton)

    // Verify data is saved
    await waitFor(() => {
      expect(onDataChange).toHaveBeenCalled()
    })
  })

  it('should add multiple rows sequentially', () => {
    const onDataChange = jest.fn()
    render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    // Add first row
    const addButton = screen.getByRole('button', { name: /Add new row/i })
    fireEvent.click(addButton)
    expect(screen.getByText(/3 rows/i)).toBeInTheDocument()

    // Add second row
    fireEvent.click(addButton)
    expect(screen.getByText(/4 rows/i)).toBeInTheDocument()

    // Add third row
    fireEvent.click(addButton)
    expect(screen.getByText(/5 rows/i)).toBeInTheDocument()
  })

  it('should include all added rows when saving', async () => {
    const onDataChange = jest.fn()
    render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    // Add 3 new rows
    const addButton = screen.getByRole('button', { name: /Add new row/i })
    fireEvent.click(addButton)
    fireEvent.click(addButton)
    fireEvent.click(addButton)

    // Should show 5 rows
    expect(screen.getByText(/5 rows/i)).toBeInTheDocument()

    // Save
    const saveButton = screen.getByRole('button', { name: /Save changes and send data back to bot/i })
    fireEvent.click(saveButton)

    // Verify all 5 rows are saved
    await waitFor(() => {
      expect(onDataChange).toHaveBeenCalledTimes(1)
    })

    const savedData = onDataChange.mock.calls[0][0]
    expect(savedData).toHaveLength(5)
  })
})

