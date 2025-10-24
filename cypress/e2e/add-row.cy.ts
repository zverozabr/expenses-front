describe('Add Row Functionality', () => {
  let testSessionId: string

  before(() => {
    // Generate unique UUID for this test run
    testSessionId = crypto.randomUUID()

    // Create test session with initial data
    cy.request({
      method: 'POST',
      url: '/api/session',
      body: {
        session_id: testSessionId,
        data: [
          { "#": 1, "Qty": 2, "Unit": "pcs", "Price": 50, "Art": "TEST001", "Item": "Test Item 1", "Net": 100, "VAT": 0, "Total": 100 },
          { "#": 2, "Qty": 3, "Unit": "pcs", "Price": 25, "Art": "TEST002", "Item": "Test Item 2", "Net": 75, "VAT": 0, "Total": 75 }
        ]
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('success', true)
    })
  })

  beforeEach(() => {
    // Set desktop viewport to ensure table is visible
    cy.viewport(1280, 720)

    cy.clearAllCookies()
    cy.clearAllLocalStorage()
    cy.clearAllSessionStorage()

    // Reset session data to initial state before each test
    cy.request({
      method: 'POST',
      url: '/api/session',
      body: {
        session_id: testSessionId,
        data: [
          { "#": 1, "Qty": 2, "Unit": "pcs", "Price": 50, "Art": "TEST001", "Item": "Test Item 1", "Net": 100, "VAT": 0, "Total": 100 },
          { "#": 2, "Qty": 3, "Unit": "pcs", "Price": 25, "Art": "TEST002", "Item": "Test Item 2", "Net": 75, "VAT": 0, "Total": 75 }
        ]
      }
    })
  })

  it('should display initial data with 2 rows', () => {
    cy.visit(`/edit?session_id=${testSessionId}`)

    // Wait for page to load
    cy.contains('Edit Receipt', { timeout: 10000 }).should('be.visible')

    // Check row count - this ensures data is loaded
    cy.contains('2 rows', { timeout: 10000 }).should('be.visible')

    // Verify data is displayed in the table
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length', 2)
    cy.get('table').contains('Test Item 1', { timeout: 10000 }).should('be.visible')
    cy.get('table').contains('Test Item 2').should('be.visible')
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
      // Skip checkbox (index 0), start from index 1 for data fields
      // Index 1 = #, Index 2 = Qty, Index 3 = Unit, Index 4 = Price, Index 5 = Art

      // Edit Qty field (index 2)
      cy.get('input[type="number"]').eq(1).click().type('{selectall}').type('5')

      // Edit Unit field (index 3)
      cy.get('input[type="text"]').eq(0).click().type('{selectall}').type('kg')

      // Edit Price field (index 4)
      cy.get('input[type="number"]').eq(2).click().type('{selectall}').type('30')

      // Edit Art field (index 5)
      cy.get('input[type="text"]').eq(1).click().type('{selectall}').type('NEW001')
    })

    // Verify the changes
    cy.get('table tbody tr').last().within(() => {
      cy.get('input[type="number"]').eq(1).should('have.value', '5')
      cy.get('input[type="text"]').eq(0).should('have.value', 'kg')
      cy.get('input[type="number"]').eq(2).should('have.value', '30')
      cy.get('input[type="text"]').eq(1).should('have.value', 'NEW001')
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
      cy.get('input[type="number"]').eq(1).click().type('{selectall}').type('10')
      cy.get('input[type="text"]').eq(0).click().type('{selectall}').type('pcs')
      cy.get('input[type="number"]').eq(2).click().type('{selectall}').type('15')
      cy.get('input[type="text"]').eq(1).click().type('{selectall}').type('SAVED001')
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
      expect(newRow.Qty).to.eq(10)
      expect(newRow.Unit).to.eq('pcs')
      expect(newRow.Price).to.eq(15)
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
      cy.get('input[type="text"]').eq(1).click().type('{selectall}').type(uniqueId)
    })

    // Intercept save request to ensure it completes
    cy.intercept('POST', '/api/session').as('saveSession')

    // Save
    cy.contains('button', 'Save').click()

    // Wait for save to complete
    cy.wait('@saveSession').its('response.statusCode').should('eq', 200)

    // Reload the page
    cy.reload()

    // Verify data persisted
    cy.contains('3 rows', { timeout: 10000 }).should('be.visible')
    cy.get('table').contains(uniqueId, { timeout: 10000 }).should('be.visible')
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
      cy.get('input[type="number"]').eq(0).should('have.value', '3')
    })

    // Add another row
    cy.contains('button', 'Add Row').click()
    cy.contains('4 rows').should('be.visible')

    // Check that the new row has # = 4
    cy.get('table tbody tr').eq(3).within(() => {
      cy.get('input[type="number"]').eq(0).should('have.value', '4')
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

