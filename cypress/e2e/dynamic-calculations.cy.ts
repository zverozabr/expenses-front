describe('Dynamic Calculations', () => {
  beforeEach(() => {
    // Set desktop viewport to ensure table is visible
    cy.viewport(1280, 720)

    // Visit the edit page with a test session ID
    cy.visit('/edit?session_id=test-calculations-session')

    // Wait for the table to load
    cy.get('table').should('be.visible')
  })

  describe('Qty changes', () => {
    it('should recalculate Net and Total when Qty changes', () => {
      // Find the first row's Qty input (column index 1, after checkbox)
      cy.get('table tbody tr').first().within(() => {
        // Get initial values
        cy.get('input').eq(4).should('have.value', '100') // Price
        cy.get('input').eq(6).should('have.value', '200') // Net
        cy.get('input').eq(8).should('have.value', '240') // Total

        // Change Qty from 2 to 3
        cy.get('input').eq(1).clear().type('3')

        // Verify recalculation: Net = 100 * 3 = 300, Total = 300 + 40 = 340
        cy.get('input').eq(6).should('have.value', '300') // Net
        cy.get('input').eq(8).should('have.value', '340') // Total
        cy.get('input').eq(4).should('have.value', '100') // Price unchanged
      })
    })

    it('should handle decimal Qty values', () => {
      cy.get('table tbody tr').first().within(() => {
        // Change Qty to 2.5
        cy.get('input').eq(1).clear().type('2.5')

        // Verify: Net = 100 * 2.5 = 250, Total = 250 + 40 = 290
        cy.get('input').eq(6).should('have.value', '250')
        cy.get('input').eq(8).should('have.value', '290')
      })
    })
  })

  describe('Price changes', () => {
    it('should recalculate Net and Total when Price changes', () => {
      cy.get('table tbody tr').first().within(() => {
        // Change Price from 100 to 150
        cy.get('input').eq(4).clear().type('150')

        // Verify: Net = 150 * 2 = 300, Total = 300 + 40 = 340
        cy.get('input').eq(6).should('have.value', '300')
        cy.get('input').eq(8).should('have.value', '340')
        cy.get('input').eq(1).should('have.value', '2') // Qty unchanged
      })
    })

    it('should round Net and Total correctly', () => {
      cy.get('table tbody tr').first().within(() => {
        // Change Price to 33.33
        cy.get('input').eq(4).clear().type('33.33')

        // Verify: Net = 33.33 * 2 = 66.66, Total = 66.66 + 40 = 106.66
        cy.get('input').eq(6).should('have.value', '66.66')
        cy.get('input').eq(8).should('have.value', '106.66')
      })
    })
  })

  describe('VAT changes', () => {
    it('should adjust Price to keep Total constant when VAT changes', () => {
      cy.get('table tbody tr').first().within(() => {
        // Initial: Qty=2, Price=100, Net=200, VAT=40, Total=240
        // Change VAT from 40 to 60
        cy.get('input').eq(7).clear().type('60')

        // Verify: Total stays 240, Net = 240 - 60 = 180, Price = 180 / 2 = 90
        cy.get('input').eq(8).should('have.value', '240') // Total unchanged
        cy.get('input').eq(6).should('have.value', '180') // Net
        cy.get('input').eq(4).should('have.value', '90') // Price adjusted
        cy.get('input').eq(1).should('have.value', '2') // Qty unchanged
      })
    })

    it('should handle VAT decrease', () => {
      cy.get('table tbody tr').first().within(() => {
        // Change VAT from 40 to 20
        cy.get('input').eq(7).clear().type('20')

        // Verify: Total stays 240, Net = 240 - 20 = 220, Price = 220 / 2 = 110
        cy.get('input').eq(8).should('have.value', '240')
        cy.get('input').eq(6).should('have.value', '220')
        cy.get('input').eq(4).should('have.value', '110')
      })
    })
  })

  describe('Total changes', () => {
    it('should adjust Price to keep VAT constant when Total changes', () => {
      cy.get('table tbody tr').first().within(() => {
        // Initial: Qty=2, Price=100, Net=200, VAT=40, Total=240
        // Change Total from 240 to 300
        cy.get('input').eq(8).clear().type('300')

        // Verify: VAT stays 40, Net = 300 - 40 = 260, Price = 260 / 2 = 130
        cy.get('input').eq(7).should('have.value', '40') // VAT unchanged
        cy.get('input').eq(6).should('have.value', '260') // Net
        cy.get('input').eq(4).should('have.value', '130') // Price adjusted
        cy.get('input').eq(1).should('have.value', '2') // Qty unchanged
      })
    })

    it('should handle Total decrease', () => {
      cy.get('table tbody tr').first().within(() => {
        // Change Total from 240 to 200
        cy.get('input').eq(8).clear().type('200')

        // Verify: VAT stays 40, Net = 200 - 40 = 160, Price = 160 / 2 = 80
        cy.get('input').eq(7).should('have.value', '40')
        cy.get('input').eq(6).should('have.value', '160')
        cy.get('input').eq(4).should('have.value', '80')
      })
    })
  })

  describe('Net changes', () => {
    it('should recalculate Price and Total when Net changes', () => {
      cy.get('table tbody tr').first().within(() => {
        // Initial: Qty=2, Price=100, Net=200, VAT=40, Total=240
        // Change Net from 200 to 300
        cy.get('input').eq(6).clear().type('300')

        // Verify: Price = 300 / 2 = 150, Total = 300 + 40 = 340
        cy.get('input').eq(4).should('have.value', '150') // Price
        cy.get('input').eq(8).should('have.value', '340') // Total
        cy.get('input').eq(7).should('have.value', '40') // VAT unchanged
        cy.get('input').eq(1).should('have.value', '2') // Qty unchanged
      })
    })

    it('should handle decimal Net values', () => {
      cy.get('table tbody tr').first().within(() => {
        // Change Net to 157.01
        cy.get('input').eq(6).clear().type('157.01')

        // Verify: Price = 157.01 / 2 = 78.51 (rounded), Total = 157.01 + 40 = 197.01
        cy.get('input').eq(4).should('have.value', '78.51')
        cy.get('input').eq(8).should('have.value', '197.01')
      })
    })
  })

  describe('Non-numeric fields', () => {
    it('should not trigger recalculation for Item field', () => {
      cy.get('table tbody tr').first().within(() => {
        // Get initial values
        cy.get('input').eq(4).should('have.value', '100') // Price
        cy.get('input').eq(6).should('have.value', '200') // Net
        cy.get('input').eq(8).should('have.value', '240') // Total

        // Change Item name
        cy.get('input').eq(5).clear().type('New Item Name')

        // Verify no recalculation happened
        cy.get('input').eq(4).should('have.value', '100')
        cy.get('input').eq(6).should('have.value', '200')
        cy.get('input').eq(8).should('have.value', '240')
      })
    })

    it('should not trigger recalculation for Unit field', () => {
      cy.get('table tbody tr').first().within(() => {
        // Change Unit
        cy.get('input').eq(2).clear().type('kg')

        // Verify no recalculation
        cy.get('input').eq(4).should('have.value', '100')
        cy.get('input').eq(6).should('have.value', '200')
        cy.get('input').eq(8).should('have.value', '240')
      })
    })
  })

  describe('Multiple operations', () => {
    it('should handle sequential changes correctly', () => {
      cy.get('table tbody tr').first().within(() => {
        // Step 1: Change Qty to 3
        cy.get('input').eq(1).clear().type('3')
        cy.get('input').eq(6).should('have.value', '300') // Net = 100 * 3
        cy.get('input').eq(8).should('have.value', '340') // Total = 300 + 40

        // Step 2: Change VAT to 60
        cy.get('input').eq(7).clear().type('60')
        cy.get('input').eq(8).should('have.value', '340') // Total stays same
        cy.get('input').eq(6).should('have.value', '280') // Net = 340 - 60
        cy.get('input').eq(4).should('have.value', '93.33') // Price = 280 / 3

        // Step 3: Change Price to 100
        cy.get('input').eq(4).clear().type('100')
        cy.get('input').eq(6).should('have.value', '300') // Net = 100 * 3
        cy.get('input').eq(8).should('have.value', '360') // Total = 300 + 60
      })
    })
  })

  describe('Data persistence', () => {
    it('should save calculated values when Save button is clicked', () => {
      cy.get('table tbody tr').first().within(() => {
        // Change Qty to trigger recalculation
        cy.get('input').eq(1).clear().type('5')
        cy.get('input').eq(6).should('have.value', '500') // Net = 100 * 5
        cy.get('input').eq(8).should('have.value', '540') // Total = 500 + 40
      })

      // Click Save button
      cy.contains('button', 'Save').click()

      // Wait for save to complete (toast or success message)
      cy.contains('Success', { timeout: 5000 }).should('be.visible')
    })
  })
})
