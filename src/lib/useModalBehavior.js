import { useCallback, useEffect, useRef } from 'react'

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/*
 * Wspólne zachowanie okien modalnych: Esc zamyka, strona pod spodem się nie przewija,
 * Tab krąży wewnątrz okna, a po zamknięciu fokus wraca tam, gdzie był.
 * Zwraca ref, który trzeba podpiąć pod panel okna.
 */
export default function useModalBehavior(open, onClose) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  const trapFocus = useCallback((event) => {
    const panel = panelRef.current
    if (!panel) return

    const items = Array.from(panel.querySelectorAll(focusableSelector))
    if (!items.length) return

    const first = items[0]
    const last = items[items.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined

    previouslyFocused.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') trapFocus(event)
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose, trapFocus])

  return panelRef
}
