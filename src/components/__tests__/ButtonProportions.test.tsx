import React from 'react'
import { render, screen } from '@testing-library/react'
import { SimpleEditableTable } from '../SimpleEditableTable'

describe('Button Proportions', () => {
  const mockData = [
    {
      '#': 1,
      Qty: 1,
      Unit: 'pcs',
      Item: 'Test Item',
      Price: 100,
      Art: 'ART001',
      Net: 100,
      VAT: 20,
      Total: 120
    }
  ]

  it('should have correct flex proportions for buttons: [10Add][10Delete]10[7Up][7Down][7Copy]10[Save]', () => {
    render(<SimpleEditableTable data={mockData} onDataChange={jest.fn()} />)

    // Get all buttons
    const addButton = screen.getByLabelText('Add new row')
    const deleteButton = screen.getByLabelText('Delete selected rows')
    const upButton = screen.getByLabelText('Move selected rows up')
    const downButton = screen.getByLabelText('Move selected rows down')
    const copyButton = screen.getByLabelText('Copy selected rows')
    const saveButton = screen.getByLabelText('Save changes and send data back to bot')

    // Check flex values
    expect(addButton).toHaveStyle({ flex: '10 1 0%' })
    expect(deleteButton).toHaveStyle({ flex: '10 1 0%' })
    expect(upButton).toHaveStyle({ flex: '7 1 0%' })
    expect(downButton).toHaveStyle({ flex: '7 1 0%' })
    expect(copyButton).toHaveStyle({ flex: '7 1 0%' })
    expect(saveButton).toHaveStyle({ flex: '10 1 0%' })
  })

  it('should have correct spacers between button groups', () => {
    const { container } = render(<SimpleEditableTable data={mockData} onDataChange={jest.fn()} />)

    // Get the button container
    const buttonContainer = container.querySelector('.flex.items-center')
    expect(buttonContainer).toHaveStyle({ gap: '0' })

    // Get all spacer divs (they should have flex: '10 1 0%')
    const spacers = container.querySelectorAll('div[style*="flex: 10 1 0%"]')

    // We should have 2 spacers (one after Delete, one after Copy)
    // But we need to filter out buttons, so let's check the parent structure
    const allFlexItems = buttonContainer?.children

    if (allFlexItems) {
      const flexValues = Array.from(allFlexItems).map(child => {
        const style = (child as HTMLElement).style.flex
        return style
      })

      // Expected pattern: [10, 10, 10, 7, 7, 7, 10, 10]
      // Add, Delete, Spacer, Up, Down, Copy, Spacer, Save
      expect(flexValues).toEqual([
        '10 1 0%', // Add
        '10 1 0%', // Delete
        '10 1 0%', // Spacer
        '7 1 0%',  // Up
        '7 1 0%',  // Down
        '7 1 0%',  // Copy
        '10 1 0%', // Spacer
        '10 1 0%'  // Save
      ])
    }
  })

  it('should have no gap between buttons', () => {
    const { container } = render(<SimpleEditableTable data={mockData} onDataChange={jest.fn()} />)

    const buttonContainer = container.querySelector('.flex.items-center')
    expect(buttonContainer).toHaveStyle({ gap: '0' })
  })

  it('should use simple symbols instead of icons', () => {
    render(<SimpleEditableTable data={mockData} onDataChange={jest.fn()} />)

    const upButton = screen.getByLabelText('Move selected rows up')
    const downButton = screen.getByLabelText('Move selected rows down')
    const copyButton = screen.getByLabelText('Copy selected rows')

    expect(upButton).toHaveTextContent('↑')
    expect(downButton).toHaveTextContent('↓')
    expect(copyButton).toHaveTextContent('📋')
  })
})
