import { useSyncExternalStore } from 'react'

// Śledzi media query (np. '(max-width: 900px)'); na serwerze/bez matchMedia zwraca false.
export default function useMediaQuery(query) {
  return useSyncExternalStore(
    (notify) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener('change', notify)
      return () => mql.removeEventListener('change', notify)
    },
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  )
}
