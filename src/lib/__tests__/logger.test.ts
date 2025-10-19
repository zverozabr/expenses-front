import { withAPILogging, getClientIP, logAPIRequest } from '../logger'

describe('withAPILogging', () => {
  const mockHandler = jest.fn()
  const wrappedHandler = withAPILogging(mockHandler)
  const logSpy = jest.spyOn({ logAPIRequest }, 'logAPIRequest')

  beforeEach(() => {
    jest.clearAllMocks()
    logSpy.mockClear()
    mockHandler.mockResolvedValue({ status: 200 })
  })

  it('should call handler and return its result', async () => {
    const mockRequest = {
      method: 'GET',
      url: 'https://example.com/api/test',
      headers: {
        get: jest.fn(() => null)
      }
    } as any

    const expectedResult = { status: 200 }
    mockHandler.mockResolvedValue(expectedResult)

    const result = await wrappedHandler(mockRequest)

    expect(mockHandler).toHaveBeenCalledWith(mockRequest)
    expect(result).toEqual(expectedResult)
  })

  it('should re-throw handler errors', async () => {
    const mockRequest = {
      method: 'POST',
      url: 'https://example.com/api/test',
      headers: {
        get: jest.fn(() => null)
      }
    } as any

    const handlerError = new Error('Handler failed')
    mockHandler.mockRejectedValue(handlerError)

    await expect(wrappedHandler(mockRequest)).rejects.toThrow('Handler failed')
  })

  it('should extract client IP correctly', () => {
    const mockRequest = {
      headers: {
        get: jest.fn((header) => {
          switch (header) {
            case 'x-forwarded-for': return '10.0.0.1, 192.168.1.1'
            case 'x-real-ip': return '10.0.0.2'
            case 'x-client-ip': return '10.0.0.3'
            default: return null
          }
        })
      }
    } as any

    expect(getClientIP(mockRequest)).toBe('10.0.0.1')
  })

  it('should fallback to real IP', () => {
    const mockRequest = {
      headers: {
        get: jest.fn((header) => {
          if (header === 'x-real-ip') return '10.0.0.2'
          return null
        })
      }
    } as any

    expect(getClientIP(mockRequest)).toBe('10.0.0.2')
  })

  it('should return unknown if no IP headers', () => {
    const mockRequest = {
      headers: {
        get: jest.fn(() => null)
      }
    } as any

    expect(getClientIP(mockRequest)).toBe('unknown')
  })
})
