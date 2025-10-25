/**
 * E2E tests for row manipulation features
 * Tests Copy, Move Up, Move Down, and Delete functionality
 */

describe('Row Manipulation Features', () => {
  let testSessionId: string

  before(() => {
    // Generate unique UUID for this test run
    testSessionId = crypto.randomUUID()

    // Create test session with 3 items
    cy.request({
      method: 'POST',
      url: '/api/session',
      body: {
        session_id: testSessionId,
        data: [
          { "#": 1, "Qty": 2, "Unit": "pcs", "Price": 100, "Art": "ART001", "Item": "Item 1", "Net": 200, "VAT": 14, "Total": 214 },
          { "#": 2, "Qty": 3, "Unit": "pcs", "Price": 150, "Art": "ART002", "Item": "Item 2", "Net": 450, "VAT": 31.5, "Total": 481.5 },
          { "#": 3, "Qty": 1, "Unit": "pcs", "Price": 200, "Art": "ART003", "Item": "Item 3", "Net": 200, "VAT": 14, "Total": 214 }
        ]
      },
      failOnStatusCode: false,
      retryOnStatusCodeFailure: true
    }).then((response) => {
      if (response.status === 429) {
        cy.wait(2000) // Wait 2 seconds if rate limited
        cy.request({
          method: 'POST',
          url: '/api/session',
          body: {
            session_id: testSessionId,
            data: [
              { "#": 1, "Qty": 2, "Unit": "pcs", "Price": 100, "Art": "ART001", "Item": "Item 1", "Net": 200, "VAT": 14, "Total": 214 },
              { "#": 2, "Qty": 3, "Unit": "pcs", "Price": 150, "Art": "ART002", "Item": "Item 2", "Net": 450, "VAT": 31.5, "Total": 481.5 },
              { "#": 3, "Qty": 1, "Unit": "pcs", "Price": 200, "Art": "ART003", "Item": "Item 3", "Net": 200, "VAT": 14, "Total": 214 }
            ]
          }
        }).then((retryResponse) => {
          expect(retryResponse.status).to.eq(200)
          expect(retryResponse.body).to.have.property('success', true)
        })
      } else {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('success', true)
      }
    })
  })

  beforeEach(() => {
    // Set mobile viewport to test accordion view
    cy.viewport(375, 667)
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for page to load
    cy.contains('Edit Receipt').should('be.visible')

    // Wait for accordion items to appear (at least 1 item should be present)
    cy.get('[data-radix-collection-item]', { timeout: 10000 }).should('have.length.at.least', 1)
  })

  // Helper function to select row by index in mobile view
  const selectRow = (index: number) => {
    cy.get('[data-radix-collection-item]').eq(index).within(() => {
      cy.get('input[type="checkbox"]').should('be.visible').click({ force: true })
    })
    // Wait for state to update
    cy.wait(100)
  }

  // Helper function to check if row is selected
  const checkRowSelected = (index: number, shouldBeChecked: boolean) => {
    cy.get('[data-radix-collection-item]').eq(index).within(() => {
      cy.get('input[type="checkbox"]').should(shouldBeChecked ? 'be.checked' : 'not.be.checked')
    })
  }

  describe('Copy Functionality', () => {
    it('should copy a single selected row', () => {
      // Select first row
      selectRow(0)

      // Click Copy button
      cy.get('button[aria-label="Copy selected rows"]').should('not.be.disabled')
      cy.get('button[aria-label="Copy selected rows"]').click()

      // Verify selection is cleared
      cy.wait(200)
      checkRowSelected(0, false)

      // Should now have 4 rows
      cy.get('[data-radix-collection-item]').should('have.length', 4)

      // Verify the copied row is inserted after the first row
      cy.get('[data-radix-collection-item]').eq(0).should('contain', 'Item 1')
      cy.get('[data-radix-collection-item]').eq(1).should('contain', 'Item 1')
      cy.get('[data-radix-collection-item]').eq(2).should('contain', 'Item 2')
      cy.get('[data-radix-collection-item]').eq(3).should('contain', 'Item 3')
    })

    it('should copy multiple selected rows', () => {
      // Select first and third rows
      selectRow(0)
      selectRow(2)

      // Click Copy button
      cy.get('button[aria-label="Copy selected rows"]').click()

      // Should now have 5 rows (3 original + 2 copies)
      cy.get('[data-radix-collection-item]').should('have.length', 5)

      // Verify rows are in correct order
      cy.get('[data-radix-collection-item]').eq(0).should('contain', 'Item 1')
      cy.get('[data-radix-collection-item]').eq(1).should('contain', 'Item 2')
      cy.get('[data-radix-collection-item]').eq(2).should('contain', 'Item 3')
      cy.get('[data-radix-collection-item]').eq(3).should('contain', 'Item 1') // Copy of row 1
      cy.get('[data-radix-collection-item]').eq(4).should('contain', 'Item 3') // Copy of row 3
    })

    it('should disable Copy button when no rows are selected', () => {
      cy.get('button[aria-label="Copy selected rows"]').should('be.disabled')
    })

    it('should recalculate row indices after copying', () => {
      // Select first row
      selectRow(0)

      // Click Copy button
      cy.get('button[aria-label="Copy selected rows"]').click()

      // Expand all accordion items to check indices
      cy.get('[data-radix-collection-item]').each(($item, index) => {
        cy.wrap($item).within(() => {
          // Check that the row number matches the index + 1
          cy.get('span').first().should('contain', (index + 1).toString())
        })
      })
    })
  })

  describe('Move Up Functionality', () => {
    it('should move a selected row up by one position', () => {
      // Select second row
      selectRow(1)

      // Click Up button
      cy.get('button[aria-label="Move selected rows up"]').should('not.be.disabled')
      cy.get('button[aria-label="Move selected rows up"]').click()

      // Verify row order changed
      cy.get('[data-radix-collection-item]').eq(0).should('contain', 'Item 2')
      cy.get('[data-radix-collection-item]').eq(1).should('contain', 'Item 1')
      cy.get('[data-radix-collection-item]').eq(2).should('contain', 'Item 3')

      // Verify selection moved with the row
      checkRowSelected(0, true)
    })

    it('should not move the first row up', () => {
      // Select first row
      selectRow(0)

      // Up button should still be enabled (it just won't move the row)
      cy.get('button[aria-label="Move selected rows up"]').should('not.be.disabled')
      cy.get('button[aria-label="Move selected rows up"]').click()

      // Row order should remain unchanged
      cy.get('[data-radix-collection-item]').eq(0).should('contain', 'Item 1')
      cy.get('[data-radix-collection-item]').eq(1).should('contain', 'Item 2')
      cy.get('[data-radix-collection-item]').eq(2).should('contain', 'Item 3')
    })

    it('should move multiple selected rows up together', () => {
      // Select second and third rows
      selectRow(1)
      selectRow(2)

      // Click Up button
      cy.get('button[aria-label="Move selected rows up"]').click()

      // Verify row order changed
      cy.get('[data-radix-collection-item]').eq(0).should('contain', 'Item 2')
      cy.get('[data-radix-collection-item]').eq(1).should('contain', 'Item 3')
      cy.get('[data-radix-collection-item]').eq(2).should('contain', 'Item 1')
    })

    it('should disable Up button when no rows are selected', () => {
      cy.get('button[aria-label="Move selected rows up"]').should('be.disabled')
    })
  })

  describe('Move Down Functionality', () => {
    it('should move a selected row down by one position', () => {
      // Select first row
      selectRow(0)

      // Click Down button
      cy.get('button[aria-label="Move selected rows down"]').should('not.be.disabled')
      cy.get('button[aria-label="Move selected rows down"]').click()

      // Verify row order changed
      cy.get('[data-radix-collection-item]').eq(0).should('contain', 'Item 2')
      cy.get('[data-radix-collection-item]').eq(1).should('contain', 'Item 1')
      cy.get('[data-radix-collection-item]').eq(2).should('contain', 'Item 3')

      // Verify selection moved with the row
      checkRowSelected(1, true)
    })

    it('should not move the last row down', () => {
      // Select last row
      selectRow(2)

      // Click Down button
      cy.get('button[aria-label="Move selected rows down"]').click()

      // Row order should remain unchanged
      cy.get('[data-radix-collection-item]').eq(0).should('contain', 'Item 1')
      cy.get('[data-radix-collection-item]').eq(1).should('contain', 'Item 2')
      cy.get('[data-radix-collection-item]').eq(2).should('contain', 'Item 3')
    })

    it('should move multiple selected rows down together', () => {
      // Select first and second rows
      selectRow(0)
      selectRow(1)

      // Click Down button
      cy.get('button[aria-label="Move selected rows down"]').click()

      // Verify row order changed
      cy.get('[data-radix-collection-item]').eq(0).should('contain', 'Item 3')
      cy.get('[data-radix-collection-item]').eq(1).should('contain', 'Item 1')
      cy.get('[data-radix-collection-item]').eq(2).should('contain', 'Item 2')
    })

    it('should disable Down button when no rows are selected', () => {
      cy.get('button[aria-label="Move selected rows down"]').should('be.disabled')
    })
  })

  describe('Delete Functionality', () => {
    it('should delete a selected row', () => {
      // Select second row
      selectRow(1)

      // Click Delete button
      cy.get('button[aria-label="Delete selected rows"]').should('not.be.disabled')
      cy.get('button[aria-label="Delete selected rows"]').click()

      // Should now have 2 rows
      cy.get('[data-radix-collection-item]').should('have.length', 2)

      // Verify remaining rows
      cy.get('[data-radix-collection-item]').eq(0).should('contain', 'Item 1')
      cy.get('[data-radix-collection-item]').eq(1).should('contain', 'Item 3')
    })

    it('should delete multiple selected rows', () => {
      // Select first and third rows
      selectRow(0)
      selectRow(2)

      // Click Delete button
      cy.get('button[aria-label="Delete selected rows"]').click()

      // Should now have 1 row
      cy.get('[data-radix-collection-item]').should('have.length', 1)

      // Verify remaining row
      cy.get('[data-radix-collection-item]').eq(0).should('contain', 'Item 2')
    })

    it('should recalculate row indices after deletion', () => {
      // Select second row
      selectRow(1)

      // Click Delete button
      cy.get('button[aria-label="Delete selected rows"]').click()

      // Check that indices are recalculated
      cy.get('[data-radix-collection-item]').each(($item, index) => {
        cy.wrap($item).within(() => {
          cy.get('span').first().should('contain', (index + 1).toString())
        })
      })
    })

    it('should disable Delete button when no rows are selected', () => {
      cy.get('button[aria-label="Delete selected rows"]').should('be.disabled')
    })
  })

  describe('Combined Operations', () => {
    it('should handle copy, move, and delete in sequence', () => {
      // Copy first row
      selectRow(0)
      cy.get('button[aria-label="Copy selected rows"]').click()

      // Should have 4 rows now
      cy.get('[data-radix-collection-item]').should('have.length', 4)

      // Select and move second row up
      selectRow(1)
      cy.get('button[aria-label="Move selected rows up"]').click()

      // Select and delete last row
      selectRow(3)
      cy.get('button[aria-label="Delete selected rows"]').click()

      // Should have 3 rows now
      cy.get('[data-radix-collection-item]').should('have.length', 3)
    })

    it('should save changes after row manipulation', () => {
      // Copy first row
      selectRow(0)
      cy.get('button[aria-label="Copy selected rows"]').click()

      // Save changes
      cy.get('button[aria-label="Save changes and send data back to bot"]').click()

      // Should show success message
      cy.contains('Success!', { timeout: 10000 }).should('be.visible')

      // Reload page and verify changes persisted
      cy.reload()
      cy.get('[data-radix-collection-item]', { timeout: 10000 }).should('have.length', 4)
    })
  })

  describe('Button Sizing', () => {
    it('should have Up and Down buttons with equal width', () => {
      // Get Up button width
      cy.get('button[aria-label="Move selected rows up"]').then($upBtn => {
        const upWidth = $upBtn.width()

        // Get Down button width
        cy.get('button[aria-label="Move selected rows down"]').then($downBtn => {
          const downWidth = $downBtn.width()

          // Widths should be equal (within 1px tolerance for rounding)
          expect(Math.abs(upWidth! - downWidth!)).to.be.lessThan(2)
        })
      })
    })

    it('should have all action buttons (Up, Down, Copy) with equal width', () => {
      cy.get('button[aria-label="Move selected rows up"]').then($upBtn => {
        const upWidth = $upBtn.width()

        cy.get('button[aria-label="Move selected rows down"]').then($downBtn => {
          const downWidth = $downBtn.width()

          cy.get('button[aria-label="Copy selected rows"]').then($copyBtn => {
            const copyWidth = $copyBtn.width()

            // All widths should be equal
            expect(Math.abs(upWidth! - downWidth!)).to.be.lessThan(2)
            expect(Math.abs(upWidth! - copyWidth!)).to.be.lessThan(2)
            expect(Math.abs(downWidth! - copyWidth!)).to.be.lessThan(2)
          })
        })
      })
    })
  })
})
