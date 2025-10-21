describe('Add Row Functionality', () => {
  let testSessionId: string

  before(() => {
    // Generate unique session ID for this test run
    testSessionId = `test-add-row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create test session with initial data
    cy.request({
      method: 'POST',
      url: '/api/session',
      body: {
        session_id: testSessionId,
        data: [
          { "#": "1", "Qty": "2", "Unit": "pcs", "Price": "50", "Art": "TEST001", "Item": "Test Item 1", "Net": "100", "VAT": "0", "Total": "100" },
          { "#": "2", "Qty": "3", "Unit": "pcs", "Price": "25", "Art": "TEST002", "Item": "Test Item 2", "Net": "75", "VAT": "0", "Total": "75" }
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

  it('should display initial data with 2 rows', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for page to load
    cy.contains('Edit Receipt', { timeout: 10000 }).should('be.visible')

    // Check row count
    cy.contains('2 rows').should('be.visible')

    // Verify data is displayed
    cy.contains('Test Item 1').should('be.visible')
    cy.contains('Test Item 2').should('be.visible')
  })

  it('should add a new row when clicking Add Row button', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for data to load
    cy.contains('2 rows', { timeout: 10000 }).should('be.visible')

    // Click Add Row button
    cy.contains('button', 'Add Row').click()

    // Should now show 3 rows
    cy.contains('3 rows').should('be.visible')

    // Verify the new row appears with default values
    cy.get('table tbody tr').should('have.length', 3)
  })

  it('should allow editing the new row', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for data to load
    cy.contains('2 rows', { timeout: 10000 }).should('be.visible')

    // Add a new row
    cy.contains('button', 'Add Row').click()
    cy.contains('3 rows').should('be.visible')

    // Find the last row and edit its fields
    cy.get('table tbody tr').last().within(() => {
      // Edit Qty field
      cy.get('input').eq(1).clear().type('5')

      // Edit Unit field
      cy.get('input').eq(2).clear().type('kg')

      // Edit Price field
      cy.get('input').eq(3).clear().type('30')

      // Edit Art field
      cy.get('input').eq(4).clear().type('NEW001')
    })

    // Verify the changes
    cy.get('table tbody tr').last().within(() => {
      cy.get('input').eq(1).should('have.value', '5')
      cy.get('input').eq(2).should('have.value', 'kg')
      cy.get('input').eq(3).should('have.value', '30')
      cy.get('input').eq(4).should('have.value', 'NEW001')
    })
  })

  it('should save the new row to the backend', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for data to load
    cy.contains('2 rows', { timeout: 10000 }).should('be.visible')

    // Add a new row
    cy.contains('button', 'Add Row').click()
    cy.contains('3 rows').should('be.visible')

    // Edit the new row
    cy.get('table tbody tr').last().within(() => {
      cy.get('input').eq(1).clear().type('10')
      cy.get('input').eq(2).clear().type('pcs')
      cy.get('input').eq(3).clear().type('15')
      cy.get('input').eq(4).clear().type('SAVED001')
    })

    // Intercept the save request
    cy.intercept('POST', '/api/session').as('saveSession')

    // Click Save button
    cy.contains('button', 'Save').click()

    // Wait for the request to complete
    cy.wait('@saveSession').then((interception) => {
      // Verify the request was successful
      expect(interception.response?.statusCode).to.eq(200)

      // Verify the data includes 3 rows
      const requestData = interception.request.body.data
      expect(requestData).to.have.length(3)

      // Verify the new row data
      const newRow = requestData[2]
      expect(newRow.Qty).to.eq('10')
      expect(newRow.Unit).to.eq('pcs')
      expect(newRow.Price).to.eq('15')
      expect(newRow.Art).to.eq('SAVED001')
    })
  })

  it('should persist the new row after page reload', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for data to load
    cy.contains('2 rows', { timeout: 10000 }).should('be.visible')

    // Add a new row
    cy.contains('button', 'Add Row').click()
    cy.contains('3 rows').should('be.visible')

    // Edit the new row with unique identifier
    const uniqueId = `PERSIST-${Date.now()}`
    cy.get('table tbody tr').last().within(() => {
      cy.get('input').eq(4).clear().type(uniqueId)
    })

    // Save
    cy.contains('button', 'Save').click()

    // Wait a bit for save to complete
    cy.wait(1000)

    // Reload the page
    cy.reload()

    // Verify data persisted
    cy.contains('3 rows', { timeout: 10000 }).should('be.visible')
    cy.contains(uniqueId).should('be.visible')
  })

  it('should allow adding multiple rows sequentially', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for initial data
    cy.contains('2 rows', { timeout: 10000 }).should('be.visible')

    // Add first row
    cy.contains('button', 'Add Row').click()
    cy.contains('3 rows').should('be.visible')

    // Add second row
    cy.contains('button', 'Add Row').click()
    cy.contains('4 rows').should('be.visible')

    // Add third row
    cy.contains('button', 'Add Row').click()
    cy.contains('5 rows').should('be.visible')

    // Verify all rows exist
    cy.get('table tbody tr').should('have.length', 5)
  })

  it('should properly increment row numbers when adding rows', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for initial data (2 rows: #1, #2)
    cy.contains('2 rows', { timeout: 10000 }).should('be.visible')

    // Add a new row
    cy.contains('button', 'Add Row').click()
    cy.contains('3 rows').should('be.visible')

    // Check that the new row has # = 3
    cy.get('table tbody tr').eq(2).within(() => {
      cy.get('input').eq(0).should('have.value', '3')
    })

    // Add another row
    cy.contains('button', 'Add Row').click()
    cy.contains('4 rows').should('be.visible')

    // Check that the new row has # = 4
    cy.get('table tbody tr').eq(3).within(() => {
      cy.get('input').eq(0).should('have.value', '4')
    })
  })

  after(() => {
    // Clean up: Delete the test session
    cy.request({
      method: 'DELETE',
      url: `/api/session?session_id=${testSessionId}`,
      failOnStatusCode: false
    })
  })
})

