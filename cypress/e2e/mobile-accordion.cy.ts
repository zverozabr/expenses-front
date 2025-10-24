describe('Mobile Accordion View', () => {
  const sessionId = '550e8400-e29b-41d4-a716-446655440000'

  beforeEach(() => {
    // Set mobile viewport (iPhone 12)
    cy.viewport(390, 844)
    cy.visit(`/edit?session_id=${sessionId}`)
    cy.wait(1000) // Wait for data to load
  })

  it('should display accordion cards on mobile instead of table', () => {
    // Table should be hidden on mobile
    cy.get('.md\\:block').should('not.be.visible')

    // Accordion should be visible on mobile
    cy.get('.md\\:hidden').should('be.visible')

    // Should have accordion items
    cy.get('[data-radix-collection-item]').should('have.length.at.least', 1)
  })

  it('should display row summary in accordion trigger', () => {
    // First accordion item should show item name and total
    cy.get('[data-radix-collection-item]').first().within(() => {
      // Should show item number and name
      cy.contains('1.').should('be.visible')
      cy.contains('Laptop').should('be.visible')

      // Should show total
      cy.contains(/\d+\.\d{2}/).should('be.visible')
    })
  })

  it('should expand accordion and show all fields', () => {
    // Click first accordion item to expand
    cy.get('[data-radix-collection-item]').first().click()
    cy.wait(300)

    // Should show all field labels
    cy.contains('label', '#').should('be.visible')
    cy.contains('label', 'Qty').should('be.visible')
    cy.contains('label', 'Unit').should('be.visible')
    cy.contains('label', 'Item').should('be.visible')
    cy.contains('label', 'Price').should('be.visible')
    cy.contains('label', 'Net').should('be.visible')
    cy.contains('label', 'VAT').should('be.visible')
    cy.contains('label', 'Total').should('be.visible')

    // Should show input fields with values
    cy.get('input[type="number"][value="1"]').should('exist') // #
    cy.get('input[type="number"][value="2"]').should('exist') // Qty
    cy.get('input[type="text"][value="pcs"]').should('exist') // Unit
    cy.get('input[type="text"][value="Laptop"]').should('exist') // Item
  })

  it('should allow editing fields in accordion', () => {
    // Expand first accordion item
    cy.get('[data-radix-collection-item]').first().click()
    cy.wait(300)

    // Find and edit Qty field
    cy.contains('label', 'Qty').parent().find('input').clear().type('5')
    cy.wait(300)

    // Value should be updated
    cy.contains('label', 'Qty').parent().find('input').should('have.value', '5')
  })

  it('should allow selecting rows via checkbox in accordion', () => {
    // First accordion should have checkbox
    cy.get('[data-radix-collection-item]').first().within(() => {
      cy.get('input[type="checkbox"]').should('exist')

      // Click checkbox
      cy.get('input[type="checkbox"]').click()

      // Checkbox should be checked
      cy.get('input[type="checkbox"]').should('be.checked')
    })

    // Wait for state update
    cy.wait(300)

    // Delete button should show count
    cy.contains('Delete (1)').should('be.visible')

    // Check that accordion item has destructive styling by checking its classes
    cy.get('.bg-destructive\\/10').should('exist')
  })

  it('should expand multiple accordions simultaneously', () => {
    // Expand first accordion
    cy.get('[data-radix-collection-item]').first().click()
    cy.wait(300)

    // Expand second accordion
    cy.get('[data-radix-collection-item]').eq(1).click()
    cy.wait(300)

    // Both should be expanded (check for input fields)
    cy.get('input[type="text"][value="Laptop"]').should('be.visible')
    cy.get('input[type="text"][value="Mouse"]').should('be.visible')
  })

  it('should display proper styling for accordion cards', () => {
    // Check that accordion items have proper styling by checking for classes
    cy.get('.rounded-xl.border').should('have.length.at.least', 1)
  })

  it('should work with Add Row button on mobile', () => {
    // Click Add Row button
    cy.contains('+ Row').click()
    cy.wait(300)

    // Should have one more accordion item
    cy.get('[data-radix-collection-item]').should('have.length.at.least', 3)

    // Last accordion should show "New Item" in trigger
    cy.get('[data-radix-collection-item]').last().within(() => {
      cy.contains('New Item').should('be.visible')
    })

    // Expand last accordion
    cy.get('[data-radix-collection-item]').last().click()
    cy.wait(300)

    // Check for default values in expanded accordion
    cy.contains('label', 'Item').parent().find('input').should('have.value', 'New Item')
    cy.contains('label', 'Qty').parent().find('input').should('have.value', '1')
  })
})

describe('Desktop Table View', () => {
  const sessionId = '550e8400-e29b-41d4-a716-446655440000'

  beforeEach(() => {
    // Set desktop viewport
    cy.viewport(1280, 720)
    cy.visit(`/edit?session_id=${sessionId}`)
    cy.wait(1000) // Wait for data to load
  })

  it('should display table on desktop instead of accordion', () => {
    // Table should be visible on desktop
    cy.get('.md\\:block').should('be.visible')

    // Accordion should be hidden on desktop
    cy.get('.md\\:hidden').should('not.be.visible')

    // Should have table rows
    cy.get('tbody tr').should('have.length.at.least', 1)
  })

  it('should display all columns in table', () => {
    // Should have all column headers
    cy.contains('th', '#').should('be.visible')
    cy.contains('th', 'Qty').should('be.visible')
    cy.contains('th', 'Unit').should('be.visible')
    cy.contains('th', 'Item').should('be.visible')
    cy.contains('th', 'Price').should('be.visible')
    cy.contains('th', 'Net').should('be.visible')
    cy.contains('th', 'VAT').should('be.visible')
    cy.contains('th', 'Total').should('be.visible')
  })
})
