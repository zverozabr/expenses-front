describe('Version Display and Button Layout', () => {
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
          { "#": 1, "Qty": 2, "Unit": "pcs", "Price": 5.99, "Art": "ART001", "Item": "Test Item 1", "Net": 11.98, "VAT": 0.00, "Total": 11.98 },
          { "#": 2, "Qty": 1, "Unit": "pcs", "Price": 3.49, "Art": "ART002", "Item": "Test Item 2", "Net": 3.49, "VAT": 0.00, "Total": 3.49 }
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

  describe('Version Badge', () => {
    it('should display version badge in top-right corner', () => {
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Wait for page to load
      cy.contains('Edit Receipt').should('be.visible')

      // Check version badge exists
      cy.get('.fixed.top-2.right-2').should('exist')
      cy.get('.fixed.top-2.right-2 span').should('be.visible')
    })

    it('should display 3-character version or "dev"', () => {
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Get version text
      cy.get('.fixed.top-2.right-2 span').invoke('text').then((text) => {
        // Should be either 3 characters or "dev"
        expect(text.length).to.be.oneOf([3])
      })
    })

    it('should have tooltip with full commit hash', () => {
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Check title attribute exists
      cy.get('.fixed.top-2.right-2 span').should('have.attr', 'title')
      cy.get('.fixed.top-2.right-2 span').invoke('attr', 'title').should('match', /Git commit:/)
    })

    it('should have small font size and monospace font', () => {
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Check styling
      cy.get('.fixed.top-2.right-2 span')
        .should('have.class', 'text-[10px]')
        .and('have.class', 'font-mono')
    })
  })

  describe('Button Layout', () => {
    it('should display all three buttons in the same row', () => {
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Wait for page to load
      cy.contains('Edit Receipt').should('be.visible')

      // Find the controls container
      cy.get('.mb-4.flex').first().within(() => {
        // Should have Add Row button
        cy.contains('button', /Row/).should('be.visible')

        // Should have Delete button
        cy.contains('button', /Delete/).should('be.visible')

        // Should have Save button
        cy.contains('button', /Save/).should('be.visible')
      })
    })

    it('should not have sticky Save button at bottom', () => {
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Wait for page to load
      cy.contains('Edit Receipt').should('be.visible')

      // Should not have fixed bottom container
      cy.get('.fixed.bottom-0').should('not.exist')
    })

    it('should have Save button with small size', () => {
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Find Save button
      cy.contains('button', /Save/).should('be.visible')

      // Should not have large button height class
      cy.contains('button', /Save/).should('not.have.class', 'h-11')
    })

    it('should display row count next to buttons', () => {
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Should show "2 rows"
      cy.contains('2 rows').should('be.visible')
    })
  })

  describe('Button Functionality', () => {
    it('should allow clicking Save button from controls row', () => {
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Wait for data to load
      cy.contains('Edit Receipt').should('be.visible')

      // Click Save button
      cy.contains('button', /Save/).click()

      // Should show saving state or success (depending on implementation)
      // This is just to verify the button is clickable
    })

    it('should have all buttons in the same flex container', () => {
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Find the flex container with gap-2
      cy.get('.flex.gap-2.flex-1').should('exist').within(() => {
        // Should contain all three buttons
        cy.get('button').should('have.length', 3)
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should display buttons correctly on mobile viewport', () => {
      cy.viewport('iphone-x')
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Wait for page to load
      cy.contains('Edit Receipt').should('be.visible')

      // All buttons should be visible
      cy.contains('button', /Row/).should('be.visible')
      cy.contains('button', /Delete/).should('be.visible')
      cy.contains('button', /Save/).should('be.visible')
    })

    it('should display version badge on mobile', () => {
      cy.viewport('iphone-x')
      cy.visit(`/edit?session_id=${testSessionId}`)

      // Version badge should be visible
      cy.get('.fixed.top-2.right-2 span').should('be.visible')
    })
  })
})
