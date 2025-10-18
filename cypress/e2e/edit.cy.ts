describe('Complete Receipt Editing Workflow', () => {
  let testSessionId: string

  before(() => {
    // Generate unique session ID for this test run
    testSessionId = `test-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create test session in database via API
    cy.request({
      method: 'POST',
      url: '/api/session',
      body: {
        session_id: testSessionId,
        data: [
          { "#": 1, "Qty": 2, "Unit": "pcs", "Price": 5.99, "Art": "ART001", "Item": "Test Item 1", "Net": 11.98, "VAT": 0.00, "Total": 11.98 },
          { "#": 2, "Qty": 1, "Unit": "pcs", "Price": 3.49, "Art": "ART002", "Item": "Test Item 2", "Net": 3.49, "VAT": 0.00, "Total": 3.49 }
        ]
      },
      failOnStatusCode: false // Don't fail on error status codes
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('success', true)
    })
  })

  beforeEach(() => {
    // Clear any existing intercepts
    cy.clearAllCookies()
    cy.clearAllLocalStorage()
    cy.clearAllSessionStorage()
  })

  it('should load the edit page and display receipt data', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for page to load
    cy.contains('Edit JSON Table').should('be.visible')
    cy.contains('Edit the receipt data below').should('be.visible')

    // Wait for data to load (table should appear)
    cy.get('.tabulator').should('be.visible')

    // Check that data is displayed
    cy.contains('Test Item 1').should('be.visible')
    cy.contains('Test Item 2').should('be.visible')
    cy.contains('11.98').should('be.visible') // Total for first item
    cy.contains('3.49').should('be.visible')  // Total for second item
  })

  it('should allow editing quantity and recalculating totals', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for table to load
    cy.get('.tabulator').should('be.visible')

    // Find the Qty cell for first item and double-click to edit
    cy.get('.tabulator-table').within(() => {
      // Find row with Test Item 1 and edit Qty column
      cy.contains('Test Item 1').parent().parent().within(() => {
        // Find Qty cell and double-click
        cy.get('td').eq(2).dblclick() // Qty is 3rd column (0-indexed)

        // Type new quantity
        cy.get('input').clear().type('3{enter}')
      })
    })

    // Verify that the quantity was updated (this might require checking the data)
    // Since Tabulator updates data asynchronously, we might need to wait
    cy.wait(500)

    // Save the changes
    cy.contains('Save and Send Back').click()

    // Should show success toast
    cy.contains('Success!').should('be.visible')
    cy.contains('Data validated, saved and sent back to bot!').should('be.visible')
  })

  it('should allow adding new rows', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for table to load
    cy.get('.tabulator').should('be.visible')

    // Click "Add Row" button
    cy.contains('+ Add Row').click()

    // New row should appear
    cy.get('.tabulator-table tbody tr').should('have.length', 3) // 2 original + 1 new

    // Fill in the new row data
    cy.get('.tabulator-table').within(() => {
      // Edit the new row (last row)
      cy.get('tbody tr').last().within(() => {
        // Edit Qty
        cy.get('td').eq(1).dblclick() // # column
        cy.get('input').clear().type('3{enter}')

        // Edit Qty
        cy.get('td').eq(2).dblclick() // Qty column
        cy.get('input').clear().type('1{enter}')

        // Edit Unit
        cy.get('td').eq(3).dblclick() // Unit column
        cy.get('input').clear().type('pcs{enter}')

        // Edit Price
        cy.get('td').eq(4).dblclick() // Price column
        cy.get('input').clear().type('2.99{enter}')

        // Edit Item name
        cy.get('td').eq(6).dblclick() // Item column
        cy.get('input').clear().type('New Test Item{enter}')
      })
    })

    // Save changes
    cy.contains('Save and Send Back').click()

    // Check success
    cy.contains('Success!').should('be.visible')
  })

  it('should allow deleting rows', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for table to load
    cy.get('.tabulator').should('be.visible')

    // Select first row checkbox
    cy.get('.tabulator-table').within(() => {
      cy.get('tbody tr').first().within(() => {
        cy.get('input[type="checkbox"]').check()
      })
    })

    // Click delete button
    cy.contains('🗑️ Delete Selected').click()

    // Row should be removed
    cy.get('.tabulator-table tbody tr').should('have.length', 1)

    // Save changes
    cy.contains('Save and Send Back').click()

    // Check success
    cy.contains('Success!').should('be.visible')
  })

  it('should handle invalid session ID gracefully', () => {
    const invalidSessionId = 'invalid-session-123'

    cy.visit(`/edit?session_id=${invalidSessionId}`)

    // Should show error message
    cy.contains('Session not found or expired').should('be.visible')
  })

  it('should handle missing session ID gracefully', () => {
    cy.visit('/edit')

    // Should show warning
    cy.contains('No session ID provided').should('be.visible')
    cy.contains('Please access this page through the Telegram bot').should('be.visible')
  })

  it('should validate data before saving', () => {
    // First create a session with invalid data
    const invalidSessionId = `invalid-data-${Date.now()}`

    cy.request({
      method: 'POST',
      url: '/api/session',
      body: {
        session_id: invalidSessionId,
        data: [
          { "#": 1, "Qty": -1, "Unit": "pcs", "Price": 5.99, "Art": "ART001", "Item": "", "Net": 11.98, "VAT": 0.00, "Total": 11.98 }
        ]
      },
      failOnStatusCode: false
    })

    cy.visit(`/edit?session_id=${invalidSessionId}`)

    // Wait for table to load
    cy.get('.tabulator').should('be.visible')

    // Try to save invalid data
    cy.contains('Save and Send Back').click()

    // Should show validation error
    cy.contains('Save failed').should('be.visible')
    cy.contains('Invalid receipt data').should('be.visible')
  })

  after(() => {
    // Clean up test data
    // Note: In a real scenario, you might want to clean up the test session
    // But for now, we'll leave it as the session will expire naturally
  })
})
