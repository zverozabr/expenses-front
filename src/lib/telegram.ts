/**
 * Telegram WebApp utilities
 * Provides functions to interact with Telegram Mini App API
 *
 * @see https://core.telegram.org/bots/webapps
 * @see https://docs.telegram-mini-apps.com
 */

/**
 * Check if Telegram WebApp is available
 *
 * @returns true if Telegram WebApp is available, false otherwise
 */
export function isTelegramWebAppAvailable(): boolean {
  return typeof window !== 'undefined' &&
         window.Telegram?.WebApp !== undefined
}

/**
 * Validate if string is a valid UUID format (v4)
 *
 * @param str - String to validate
 * @returns true if valid UUID, false otherwise
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Send session ID to Telegram bot using sendData API
 *
 * This function sends data to the bot and automatically closes the Mini App.
 * According to Telegram documentation:
 * - Maximum data size: 4096 bytes
 * - Only available for Mini Apps launched via Keyboard button
 * - Automatically closes the Mini App after sending
 *
 * @param sessionId - Session ID (UUID format) to send to bot
 * @returns true if data was sent successfully, false otherwise
 *
 * @example
 * ```typescript
 * const success = sendSessionIdToBot('550e8400-e29b-41d4-a716-446655440000')
 * if (success) {
 *   console.log('Session ID sent to bot, Mini App will close')
 * }
 * ```
 *
 * @see https://core.telegram.org/bots/webapps#initializing-mini-apps
 * @see https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/3-x/utils/uncategorized
 */
export function sendSessionIdToBot(sessionId: string | null | undefined): boolean {
  // Validate input
  if (!sessionId || typeof sessionId !== 'string') {
    console.warn('Invalid session ID provided')
    return false
  }

  // Trim whitespace
  const trimmedSessionId = sessionId.trim()

  // Check if empty after trim
  if (!trimmedSessionId) {
    console.warn('Session ID is empty')
    return false
  }

  // Validate UUID format
  if (!isValidUUID(trimmedSessionId)) {
    console.warn('Session ID is not a valid UUID format')
    return false
  }

  // Check if Telegram WebApp is available
  if (!isTelegramWebAppAvailable()) {
    console.warn('Telegram WebApp is not available')
    return false
  }

  try {
    // Prepare data (must be under 4096 bytes)
    const data = JSON.stringify({ session_id: trimmedSessionId })

    // Verify data size
    if (data.length > 4096) {
      console.warn('Data size exceeds 4096 bytes limit')
      return false
    }

    const webApp = window.Telegram!.WebApp!

    // Send data to bot
    // Note: sendData should automatically close the Mini App, but we'll ensure it closes
    webApp.sendData(data)

    console.log('Session ID sent to bot:', trimmedSessionId)

    // Explicitly close the Mini App after sending data
    // This ensures the app closes even if sendData doesn't auto-close
    setTimeout(() => {
      webApp.close()
    }, 100)

    return true
  } catch (error) {
    console.error('Failed to send session ID to bot:', error)
    return false
  }
}
