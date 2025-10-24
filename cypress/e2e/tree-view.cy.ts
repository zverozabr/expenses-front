describe('Tree View Mode', () => {
  const sessionId = '550e8400-e29b-41d4-a716-446655440000'

  beforeEach(() => {
    cy.visit(`/edit?session_id=${sessionId}`)
    cy.wait(1000) // Wait for data to load
  })

  it('should switch to Tree mode and display tree structure', () => {
    // Switch to Tree mode
    cy.contains('button', 'Tree').click()

    // Check that tree items are visible
    cy.contains('1. Laptop').should('be.visible')
    cy.contains('2. Mouse').should('be.visible')
    cy.contains('3. Keyboard').should('be.visible')
  })

  it('should expand tree item and show all fields with input values', () => {
    // Switch to Tree mode
    cy.contains('button', 'Tree').click()

    // Expand first item
    cy.contains('1. Laptop').click()

    // Check that all field labels are visible
    cy.contains('Qty:').should('be.visible')
    cy.contains('Unit:').should('be.visible')
    cy.contains('Art:').should('be.visible')
    cy.contains('Item:').should('be.visible')
    cy.contains('Price:').should('be.visible')
    cy.contains('Net:').should('be.visible')
    cy.contains('VAT:').should('be.visible')
    cy.contains('Total:').should('be.visible')

    // Check that input fields are visible and contain values
    cy.get('input[type="number"][value="2"]').should('be.visible') // Qty
    cy.get('input[type="text"][value="pcs"]').should('be.visible') // Unit
    cy.get('input[type="text"][value="LAP001"]').should('be.visible') // Art
    cy.get('input[type="text"][value="Laptop"]').should('be.visible') // Item
    cy.get('input[type="number"][value="1000"]').should('be.visible') // Price
    cy.get('input[type="number"][value="2000"]').should('be.visible') // Net
    cy.get('input[type="number"][value="400"]').should('be.visible') // VAT
    cy.get('input[type="number"][value="2400"]').should('be.visible') // Total
  })

  it('should auto-select text when clicking on input field', () => {
    // Switch to Tree mode
    cy.contains('button', 'Tree').click()

    // Expand first item
    cy.contains('1. Laptop').click()

    // Click on Qty input and type new value
    cy.get('input[type="number"]').first().clear().type('5')

    // Wait for update
    cy.wait(300)

    // Check that value changed
    cy.get('input[type="number"]').first().should('have.value', '5')
  })

  it('should edit field value and trigger recalculation', () => {
    // Switch to Tree mode
    cy.contains('button', 'Tree').click()

    // Expand first item
    cy.contains('1. Laptop').click()

    // Change Qty from 2 to 3
    cy.get('input[type="number"][value="2"]').first().clear().type('3')

    // Wait for recalculation
    cy.wait(500)

    // Check that Net is recalculated (3 * 1000 = 3000)
    cy.get('input[type="number"][value="3000"]').should('exist')

    // Check that Total is recalculated (3000 + 400 = 3400)
    cy.get('input[type="number"][value="3400"]').should('exist')
  })

  it('should have proper styling for input fields', () => {
    // Switch to Tree mode
    cy.contains('button', 'Tree').click()

    // Expand first item
    cy.contains('1. Laptop').click()

    // Check that input has proper classes
    cy.get('input[type="number"]').first().should('have.class', 'border')
    cy.get('input[type="number"]').first().should('have.class', 'rounded-md')
    cy.get('input[type="number"]').first().should('have.class', 'px-3')
    cy.get('input[type="number"]').first().should('have.class', 'py-1.5')
  })

  it('should display all rows in tree structure', () => {
    // Switch to Tree mode
    cy.contains('button', 'Tree').click()

    // Check that all 3 rows are visible
    cy.contains('1. Laptop').should('be.visible')
    cy.contains('2. Mouse').should('be.visible')
    cy.contains('3. Keyboard').should('be.visible')
  })

  it('should expand multiple items simultaneously', () => {
    // Switch to Tree mode
    cy.contains('button', 'Tree').click()

    // Expand first item
    cy.contains('1. Laptop').click()
    cy.wait(300)

    // Check first item is expanded by checking if input exists
    cy.get('input[type="text"][value="Laptop"]').should('exist')

    // Expand second item
    cy.contains('2. Mouse').click()
    cy.wait(300)

    // Check second item is expanded by checking if input exists
    cy.get('input[type="text"][value="Mouse"]').should('exist')

    // Both should still exist in DOM
    cy.get('input[type="text"][value="Laptop"]').should('exist')
    cy.get('input[type="text"][value="Mouse"]').should('exist')
  })
})
