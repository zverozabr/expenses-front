import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SimpleEditableTable } from '../SimpleEditableTable'
import { ReceiptData } from '@/types'

describe('SimpleEditableTable - Layout', () => {
  const mockData: ReceiptData = [
    { "#": "1", "Qty": "2", "Unit": "pcs", "Price": "50", "Art": "TEST001", "Item": "Test Item 1", "Net": "100", "VAT": "0", "Total": "100" },
    { "#": "2", "Qty": "3", "Unit": "pcs", "Price": "25", "Art": "TEST002", "Item": "Test Item 2", "Net": "75", "VAT": "0", "Total": "75" }
  ]

  it('should render Save button in the same row as Add Row and Delete buttons', () => {
    const onDataChange = jest.fn()
    const { container } = render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    // Find the controls container
    const controlsContainer = container.querySelector('.mb-4.flex')
    expect(controlsContainer).toBeInTheDocument()

    // All three buttons should be present
    const addButton = screen.getByRole('button', { name: /Add new row/i })
    const deleteButton = screen.getByRole('button', { name: /Delete selected rows/i })
    const saveButton = screen.getByRole('button', { name: /Save changes and send data back to bot/i })

    expect(addButton).toBeInTheDocument()
    expect(deleteButton).toBeInTheDocument()
    expect(saveButton).toBeInTheDocument()
  })

  it('should not render sticky Save button at bottom', () => {
    const onDataChange = jest.fn()
    const { container } = render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    // Should not have fixed bottom container
    const fixedBottomContainer = container.querySelector('.fixed.bottom-0')
    expect(fixedBottomContainer).not.toBeInTheDocument()
  })

  it('should not render spacer for sticky button', () => {
    const onDataChange = jest.fn()
    const { container } = render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    // Should not have spacer div
    const spacer = container.querySelector('.h-20.sm\\:h-0')
    expect(spacer).not.toBeInTheDocument()
  })

  it('should render Save button with correct size', () => {
    const onDataChange = jest.fn()
    render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    const saveButton = screen.getByRole('button', { name: /Save changes and send data back to bot/i })

    // Should have size="sm" class (not size="lg")
    expect(saveButton.className).not.toContain('h-11')
  })

  it('should render all control buttons in flex container', () => {
    const onDataChange = jest.fn()
    const { container } = render(<SimpleEditableTable data={mockData} onDataChange={onDataChange} />)

    // Find the flex container with buttons
    const buttonsContainer = container.querySelector('.flex.items-center')
    expect(buttonsContainer).toBeInTheDocument()

    // Should contain all six buttons: Add, Delete, Up, Down, Copy, Save
    const buttons = buttonsContainer?.querySelectorAll('button')
    expect(buttons).toHaveLength(6)
  })
})
