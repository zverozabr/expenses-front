import { FocusEvent } from 'react'

/**
 * Hook that provides a focus handler to select all text in an input
 * Improves UX by allowing users to quickly replace values
 *
 * @example
 * const handleFocus = useSelectOnFocus()
 * <input onFocus={handleFocus} />
 */
export function useSelectOnFocus() {
  return (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.select()
  }
}
