/**
 * Telegram WebApp API constants
 * Based on official Telegram documentation
 * @see https://core.telegram.org/bots/webapps
 */

/**
 * Maximum data size that can be sent via sendData() method
 * According to Telegram documentation, the limit is 4096 bytes
 */
export const TELEGRAM_DATA_SIZE_LIMIT = 4096 // bytes

/**
 * Delay before closing the Mini App after sending data
 * Ensures sendData() completes before the app closes
 */
export const TELEGRAM_CLOSE_DELAY = 100 // milliseconds
