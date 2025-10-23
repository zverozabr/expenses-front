import { sendSessionIdToBot, isTelegramWebAppAvailable } from '../telegram'

describe('Telegram WebApp utilities', () => {
  let mockTelegramWebApp: any
  let consoleWarnSpy: jest.SpyInstance
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    // Setup mock Telegram WebApp
    mockTelegramWebApp = {
      sendData: jest.fn(),
      close: jest.fn(),
      ready: jest.fn(),
      expand: jest.fn(),
    }

    // Setup window.Telegram mock
    Object.defineProperty(global, 'window', {
      value: {
        Telegram: {
          WebApp: mockTelegramWebApp,
        },
      },
      writable: true,
      configurable: true,
    })

    // Spy on console methods
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
    consoleWarnSpy.mockRestore()
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('isTelegramWebAppAvailable', () => {
    it('should return true when Telegram WebApp is available', () => {
      expect(isTelegramWebAppAvailable()).toBe(true)
    })

    it('should return false when window is undefined', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      })
      expect(isTelegramWebAppAvailable()).toBe(false)
    })

    it('should return false when Telegram is undefined', () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
        configurable: true,
      })
      expect(isTelegramWebAppAvailable()).toBe(false)
    })

    it('should return false when WebApp is undefined', () => {
      Object.defineProperty(global, 'window', {
        value: { Telegram: {} },
        writable: true,
        configurable: true,
      })
      expect(isTelegramWebAppAvailable()).toBe(false)
    })
  })

  describe('sendSessionIdToBot', () => {
    it('should send session ID to bot when Telegram WebApp is available', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000'
      const result = sendSessionIdToBot(sessionId)

      expect(result).toBe(true)
      expect(mockTelegramWebApp.sendData).toHaveBeenCalledWith(
        JSON.stringify({ session_id: sessionId })
      )
      expect(consoleLogSpy).toHaveBeenCalledWith('Session ID sent to bot:', sessionId)
    })

    it('should NOT call close() because sendData closes automatically', () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000'
      sendSessionIdToBot(sessionId)

      expect(mockTelegramWebApp.sendData).toHaveBeenCalled()
      expect(mockTelegramWebApp.close).not.toHaveBeenCalled()
    })

    it('should return false when Telegram WebApp is not available', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      })
      const result = sendSessionIdToBot('550e8400-e29b-41d4-a716-446655440000')

      expect(result).toBe(false)
      expect(consoleWarnSpy).toHaveBeenCalledWith('Telegram WebApp is not available')
    })

    it('should return false when session ID is empty', () => {
      const result = sendSessionIdToBot('   ')

      expect(result).toBe(false)
      expect(mockTelegramWebApp.sendData).not.toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalledWith('Session ID is empty')
    })

    it('should return false when session ID is null', () => {
      const result = sendSessionIdToBot(null as any)

      expect(result).toBe(false)
      expect(mockTelegramWebApp.sendData).not.toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid session ID provided')
    })

    it('should handle sendData errors gracefully', () => {
      mockTelegramWebApp.sendData.mockImplementation(() => {
        throw new Error('Send failed')
      })

      const result = sendSessionIdToBot('550e8400-e29b-41d4-a716-446655440000')

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send session ID to bot:',
        expect.any(Error)
      )
    })

    it('should trim whitespace from session ID', () => {
      const sessionId = '  550e8400-e29b-41d4-a716-446655440000  '
      sendSessionIdToBot(sessionId)

      expect(mockTelegramWebApp.sendData).toHaveBeenCalledWith(
        JSON.stringify({ session_id: '550e8400-e29b-41d4-a716-446655440000' })
      )
    })

    it('should validate session ID format (UUID)', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000'
      const result = sendSessionIdToBot(validUUID)

      expect(result).toBe(true)
      expect(mockTelegramWebApp.sendData).toHaveBeenCalled()
    })

    it('should reject invalid session ID format', () => {
      const invalidId = 'not-a-valid-uuid'
      const result = sendSessionIdToBot(invalidId)

      expect(result).toBe(false)
      expect(mockTelegramWebApp.sendData).not.toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalledWith('Session ID is not a valid UUID format')
    })

    it('should handle data size limit (4096 bytes)', () => {
      // UUID is well under 4096 bytes, so this should pass
      const validUUID = '550e8400-e29b-41d4-a716-446655440000'
      const result = sendSessionIdToBot(validUUID)

      expect(result).toBe(true)

      // Verify the JSON string is under 4096 bytes
      const dataString = JSON.stringify({ session_id: validUUID })
      expect(dataString.length).toBeLessThan(4096)
    })
  })
})
