/**
 * TypeScript definitions for Telegram WebApp API
 * @see https://core.telegram.org/bots/webapps
 */

interface TelegramWebApp {
  /**
   * A method that informs the Telegram app that the Web App is ready to be displayed.
   */
  ready(): void

  /**
   * A method that closes the Web App.
   */
  close(): void

  /**
   * A method that expands the Web App to the maximum available height.
   */
  expand(): void

  /**
   * Current version of the Web App.
   */
  version: string

  /**
   * The platform on which the Web App is opened.
   */
  platform: string

  /**
   * True if the Web App is expanded to the maximum available height.
   */
  isExpanded: boolean

  /**
   * The current height of the visible area of the Web App.
   */
  viewportHeight: number

  /**
   * The height of the visible area of the Web App in its last stable state.
   */
  viewportStableHeight: number

  /**
   * Current color scheme used in the Telegram app.
   */
  colorScheme: 'light' | 'dark'

  /**
   * An object containing the current theme settings used in the Telegram app.
   */
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }

  /**
   * True if the Web App is opened in the inline mode.
   */
  isInlineMode?: boolean

  /**
   * An object for controlling the main button.
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
   * An object for controlling the back button.
   */
  BackButton: {
    isVisible: boolean
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    show(): void
    hide(): void
  }

  /**
   * An object containing data that is transferred to the Web App when it is opened.
   */
  initData: string

  /**
   * An object with input data transferred to the Web App.
   */
  initDataUnsafe: {
    query_id?: string
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      is_premium?: boolean
    }
    receiver?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      is_premium?: boolean
    }
    chat?: {
      id: number
      type: string
      title: string
      username?: string
      photo_url?: string
    }
    start_param?: string
    can_send_after?: number
    auth_date: number
    hash: string
  }

  /**
   * A method that shows a native popup.
   */
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void): void

  /**
   * A method that shows a native alert.
   */
  showAlert(message: string, callback?: () => void): void

  /**
   * A method that shows a native confirm dialog.
   */
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void

  /**
   * A method that sends data to the bot.
   */
  sendData(data: string): void

  /**
   * A method that opens a link in an external browser.
   */
  openLink(url: string): void

  /**
   * A method that opens a Telegram link inside the Telegram app.
   */
  openTelegramLink(url: string): void

  /**
   * A method that requests access to the user's phone number.
   */
  requestContact(callback: (granted: boolean) => void): void

  /**
   * A method that enables the confirmation dialog when the user tries to close the Web App.
   */
  enableClosingConfirmation(): void

  /**
   * A method that disables the confirmation dialog when the user tries to close the Web App.
   */
  disableClosingConfirmation(): void
}

interface Telegram {
  WebApp: TelegramWebApp
}

interface Window {
  Telegram?: Telegram
}
