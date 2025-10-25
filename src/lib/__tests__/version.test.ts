import { getAppVersion, APP_VERSION } from '../version'

describe('getAppVersion', () => {
  it('should return the APP_VERSION constant', () => {
    expect(getAppVersion()).toBe(APP_VERSION)
  })

  it('should return a non-empty string', () => {
    expect(getAppVersion()).toBeTruthy()
    expect(typeof getAppVersion()).toBe('string')
  })

  it('should return a consistent value', () => {
    const version1 = getAppVersion()
    const version2 = getAppVersion()
    expect(version1).toBe(version2)
  })
})
