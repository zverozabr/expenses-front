/**
 * E2E Test for Production Deployment
 * Tests the deployed application on Vercel
 *
 * Run with: node tests/e2e-production.test.js
 * (Compile first: npx tsc tests/e2e-production.test.ts)
 * Or directly: node --loader ts-node/esm tests/e2e-production.test.ts
 */

const PRODUCTION_URL = 'https://expenses-front-eight.vercel.app'

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL'
  message: string
  details?: any
}

const results: TestResult[] = []

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logTest(name: string) {
  log(`\n▶ ${name}`, colors.blue)
}

function logPass(message: string) {
  log(`  ✓ ${message}`, colors.green)
}

function logFail(message: string) {
  log(`  ✗ ${message}`, colors.red)
}

function logInfo(message: string) {
  log(`  ℹ ${message}`, colors.gray)
}

// Test 1: Health Check
async function testHealthCheck(): Promise<TestResult> {
  logTest('Health Check')

  try {
    const response = await fetch(`${PRODUCTION_URL}/api/health`)
    const data = await response.json()

    if (response.status === 200 && data.status === 'ok') {
      logPass('Application is healthy')
      logInfo(`Database: ${data.database || 'connected'}`)

      return {
        test: 'Health Check',
        status: 'PASS',
        message: 'Application is healthy',
        details: data
      }
    } else {
      logFail(`Unexpected response: ${response.status}`)

      return {
        test: 'Health Check',
        status: 'FAIL',
        message: `Unexpected response: ${response.status}`,
        details: data
      }
    }
  } catch (error) {
    logFail(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)

    return {
      test: 'Health Check',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test 2: Session API - GET with invalid session
async function testGetInvalidSession(): Promise<TestResult> {
  logTest('GET /api/session - Invalid Session')

  try {
    const invalidSessionId = 'invalid-session-id'
    const response = await fetch(`${PRODUCTION_URL}/api/session?session_id=${invalidSessionId}`)
    const data = await response.json()

    if (response.status === 400 && data.error?.includes('Invalid session ID')) {
      logPass('Invalid session ID rejected correctly')

      return {
        test: 'GET Invalid Session',
        status: 'PASS',
        message: 'Invalid session ID rejected correctly'
      }
    } else {
      logFail(`Expected 400 with validation error, got ${response.status}`)

      return {
        test: 'GET Invalid Session',
        status: 'FAIL',
        message: `Expected 400, got ${response.status}`,
        details: data
      }
    }
  } catch (error) {
    logFail(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)

    return {
      test: 'GET Invalid Session',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test 3: Session API - GET non-existent session
async function testGetNonExistentSession(): Promise<TestResult> {
  logTest('GET /api/session - Non-existent Session')

  try {
    const sessionId = '550e8400-e29b-41d4-a716-446655440000' // Valid UUID format
    const response = await fetch(`${PRODUCTION_URL}/api/session?session_id=${sessionId}`)
    const data = await response.json()

    if (response.status === 404 && data.error?.includes('Session not found')) {
      logPass('Non-existent session handled correctly')

      return {
        test: 'GET Non-existent Session',
        status: 'PASS',
        message: 'Non-existent session handled correctly'
      }
    } else {
      logFail(`Expected 404, got ${response.status}`)

      return {
        test: 'GET Non-existent Session',
        status: 'FAIL',
        message: `Expected 404, got ${response.status}`,
        details: data
      }
    }
  } catch (error) {
    logFail(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)

    return {
      test: 'GET Non-existent Session',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test 4: Create and Retrieve Session
async function testCreateAndRetrieveSession(): Promise<TestResult> {
  logTest('POST + GET /api/session - Create and Retrieve')

  try {
    const sessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const testData = [
      {
        "#": 1,
        "Qty": 2,
        "Unit": "pcs",
        "Price": 25.00,
        "Art": "TEST001",
        "Item": "Test Product 1",
        "Net": 50.00,
        "VAT": 0.00,
        "Total": 50.00
      },
      {
        "#": 2,
        "Qty": 1,
        "Unit": "pcs",
        "Price": 15.00,
        "Art": "TEST002",
        "Item": "Test Product 2",
        "Net": 15.00,
        "VAT": 0.00,
        "Total": 15.00
      }
    ]

    // Create session
    const createResponse = await fetch(`${PRODUCTION_URL}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, data: testData })
    })

    if (createResponse.status !== 200) {
      const errorData = await createResponse.json()
      logFail(`Failed to create session: ${createResponse.status}`)
      logInfo(`Error: ${JSON.stringify(errorData)}`)

      return {
        test: 'Create and Retrieve Session',
        status: 'FAIL',
        message: `Failed to create session: ${createResponse.status}`,
        details: errorData
      }
    }

    logPass('Session created successfully')

    // Wait a bit for database consistency
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Retrieve session
    const getResponse = await fetch(`${PRODUCTION_URL}/api/session?session_id=${sessionId}`)
    const getData = await getResponse.json()

    if (getResponse.status === 200 && getData.data) {
      logPass('Session retrieved successfully')
      logInfo(`Items count: ${getData.data.length}`)
      logInfo(`First item: ${getData.data[0].Item}`)

      // Verify data integrity
      if (JSON.stringify(getData.data) === JSON.stringify(testData)) {
        logPass('Data integrity verified')
      } else {
        logFail('Data mismatch detected')
      }

      return {
        test: 'Create and Retrieve Session',
        status: 'PASS',
        message: 'Session created and retrieved successfully',
        details: { sessionId, itemCount: getData.data.length }
      }
    } else {
      logFail(`Failed to retrieve session: ${getResponse.status}`)

      return {
        test: 'Create and Retrieve Session',
        status: 'FAIL',
        message: `Failed to retrieve session: ${getResponse.status}`,
        details: getData
      }
    }
  } catch (error) {
    logFail(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)

    return {
      test: 'Create and Retrieve Session',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test 5: Edit Session Data
async function testEditSession(): Promise<TestResult> {
  logTest('POST /api/session - Edit Existing Session')

  try {
    const sessionId = `edit-test-${Date.now()}`
    const originalData = [
      {
        "#": 1,
        "Qty": 1,
        "Unit": "pcs",
        "Price": 10.00,
        "Art": "EDIT001",
        "Item": "Original Item",
        "Net": 10.00,
        "VAT": 0.00,
        "Total": 10.00
      }
    ]

    // Create session
    await fetch(`${PRODUCTION_URL}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, data: originalData })
    })

    logPass('Original session created')

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update session
    const editedData = [
      {
        "#": 1,
        "Qty": 3, // Changed from 1 to 3
        "Unit": "pcs",
        "Price": 10.00,
        "Art": "EDIT001",
        "Item": "Edited Item", // Changed name
        "Net": 30.00, // Updated
        "VAT": 0.00,
        "Total": 30.00 // Updated
      },
      {
        "#": 2, // New item
        "Qty": 1,
        "Unit": "pcs",
        "Price": 5.00,
        "Art": "EDIT002",
        "Item": "Added Item",
        "Net": 5.00,
        "VAT": 0.00,
        "Total": 5.00
      }
    ]

    const updateResponse = await fetch(`${PRODUCTION_URL}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, data: editedData })
    })

    const updateResult = await updateResponse.json()

    if (updateResponse.status === 200 && updateResult.success) {
      logPass('Session updated successfully')

      // Verify update
      await new Promise(resolve => setTimeout(resolve, 1000))
      const getResponse = await fetch(`${PRODUCTION_URL}/api/session?session_id=${sessionId}`)
      const getData = await getResponse.json()

      if (getData.data.length === 2 && getData.data[0].Qty === 3) {
        logPass('Edit verified: quantity changed and item added')

        return {
          test: 'Edit Session',
          status: 'PASS',
          message: 'Session edited successfully',
          details: { items: getData.data.length }
        }
      } else {
        logFail('Edit verification failed')

        return {
          test: 'Edit Session',
          status: 'FAIL',
          message: 'Edit verification failed'
        }
      }
    } else {
      logFail(`Update failed: ${updateResponse.status}`)

      return {
        test: 'Edit Session',
        status: 'FAIL',
        message: `Update failed: ${updateResponse.status}`,
        details: updateResult
      }
    }
  } catch (error) {
    logFail(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)

    return {
      test: 'Edit Session',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test 6: Data Validation
async function testDataValidation(): Promise<TestResult> {
  logTest('POST /api/session - Data Validation')

  try {
    const sessionId = `validation-test-${Date.now()}`
    const invalidData = [
      {
        "#": 1,
        "Qty": -5, // Invalid: negative quantity
        "Unit": "",
        "Price": 10.00,
        "Art": "INV001",
        "Item": "", // Invalid: empty item name
        "Net": 10.00,
        "VAT": 0.00,
        "Total": 10.00
      }
    ]

    const response = await fetch(`${PRODUCTION_URL}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, data: invalidData })
    })

    const result = await response.json()

    if (response.status === 400 && result.error?.includes('Invalid receipt data')) {
      logPass('Invalid data rejected correctly')
      logInfo(`Validation error: ${result.error}`)

      return {
        test: 'Data Validation',
        status: 'PASS',
        message: 'Invalid data rejected correctly'
      }
    } else {
      logFail(`Expected validation error, got ${response.status}`)

      return {
        test: 'Data Validation',
        status: 'FAIL',
        message: `Expected 400 validation error, got ${response.status}`,
        details: result
      }
    }
  } catch (error) {
    logFail(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)

    return {
      test: 'Data Validation',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test 7: Rate Limiting
async function testRateLimiting(): Promise<TestResult> {
  logTest('Rate Limiting')

  try {
    const requests: Promise<Response>[] = []
    const requestCount = 70 // Exceed the 60/min limit

    logInfo(`Sending ${requestCount} requests...`)

    for (let i = 0; i < requestCount; i++) {
      requests.push(
        fetch(`${PRODUCTION_URL}/api/session?session_id=550e8400-e29b-41d4-a716-446655440000`)
      )
    }

    const responses = await Promise.all(requests)
    const rateLimited = responses.filter(r => r.status === 429)

    if (rateLimited.length > 0) {
      logPass(`Rate limiting active: ${rateLimited.length} requests blocked`)

      return {
        test: 'Rate Limiting',
        status: 'PASS',
        message: `Rate limiting working: ${rateLimited.length}/${requestCount} blocked`
      }
    } else {
      logFail('Rate limiting not triggered')

      return {
        test: 'Rate Limiting',
        status: 'FAIL',
        message: 'Rate limiting not triggered (or limit is higher than expected)'
      }
    }
  } catch (error) {
    logFail(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)

    return {
      test: 'Rate Limiting',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Main test runner
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', colors.blue)
  log('║   E2E Production Deployment Test                          ║', colors.blue)
  log('║   https://expenses-front-eight.vercel.app                 ║', colors.blue)
  log('╚════════════════════════════════════════════════════════════╝', colors.blue)

  const tests = [
    testHealthCheck,
    testGetInvalidSession,
    testGetNonExistentSession,
    testCreateAndRetrieveSession,
    testEditSession,
    testDataValidation,
    testRateLimiting
  ]

  for (const test of tests) {
    const result = await test()
    results.push(result)
    await new Promise(resolve => setTimeout(resolve, 500)) // Pause between tests
  }

  // Summary
  log('\n╔════════════════════════════════════════════════════════════╗', colors.blue)
  log('║   TEST SUMMARY                                            ║', colors.blue)
  log('╚════════════════════════════════════════════════════════════╝', colors.blue)

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length

  results.forEach(result => {
    const statusColor = result.status === 'PASS' ? colors.green : colors.red
    const statusSymbol = result.status === 'PASS' ? '✓' : '✗'
    log(`  ${statusSymbol} ${result.test}: ${result.message}`, statusColor)
  })

  log(`\n  Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`, colors.blue)

  if (failed === 0) {
    log('\n  🎉 All tests passed! Production deployment is working correctly.\n', colors.green)
  } else {
    log('\n  ⚠️  Some tests failed. Please review the results above.\n', colors.red)
  }

  process.exit(failed > 0 ? 1 : 0)
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error)
  process.exit(1)
})

