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

    // Check CSS classes (flex values are now in CSS)
    expect(addButton.className).toContain('buttonFlex10')
    expect(deleteButton.className).toContain('buttonFlex10')
    expect(upButton.className).toContain('buttonFlex7')
    expect(downButton.className).toContain('buttonFlex7')
    expect(copyButton.className).toContain('buttonFlex7')
    expect(saveButton.className).toContain('saveButton')
  })

  it('should have correct spacers between button groups', () => {
    const { container } = render(<SimpleEditableTable data={mockData} onDataChange={jest.fn()} />)

    // Get the button container
    const buttonContainer = container.querySelector('.flex.items-center')
    // Gap is now defined in CSS class controlsRow, not inline
    expect(buttonContainer?.className).toContain('controlsRow')

    // Get all spacer divs (they should have spacerFlex10 class)
    const spacers = container.querySelectorAll('[class*="spacerFlex10"]')

    // We should have 2 spacers (one after Delete, one after Copy)
    expect(spacers.length).toBe(2)

    // Verify spacers have the correct CSS class
    spacers.forEach(spacer => {
      expect(spacer.className).toContain('spacerFlex10')
    })
  })

  it('should have no gap between buttons', () => {
    const { container } = render(<SimpleEditableTable data={mockData} onDataChange={jest.fn()} />)

    const buttonContainer = container.querySelector('.flex.items-center')
    // Gap is now defined in CSS class controlsRow, not inline
    expect(buttonContainer?.className).toContain('controlsRow')
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
