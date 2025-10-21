/**
 * TypeScript declarations for Telegram WebApp API
 * @see https://core.telegram.org/bots/webapps
 */

interface TelegramWebApp {
  /**
   * Closes the WebApp
   */
  close(): void

  /**
   * Shows a native popup
   */
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text: string
    }>
  }, callback?: (buttonId: string) => void): void

  /**
   * Shows a confirmation dialog
   */
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void

  /**
   * Shows an alert dialog
   */
  showAlert(message: string, callback?: () => void): void

  /**
   * Returns true if the WebApp is expanded to the maximum height
   */
  isExpanded: boolean

  /**
   * Current height of the WebApp
   */
  viewportHeight: number

  /**
   * Stable height of the WebApp
   */
  viewportStableHeight: number

  /**
   * Expands the WebApp to the maximum available height
   */
  expand(): void

  /**
   * Enables the main button
   */
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText(text: string): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
    setParams(params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }): void
  }

  /**
   * Info about the user who opened the WebApp
   */
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    chat?: {
      id: number
      type: string
      title?: string
      username?: string
    }
    start_param?: string
  }

  /**
   * Color scheme currently used in the Telegram app
   */
  colorScheme: 'light' | 'dark'

  /**
   * Theme parameters
   */
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }

  /**
   * Sends data to the bot
   */
  sendData(data: string): void

  /**
   * Informs Telegram that the WebApp is ready to be displayed
   */
  ready(): void
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
}
