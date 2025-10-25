/**
 * Unit tests for SimpleEditableTable component
 * Tests row manipulation features: Copy, Move Up, Move Down, Delete
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SimpleEditableTable } from '../SimpleEditableTable'
import { ReceiptData } from '@/types'

// Mock the useSelectOnFocus hook
jest.mock('@/hooks/useSelectOnFocus', () => ({
  useSelectOnFocus: () => jest.fn()
}))

describe('SimpleEditableTable - Row Manipulation', () => {
  const mockData: ReceiptData = [
    {
      '#': 1,
      Qty: 2,
      Unit: 'pcs',
      Item: 'Item 1',
      Price: 100,
      Art: 'ART001',
      Net: 200,
      VAT: 14,
      Total: 214
    },
    {
      '#': 2,
      Qty: 3,
      Unit: 'pcs',
      Item: 'Item 2',
      Price: 150,
      Art: 'ART002',
      Net: 450,
      VAT: 31.5,
      Total: 481.5
    },
    {
      '#': 3,
      Qty: 1,
      Unit: 'pcs',
      Item: 'Item 3',
      Price: 200,
      Art: 'ART003',
      Net: 200,
      VAT: 14,
      Total: 214
    }
  ]

  const mockOnDataChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Copy Functionality', () => {
    it('should copy a single selected row and insert it after the selected row', async () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select first row (index 0)
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[0])

      // Click Copy button
      const copyButton = screen.getByLabelText('Copy selected rows')
      expect(copyButton).not.toBeDisabled()
      fireEvent.click(copyButton)

      // Click Save to trigger onDataChange
      const saveButton = screen.getByLabelText('Save changes and send data back to bot')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalled()
        const savedData = mockOnDataChange.mock.calls[0][0]

        // Should have 4 rows now (3 original + 1 copy)
        expect(savedData).toHaveLength(4)

        // First row should be unchanged
        expect(savedData[0]).toMatchObject({
          '#': 1,
          Item: 'Item 1',
          Qty: 2
        })

        // Second row should be the copy of first row
        expect(savedData[1]).toMatchObject({
          '#': 2,
          Item: 'Item 1',
          Qty: 2
        })

        // Third row should be the original second row (re-indexed)
        expect(savedData[2]).toMatchObject({
          '#': 3,
          Item: 'Item 2',
          Qty: 3
        })
      })
    })

    it('should copy multiple selected rows and insert them after the last selected row', async () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select first and third rows (indices 0 and 2)
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[0]) // Select row 1
      fireEvent.click(checkboxes[2]) // Select row 3

      // Click Copy button
      const copyButton = screen.getByLabelText('Copy selected rows')
      fireEvent.click(copyButton)

      // Click Save
      const saveButton = screen.getByLabelText('Save changes and send data back to bot')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalled()
        const savedData = mockOnDataChange.mock.calls[0][0]

        // Should have 5 rows now (3 original + 2 copies)
        expect(savedData).toHaveLength(5)

        // Rows 1-3 should be original
        expect(savedData[0].Item).toBe('Item 1')
        expect(savedData[1].Item).toBe('Item 2')
        expect(savedData[2].Item).toBe('Item 3')

        // Rows 4-5 should be copies of rows 1 and 3
        expect(savedData[3].Item).toBe('Item 1')
        expect(savedData[4].Item).toBe('Item 3')

        // All rows should have correct indices
        savedData.forEach((row: any, index: number) => {
          expect(row['#']).toBe(index + 1)
        })
      })
    })

    it('should clear selection after copying', async () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select first row
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[0])

      // Verify checkbox is checked
      expect(checkboxes[0]).toBeChecked()

      // Click Copy button
      const copyButton = screen.getByLabelText('Copy selected rows')
      fireEvent.click(copyButton)

      // Verify checkbox is unchecked after copy
      await waitFor(() => {
        expect(checkboxes[0]).not.toBeChecked()
      })
    })

    it('should disable Copy button when no rows are selected', () => {
      render(<SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />)

      const copyButton = screen.getByLabelText('Copy selected rows')
      expect(copyButton).toBeDisabled()
    })
  })

  describe('Move Up Functionality', () => {
    it('should move a selected row up by one position', async () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select second row (index 1)
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[1])

      // Click Up button
      const upButton = screen.getByLabelText('Move selected rows up')
      fireEvent.click(upButton)

      // Click Save
      const saveButton = screen.getByLabelText('Save changes and send data back to bot')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalled()
        const savedData = mockOnDataChange.mock.calls[0][0]

        // Row order should be: Item 2, Item 1, Item 3
        expect(savedData[0].Item).toBe('Item 2')
        expect(savedData[1].Item).toBe('Item 1')
        expect(savedData[2].Item).toBe('Item 3')

        // Indices should be recalculated
        expect(savedData[0]['#']).toBe(1)
        expect(savedData[1]['#']).toBe(2)
        expect(savedData[2]['#']).toBe(3)
      })
    })

    it('should not move the first row up', () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select first row (index 0)
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[0])

      // Click Up button
      const upButton = screen.getByLabelText('Move selected rows up')
      fireEvent.click(upButton)

      // Click Save
      const saveButton = screen.getByLabelText('Save changes and send data back to bot')
      fireEvent.click(saveButton)

      // Data should remain unchanged
      expect(mockOnDataChange).toHaveBeenCalledWith(mockData)
    })

    it('should move multiple selected rows up together', async () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select second and third rows (indices 1 and 2)
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[1])
      fireEvent.click(checkboxes[2])

      // Click Up button
      const upButton = screen.getByLabelText('Move selected rows up')
      fireEvent.click(upButton)

      // Click Save
      const saveButton = screen.getByLabelText('Save changes and send data back to bot')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalled()
        const savedData = mockOnDataChange.mock.calls[0][0]

        // Row order should be: Item 2, Item 3, Item 1
        expect(savedData[0].Item).toBe('Item 2')
        expect(savedData[1].Item).toBe('Item 3')
        expect(savedData[2].Item).toBe('Item 1')
      })
    })
  })

  describe('Move Down Functionality', () => {
    it('should move a selected row down by one position', async () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select first row (index 0)
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[0])

      // Click Down button
      const downButton = screen.getByLabelText('Move selected rows down')
      fireEvent.click(downButton)

      // Click Save
      const saveButton = screen.getByLabelText('Save changes and send data back to bot')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalled()
        const savedData = mockOnDataChange.mock.calls[0][0]

        // Row order should be: Item 2, Item 1, Item 3
        expect(savedData[0].Item).toBe('Item 2')
        expect(savedData[1].Item).toBe('Item 1')
        expect(savedData[2].Item).toBe('Item 3')

        // Indices should be recalculated
        expect(savedData[0]['#']).toBe(1)
        expect(savedData[1]['#']).toBe(2)
        expect(savedData[2]['#']).toBe(3)
      })
    })

    it('should not move the last row down', () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select last row (index 2)
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[2])

      // Click Down button
      const downButton = screen.getByLabelText('Move selected rows down')
      fireEvent.click(downButton)

      // Click Save
      const saveButton = screen.getByLabelText('Save changes and send data back to bot')
      fireEvent.click(saveButton)

      // Data should remain unchanged
      expect(mockOnDataChange).toHaveBeenCalledWith(mockData)
    })
  })

  describe('Delete Functionality', () => {
    it('should delete selected rows and recalculate indices', async () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select second row (index 1)
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[1])

      // Click Delete button
      const deleteButton = screen.getByLabelText('Delete selected rows')
      fireEvent.click(deleteButton)

      // Click Save
      const saveButton = screen.getByLabelText('Save changes and send data back to bot')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalled()
        const savedData = mockOnDataChange.mock.calls[0][0]

        // Should have 2 rows now
        expect(savedData).toHaveLength(2)

        // Remaining rows should be Item 1 and Item 3
        expect(savedData[0].Item).toBe('Item 1')
        expect(savedData[1].Item).toBe('Item 3')

        // Indices should be recalculated
        expect(savedData[0]['#']).toBe(1)
        expect(savedData[1]['#']).toBe(2)
      })
    })

    it('should delete multiple selected rows', async () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select first and third rows
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[0])
      fireEvent.click(checkboxes[2])

      // Click Delete button
      const deleteButton = screen.getByLabelText('Delete selected rows')
      fireEvent.click(deleteButton)

      // Click Save
      const saveButton = screen.getByLabelText('Save changes and send data back to bot')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalled()
        const savedData = mockOnDataChange.mock.calls[0][0]

        // Should have 1 row now
        expect(savedData).toHaveLength(1)

        // Remaining row should be Item 2
        expect(savedData[0].Item).toBe('Item 2')
        expect(savedData[0]['#']).toBe(1)
      })
    })
  })

  describe('Add Row Functionality', () => {
    it('should add a new row with default values', async () => {
      render(<SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />)

      // Click Add button
      const addButton = screen.getByLabelText('Add new row')
      fireEvent.click(addButton)

      // Click Save
      const saveButton = screen.getByLabelText('Save changes and send data back to bot')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalled()
        const savedData = mockOnDataChange.mock.calls[0][0]

        // Should have 4 rows now
        expect(savedData).toHaveLength(4)

        // New row should have default values
        const newRow = savedData[3]
        expect(newRow).toMatchObject({
          '#': 4,
          Qty: 1,
          Unit: 'pcs',
          Item: 'New Item',
          Price: 0,
          Net: 0,
          VAT: 0,
          Total: 0
        })
      })
    })
  })

  describe('Button States', () => {
    it('should disable Up, Down, Copy, and Delete buttons when no rows are selected', () => {
      render(<SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />)

      expect(screen.getByLabelText('Move selected rows up')).toBeDisabled()
      expect(screen.getByLabelText('Move selected rows down')).toBeDisabled()
      expect(screen.getByLabelText('Copy selected rows')).toBeDisabled()
      expect(screen.getByLabelText('Delete selected rows')).toBeDisabled()
    })

    it('should enable Up, Down, Copy, and Delete buttons when rows are selected', () => {
      const { container } = render(
        <SimpleEditableTable data={mockData} onDataChange={mockOnDataChange} />
      )

      // Select first row
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(checkboxes[0])

      expect(screen.getByLabelText('Move selected rows up')).not.toBeDisabled()
      expect(screen.getByLabelText('Move selected rows down')).not.toBeDisabled()
      expect(screen.getByLabelText('Copy selected rows')).not.toBeDisabled()
      expect(screen.getByLabelText('Delete selected rows')).not.toBeDisabled()
    })
  })
})
