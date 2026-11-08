import { useEffect } from 'react'
import { claimOpenModalHistory } from './useModalBehavior'

const MOBILE_QUERY = '(max-width: 900px)'
// Na telefonie te dwie sekcje mają stanąć na środku ekranu, nie na swoim początku.
const CENTER_ON_MOBILE = new Set(['oferta', 'galeria'])

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function isMobile() {
  return window.matchMedia(MOBILE_QUERY).matches
}

function cssPx(value) {
  const probe = document.createElement('div')
  probe.style.cssText = `position:fixed;left:0;top:0;height:${value};width:0;pointer-events:none;visibility:hidden`
  document.documentElement.appendChild(probe)
  const height = probe.getBoundingClientRect().height
  probe.remove()
  return height
}

// Menu na telefonie blokuje body (position: fixed). scrollY jest wtedy 0,
// a prawdziwa pozycja siedzi w ujemnym top — trzeba ją odczytać i zdjąć blokadę,
// zanim policzymy cel zjazdu.
function releaseScrollLock() {
  const body = document.body
  if (body.style.position !== 'fixed') return window.scrollY
  const y = Math.abs(parseFloat(body.style.top) || 0)
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.overflow = ''
  const root = document.documentElement
  const previous = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo({ top: y, left: 0, behavior: 'instant' })
  root.style.scrollBehavior = previous
  return y
}

function scrollAnchor() {
  const vv = window.visualViewport
  if (vv && Math.abs(vv.pageTop - window.scrollY) > 0.5) return vv.pageTop
  return window.scrollY
}

function visibleHeight() {
  return window.visualViewport?.height ?? window.innerHeight
}

/**
 * O ile wyższe jest teraz okno od małego viewportu (dolny pasek przeglądarki widoczny).
 * Przy widocznym pasku zwraca 0 i początek sekcji zostaje tam, gdzie był.
 */
function hiddenBarGap() {
  if (!isMobile()) return 0
  const visual = visibleHeight()
  const small = cssPx('100svh')
  const offset = window.visualViewport?.offsetTop ?? 0
  const grown = Math.round(visual - small)
  const shifted = Math.round(offset)
  // Drobny szum (1px) nie może ruszyć lądowania, które przy widocznym pasku jest już dobre.
  if (grown <= 1 && shifted <= 1) return 0
  return Math.max(0, grown, shifted)
}

function clampScroll(y) {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  return Math.min(max, Math.max(0, y))
}

function sectionStartY(el) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  return el.getBoundingClientRect().top + scrollAnchor() - margin
}

function settledNavbarBottom() {
  const root = getComputedStyle(document.documentElement)
  const notice = cssPx(root.getPropertyValue('--notice-height').trim() || '0px')
  const bar = cssPx(root.getPropertyValue('--navbar-main-height-compact').trim() || '4rem')
  return notice + bar
}

function sectionCenterY(el) {
  // Środek sekcji na środku widocznego ekranu, pod zwiniętym navbarem.
  // scrollTo ustawia scrollY, więc cel liczymy od scrollY (pageTop potrafi
  // rozjechać się z nim o wysokość paska przeglądarki i zepchnąć sekcję).
  const headerBottom = settledNavbarBottom()
  const rect = el.getBoundingClientRect()
  const screen = visibleHeight()
  return window.scrollY + rect.top + rect.height / 2 - (screen + headerBottom) / 2
}

function targetFor(el, id) {
  if (isMobile() && CENTER_ON_MOBILE.has(id)) return clampScroll(sectionCenterY(el))

  let y = sectionStartY(el)
  // Pasek ukryty: to samo wyliczenie mija początek sekcji o różnicę wysokości
  // (małe okno z paskiem vs duże bez paska). Cofamy zjazd o tę różnicę,
  // żeby początek został pod navbarem tak jak przy widocznym pasku.
  if (isMobile()) y -= hiddenBarGap()
  return clampScroll(y)
}

let cancelScroll = null
let stopPin = null

function scrollInstant(y) {
  const root = document.documentElement
  const previous = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo({ top: y, left: 0, behavior: 'instant' })
  root.style.scrollBehavior = previous
}

// Po kliknięciu pasek przeglądarki chowa się z opóźnieniem i ekran rośnie.
// Bez tej korekty sekcja zostaje wyśrodkowana na małym oknie i na dużym
// wisi pod navbarem albo ucina się na dole.
function pinSectionCenter(el) {
  stopPin?.()
  const vv = window.visualViewport
  let stopped = false
  let placing = false

  const place = () => {
    if (stopped || placing) return
    const y = clampScroll(sectionCenterY(el))
    if (Math.abs(window.scrollY - y) <= 1) return
    // Duży skok to już ruch użytkownika, nie doganianie paska.
    if (Math.abs(window.scrollY - y) > 220) {
      stop()
      return
    }
    placing = true
    scrollInstant(y)
    placing = false
  }

  const stop = () => {
    if (stopped) return
    stopped = true
    vv?.removeEventListener('resize', place)
    window.removeEventListener('touchstart', stop, true)
    window.removeEventListener('wheel', stop, true)
    if (stopPin === stop) stopPin = null
  }

  vv?.addEventListener('resize', place)
  window.addEventListener('touchstart', stop, { capture: true, passive: true })
  window.addEventListener('wheel', stop, { capture: true, passive: true })
  const timers = [60, 180, 400, 700, 1100].map((ms) => window.setTimeout(place, ms))
  const end = window.setTimeout(stop, 1300)
  stopPin = () => {
    timers.forEach((id) => window.clearTimeout(id))
    window.clearTimeout(end)
    stop()
  }
}

function animateScrollTo(resolveTarget, onDone) {
  cancelScroll?.()
  stopPin?.()
  const targetAt = typeof resolveTarget === 'function' ? resolveTarget : () => resolveTarget
  const root = document.documentElement
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'

  const from = window.scrollY
  const initial = targetAt()
  const distance = Math.abs(initial - from)
  const finish = () => {
    scrollInstant(targetAt())
    root.style.scrollBehavior = previousBehavior
    cancelScroll = null
    onDone?.()
  }
  if (distance < 1) {
    finish()
    return
  }

  const duration = Math.min(1100, 480 + distance * 0.22)
  const started = performance.now()
  let frame = 0

  const step = (now) => {
    const progress = Math.min(1, (now - started) / duration)
    const to = targetAt()
    window.scrollTo({
      top: from + (to - from) * easeInOutCubic(progress),
      behavior: 'instant',
    })
    if (progress < 1) frame = requestAnimationFrame(step)
    else finish()
  }

  frame = requestAnimationFrame(step)
  cancelScroll = () => {
    cancelAnimationFrame(frame)
    root.style.scrollBehavior = previousBehavior
    cancelScroll = null
  }
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
      if (id !== '' && id !== 'home' && !target) return

      event.preventDefault()
      releaseScrollLock()

      const centerOnScreen = Boolean(target) && isMobile() && CENTER_ON_MOBILE.has(id)
      const resolveTop = () => (id === '' || id === 'home' ? 0 : targetFor(target, id))
      const pin = () => {
        if (centerOnScreen) pinSectionCenter(target)
      }
      if (reducedMotion.matches) {
        cancelScroll?.()
        stopPin?.()
        scrollInstant(resolveTop())
        pin()
      } else {
        animateScrollTo(resolveTop, pin)
      }

      // Fokus zostaje na linku w chowanym menu. Po zwinięciu szuflady przeglądarka
      // potrafi dociągnąć stronę do tego linku albo do początku sekcji.
      if (isMobile()) link.blur()

      claimOpenModalHistory(url.hash || '#')
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [enabled])
}
