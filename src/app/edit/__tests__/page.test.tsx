import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditPage from '../page'
import { PWAProvider } from '@/components/PWAProvider'

// Mock next/navigation
const mockSearchParams = { get: jest.fn() }
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

// Mock useSessionData
jest.mock('@/hooks/useSessionData', () => ({
  useSessionData: jest.fn(),
}))

// Mock EditableTable component
jest.mock('@/components/EditableTable', () => ({
  EditableTable: () => <div data-testid="editable-table">Mocked Table</div>,
}))

import { useSessionData } from '@/hooks/useSessionData'

const mockUseSessionData = useSessionData as jest.MockedFunction<typeof useSessionData>

// Helper function to render with PWAProvider
const renderWithPWAProvider = (component: React.ReactElement) => {
  return render(<PWAProvider>{component}</PWAProvider>)
}

describe('EditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays error', () => {
    mockSearchParams.get.mockReturnValue('test-session')
    mockUseSessionData.mockReturnValue({
      data: [],
      loading: false,
      error: 'Test error',
      saveData: jest.fn(),
    })

    renderWithPWAProvider(<EditPage />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('displays no session ID error', () => {
    mockSearchParams.get.mockReturnValue(null)
    mockUseSessionData.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      saveData: jest.fn(),
    })

    renderWithPWAProvider(<EditPage />)
    expect(screen.getByText('No session ID provided. Please access this page through the Telegram bot.')).toBeInTheDocument()
  })

  it('renders page structure when data is loaded', () => {
    const mockData = [{ name: 'John', age: 30 }]
    mockSearchParams.get.mockReturnValue('test-session')
    mockUseSessionData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      saveData: jest.fn(),
    })

    renderWithPWAProvider(<EditPage />)

    expect(screen.getByText('Edit Receipt')).toBeInTheDocument()
    expect(screen.getByText('Edit the receipt data and save to send back to Telegram.')).toBeInTheDocument()
    // Note: Table component is mocked, so we don't test its internal rendering
  })
})
