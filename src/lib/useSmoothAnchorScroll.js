import { useEffect } from 'react'

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function scrollTargetTop(el) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  return el.getBoundingClientRect().top + window.scrollY - margin
}

function animateScrollTo(targetY) {
  const from = window.scrollY
  const distance = Math.abs(targetY - from)
  if (distance < 1) return

  const duration = Math.min(1100, 480 + distance * 0.22)
  const started = performance.now()
  let frame = 0

  const step = (now) => {
    const progress = Math.min(1, (now - started) / duration)
    window.scrollTo({
      top: from + (targetY - from) * easeInOutCubic(progress),
      behavior: 'instant',
    })
    if (progress < 1) frame = requestAnimationFrame(step)
  }

  frame = requestAnimationFrame(step)
  return () => cancelAnimationFrame(frame)
}

/** Płynne przewijanie po kliknięciu w link #sekcja (menu, stopka) — bez „skoków” między sekcjami. */
export default function useSmoothAnchorScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const link = event.target.closest('a[href^="#"]')
      if (!link) return

      const hash = link.getAttribute('href')
      if (!hash || hash === '#') return

      const url = new URL(link.href, window.location.href)
      if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
        return
      }

      const id = url.hash.slice(1)
      const target = id ? document.getElementById(id) : null
      const top = id === '' || id === 'home' ? 0 : target ? scrollTargetTop(target) : null
      if (top === null) return

      event.preventDefault()

      if (reducedMotion.matches) {
        window.scrollTo({ top, behavior: 'auto' })
      } else {
        animateScrollTo(top)
      }

      history.pushState(null, '', url.hash || '#')
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [enabled])
}
