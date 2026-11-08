import { useCallback, useEffect, useRef } from 'react'

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
const MODAL_FLAG = 'bbmModal'

// Klik w zakładkę z otwartego menu przejmuje wpis historii okienka,
// żeby zamknięcie menu nie cofnęło scrolla do miejsca sprzed otwarcia.
let anchorClaimed = false

export function claimOpenModalHistory(hash) {
  const state = history.state && typeof history.state === 'object' ? { ...history.state } : {}
  if (!state[MODAL_FLAG]) {
    history.pushState(state, '', hash)
    return
  }
  delete state[MODAL_FLAG]
  history.replaceState(state, '', hash)
  anchorClaimed = true
}

function placeOf(y) {
  if (anchorClaimed) return
  const root = document.documentElement
  root.style.scrollBehavior = 'auto'
  window.scrollTo({ top: y, left: 0, behavior: 'instant' })
  requestAnimationFrame(() => {
    if (anchorClaimed) {
      root.style.scrollBehavior = ''
      return
    }
    window.scrollTo({ top: y, left: 0, behavior: 'instant' })
    root.style.scrollBehavior = ''
  })
}

/*
 * Na telefonie „cofnij” zamyka okienko zamiast wychodzić ze strony (np. do panelu).
 * Po zamknięciu strona zostaje tam, gdzie była w chwili otwarcia.
 */
export function useDismissOnBack(open, onClose) {
  const pushed = useRef(false)
  const backTimer = useRef(0)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined

    window.clearTimeout(backTimer.current)

    const scrollY = window.scrollY
    const previousRestoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    const body = document.body
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    }
    const lock = window.matchMedia('(max-width: 900px)').matches
    body.style.overflow = 'hidden'
    if (lock) {
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'
    }

    if (!pushed.current) {
      const base = history.state && typeof history.state === 'object' ? history.state : {}
      history.pushState({ ...base, [MODAL_FLAG]: true }, '')
      pushed.current = true
    }

    let restored = false
    const restorePlace = () => {
      if (restored) return
      restored = true
      body.style.overflow = previous.overflow
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.left = previous.left
      body.style.right = previous.right
      body.style.width = previous.width
      history.scrollRestoration = previousRestoration
      placeOf(scrollY)
    }

    const onPop = () => {
      pushed.current = false
      restorePlace()
      onCloseRef.current()
    }
    window.addEventListener('popstate', onPop)

    return () => {
      window.removeEventListener('popstate', onPop)
      const claimed = anchorClaimed
      anchorClaimed = false
      if (claimed) {
        body.style.overflow = previous.overflow
        body.style.position = previous.position
        body.style.top = previous.top
        body.style.left = previous.left
        body.style.right = previous.right
        body.style.width = previous.width
        history.scrollRestoration = previousRestoration
        pushed.current = false
        return
      }
      restorePlace()
      if (!pushed.current) return
      backTimer.current = window.setTimeout(() => {
        if (!pushed.current) return
        pushed.current = false
        const onLand = () => {
          window.removeEventListener('popstate', onLand)
          placeOf(scrollY)
          requestAnimationFrame(() => placeOf(scrollY))
        }
        window.addEventListener('popstate', onLand)
        history.back()
      }, 0)
    }
  }, [open])
}

/*
 * Wspólne zachowanie okien modalnych: Esc zamyka, strona pod spodem się nie przewija,
 * Tab krąży wewnątrz okna, a po zamknięciu fokus wraca tam, gdzie był.
 * Zwraca ref, który trzeba podpiąć pod panel okna.
 */
export default function useModalBehavior(open, onClose) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  useDismissOnBack(open, onClose)

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
    const frame = requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }))

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') trapFocus(event)
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus?.({ preventScroll: true })
    }
  }, [open, onClose, trapFocus])

  return panelRef
}
