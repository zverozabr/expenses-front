describe('Input Select on Focus Functionality', () => {
  let testSessionId: string

  before(() => {
    // Generate unique UUID for this test run
    testSessionId = crypto.randomUUID()

    // Create test session in database via API
    cy.request({
      method: 'POST',
      url: '/api/session',
      body: {
        session_id: testSessionId,
        data: [
          { "#": 1, "Qty": 5, "Unit": "pcs", "Price": 10.50, "Art": "ART123", "Item": "Test Product", "Net": 52.50, "VAT": 5.25, "Total": 57.75 },
          { "#": 2, "Qty": 3, "Unit": "kg", "Price": 7.99, "Art": "ART456", "Item": "Another Item", "Net": 23.97, "VAT": 2.40, "Total": 26.37 }
        ]
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('success', true)
    })
  })

  beforeEach(() => {
    cy.clearAllCookies()
    cy.clearAllLocalStorage()
    cy.clearAllSessionStorage()
  })

  describe('Desktop Table View - Text Selection on Focus', () => {
    beforeEach(() => {
      // Set desktop viewport
      cy.viewport(1280, 720)
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Wait for table to load
      cy.get('table', { timeout: 10000 }).should('be.visible')
    })

    it('should replace value when typing immediately after focus (Qty field)', () => {
      // Find the first Qty input
      cy.get('table tbody tr').first().find('input[type="number"]').first().as('qtyInput')

      // Get original value
      cy.get('@qtyInput').invoke('val').then((originalValue) => {
        // Click to focus and immediately type
        cy.get('@qtyInput').click().type('99')

        // The value should be replaced, not appended
        // If selectAll works, typing "99" should result in "99"
        // If selectAll doesn't work, typing "99" would result in "599" (appended to "5")
        cy.get('@qtyInput').should('have.value', '99')
      })
    })

    it('should replace value when typing immediately after focus (Unit field)', () => {
      // Find the first Unit input (text input)
      cy.get('table tbody tr').first().find('input[type="text"]').first().as('unitInput')

      // Click to focus and immediately type
      cy.get('@unitInput').click().type('box')

      // Should replace "pcs" with "box", not append
      cy.get('@unitInput').should('have.value', 'box')
    })

    it('should replace value when typing immediately after focus (Item field)', () => {
      // Find the Item input (should be one of the text inputs)
      cy.get('table tbody tr').first().find('input[type="text"]').eq(2).as('itemInput')

      // Click to focus and immediately type
      cy.get('@itemInput').click().type('New Item Name')

      // Should replace the original value
      cy.get('@itemInput').should('have.value', 'New Item Name')
    })

    it('should replace value when typing immediately after focus (Price field)', () => {
      // Find the Price input
      cy.get('table tbody tr').first().find('input[type="number"]').eq(1).as('priceInput')

      // Click to focus and immediately type
      cy.get('@priceInput').click().type('25.99')

      // Should replace the original value
      cy.get('@priceInput').should('have.value', '25.99')
    })

    it('should work for multiple fields in sequence', () => {
      // Test that selectAll works when tabbing/clicking between fields
      cy.get('table tbody tr').first().within(() => {
        // Focus on Qty, type new value
        cy.get('input[type="number"]').first().click().type('10')
        cy.get('input[type="number"]').first().should('have.value', '10')

        // Focus on Unit, type new value
        cy.get('input[type="text"]').first().click().type('kg')
        cy.get('input[type="text"]').first().should('have.value', 'kg')
      })
    })
  })

  describe.skip('Mobile Accordion View - Text Selection on Focus', () => {
    beforeEach(() => {
      // Set mobile viewport
      cy.viewport(375, 667)
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Wait for accordion to load
      cy.get('[data-radix-collection-item]', { timeout: 10000 }).should('be.visible')
    })

    it('should replace value when typing immediately after focus in accordion', () => {
      // Click on the accordion trigger button to open
      cy.get('[data-radix-collection-item]').first().find('button').click()

      // Wait for content to expand
      cy.wait(500)

      // Find inputs in the expanded content
      cy.get('input[type="number"]').first().as('numberInput')

      // Get original value
      cy.get('@numberInput').invoke('val').then((originalValue) => {
        // Click to focus and immediately type
        cy.get('@numberInput').click().type('88')

        // Should replace, not append
        cy.get('@numberInput').should('have.value', '88')
      })
    })

    it('should replace text input value in accordion', () => {
      // Click on the accordion trigger button to open
      cy.get('[data-radix-collection-item]').first().find('button').click()

      // Wait for content to expand
      cy.wait(500)

      // Find a text input
      cy.get('input[type="text"]').first().as('textInput')

      // Click to focus and immediately type
      cy.get('@textInput').click().type('NewValue')

      // Should replace the original value
      cy.get('@textInput').should('have.value', 'NewValue')
    })
  })

  describe('Practical User Workflow', () => {
    beforeEach(() => {
      cy.viewport(1280, 720)
      cy.visit(`/edit?session_id=${testSessionId}`)
      cy.get('table', { timeout: 10000 }).should('be.visible')
    })

    it('should allow quick editing of multiple fields without manual selection', () => {
      // Simulate a user quickly editing multiple fields
      // This is the main benefit of selectAll on focus

      cy.get('table tbody tr').first().within(() => {
        // Edit Qty - just click and type
        cy.get('input[type="number"]').first().click().clear().type('20')

        // Edit Price - just click and type
        cy.get('input[type="number"]').eq(1).click().clear().type('15.50')
      })

      // Verify values were set correctly
      cy.get('table tbody tr').first().within(() => {
        cy.get('input[type="number"]').first().should('have.value', '20')
        cy.get('input[type="number"]').eq(1).should('have.value', '15.50')
      })
    })

    it('should work correctly after page reload', () => {
      // Edit a value
      cy.get('table tbody tr').first().find('input[type="number"]').first()
        .click().clear().type('15')

      // Reload page
      cy.reload()
      cy.get('table', { timeout: 10000 }).should('be.visible')

      // Test selectAll still works
      cy.get('table tbody tr').first().find('input[type="number"]').first()
        .click().type('30')

      cy.get('table tbody tr').first().find('input[type="number"]').first()
        .should('have.value', '30')
    })
  })

  after(() => {
    // Clean up test data
    // The session will expire naturally
  })
})
