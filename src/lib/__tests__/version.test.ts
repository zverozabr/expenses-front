import { getAppVersion } from '../version'

describe('getAppVersion', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return last 3 characters of NEXT_PUBLIC_GIT_COMMIT_SHA', () => {
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA = '8e55fc6a1b2c3d4e5f6g7h8i9j0k'
    expect(getAppVersion()).toBe('j0k')
  })

  it('should return last 3 characters of VERCEL_GIT_COMMIT_SHA if NEXT_PUBLIC not set', () => {
    delete process.env.NEXT_PUBLIC_GIT_COMMIT_SHA
    process.env.VERCEL_GIT_COMMIT_SHA = 'abcdef123456789'
    expect(getAppVersion()).toBe('789')
  })

  it('should return "dev" if no environment variable is set', () => {
    delete process.env.NEXT_PUBLIC_GIT_COMMIT_SHA
    delete process.env.VERCEL_GIT_COMMIT_SHA
    expect(getAppVersion()).toBe('dev')
  })

  it('should handle short commit hashes', () => {
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA = 'abc'
    expect(getAppVersion()).toBe('abc')
  })

  it('should handle very short commit hashes', () => {
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA = 'ab'
    expect(getAppVersion()).toBe('ab')
  })

  it('should prefer NEXT_PUBLIC over VERCEL variable', () => {
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA = 'public123'
    process.env.VERCEL_GIT_COMMIT_SHA = 'vercel456'
    expect(getAppVersion()).toBe('123')
  })
})
