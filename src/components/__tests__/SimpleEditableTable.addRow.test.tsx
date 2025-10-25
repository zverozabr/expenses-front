import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
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

    // Click Add Row button
    const addButton = screen.getByRole('button', { name: /Add new row/i })
    fireEvent.click(addButton)

    // Verify a new row was added by checking for "New Item" text in accordion trigger
    expect(screen.getByText('New Item')).toBeInTheDocument()

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

    // Find the new item accordion and click to expand it
    const newItemAccordion = screen.getByText('New Item').closest('button')
    if (newItemAccordion) {
      fireEvent.click(newItemAccordion)
    }

    // Wait for accordion to expand and find the Item input
    await waitFor(() => {
      const itemInput = screen.getByDisplayValue('New Item')
      fireEvent.change(itemInput, { target: { value: 'Updated Item' } })
      expect(itemInput).toHaveValue('Updated Item')
    })

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
    expect(screen.getAllByText('New Item')).toHaveLength(1)

    // Add second row
    fireEvent.click(addButton)
    expect(screen.getAllByText('New Item')).toHaveLength(2)

    // Add third row
    fireEvent.click(addButton)
    expect(screen.getAllByText('New Item')).toHaveLength(3)
  })

  it('should include all added rows when saving', async () => {
    const onDataChange = jest.fn()
    render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    // Add 3 new rows
    const addButton = screen.getByRole('button', { name: /Add new row/i })
    fireEvent.click(addButton)
    fireEvent.click(addButton)
    fireEvent.click(addButton)

    // Should have 3 new items (visible in accordion triggers)
    expect(screen.getAllByText('New Item')).toHaveLength(3)

    // Save
    const saveButton = screen.getByRole('button', { name: /Save changes and send data back to bot/i })
    fireEvent.click(saveButton)

    // onDataChange should be called with 5 rows (2 original + 3 new)
    await waitFor(() => {
      expect(onDataChange).toHaveBeenCalledTimes(1)
    })

    const savedData = onDataChange.mock.calls[0][0]
    expect(savedData).toHaveLength(5)
  })
})
