import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for TextEncoder/TextDecoder (required by pg module)
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock setImmediate for winston
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args))

// Mock Web APIs
global.Request = class Request {}
global.Response = class Response {}
global.fetch = jest.fn()

// Mock Tabulator globally as a constructor
const MockTabulator = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
  replaceData: jest.fn(),
  getData: jest.fn().mockReturnValue([]),
}))

global.Tabulator = MockTabulator

// Mock Next.js Request/Response for API tests
global.Request = jest.fn()
global.Response = jest.fn()
