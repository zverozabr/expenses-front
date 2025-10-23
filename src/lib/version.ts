/**
 * Get the current git commit hash (last 3 characters)
 * This is injected at build time via environment variable
 */
export function getAppVersion(): string {
  // Try to get from environment variable (set during build)
  const version = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA

  if (version) {
    // Return last 3 characters
    return version.slice(-3)
  }

  // Fallback for development
  return 'dev'
}
