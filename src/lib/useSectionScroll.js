import { useEffect } from 'react'

/*
 * Przewijanie „sekcja po sekcji” kółkiem myszy / gładzikiem (tylko komputery).
 *
 * Jeden ruch kółkiem przenosi stronę do następnej (lub poprzedniej) sekcji –
 * w to samo miejsce, w które prowadzi klik w menu (uwzględniamy scroll-margin-top).
 * Sekcje wyższe od ekranu (np. portfolio, cennik) przewijają się normalnie do swojego
 * końca, dopiero potem następuje przejście dalej.
 * Telefony i tablety zostają przy zwykłym, dotykowym przewijaniu.
 */

const DESKTOP_MIN_WIDTH = 901
const MIN_GESTURE_DELTA = 24 // tyle „ruchu” trzeba, żeby zmienić sekcję (ignoruje drobne drgnięcia)
const GESTURE_GAP_MS = 140 // przerwa w zdarzeniach koła = koniec gestu (także bezwładności gładzika)
const COOLDOWN_MS = 200 // karencja po zakończeniu przejścia
// Sekcje (id), które po przewinięciu mają stać dokładnie na środku ekranu (pod paskiem górnym).
const CENTERED_SECTIONS = new Set(['proces', 'opinie', 'faq'])
// Wysokie sekcje (id) przewijane krokami zamiast swobodnie: wartość = liczba ruchów kółkiem
// po wejściu na początek sekcji (ostatni ruch kończy się na dole sekcji, potem następna sekcja).
const STEPPED_SECTIONS = new Map([
  ['cennik', 1], // początek → dół
  ['galeria', 2], // początek → środek → dół
])
const EDGE = 2 // tolerancja w px przy porównywaniu pozycji
const TALL_REGION_MIN = 0.25 // sekcja musi wystawać ponad ekran o min. 25% jego wysokości

// Dev: zmiana tego pliku ma przeładować stronę, żeby nie zostały dwa nasłuchiwania koła naraz
// (stara i nowa wersja po hot-reloadzie dawały dodatkowe, „środkowe” zatrzymania).
if (import.meta.hot) import.meta.hot.decline()

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
}

// Lista punktów zatrzymania + „wolnych stref” (wnętrza wysokich sekcji).
function collectStops() {
  const max = maxScroll()
  const vh = window.innerHeight
  const y = window.scrollY
  const stops = []
  const regions = []
  const header = document.querySelector('header')
  const headerHeight = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0

  const items = document.querySelectorAll('main > section, main > .between-quote')
  items.forEach((el) => {
    const rect = el.getBoundingClientRect()
    const top = rect.top + y
    const bottom = rect.bottom + y

    if (el.classList.contains('between-quote')) {
      // krótki cytat zatrzymujemy na środku ekranu
      stops.push(top + rect.height / 2 - vh / 2)
      return
    }

    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
    let start = top - margin
    const end = bottom - vh

    // Niższe sekcje z tej listy ustawiamy pośrodku wolnego miejsca pod paskiem górnym.
    const available = vh - headerHeight
    if (CENTERED_SECTIONS.has(el.id) && rect.height < available) {
      start = top + rect.height / 2 - (vh + headerHeight) / 2
    }

    stops.push(start)
    if (end - start > vh * TALL_REGION_MIN) {
      const steps = STEPPED_SECTIONS.get(el.id)
      if (!steps) regions.push([start, end])
      // kroki pośrednie rozkładamy równo między początkiem a dołem sekcji
      for (let k = 1; k < (steps ?? 1); k += 1) stops.push(start + ((end - start) * k) / steps)
      stops.push(end)
    }
  })

  // dół strony (stopka) jest ostatnim punktem
  stops.push(max)

  const clamped = stops
    .map((value) => Math.min(max, Math.max(0, Math.round(value))))
    .sort((a, b) => a - b)
    .filter((value, index, list) => index === 0 || value - list[index - 1] > EDGE)

  return { stops: clamped, regions }
}

export default function useSectionScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animating = false
    let frame = 0
    let consumed = false // bieżący gest już wywołał przejście
    let accumulated = 0
    let lastEventTime = 0
    let cooldownUntil = 0

    // Płynne przewijanie wewnątrz wysokich sekcji (cennik, portfolio): zamiast skoków
    // co „ząbek” kółka, pozycja dąży gładko do celu.
    let glideActive = false
    let glideTarget = 0
    let glidePos = 0
    let glideFrame = 0
    let glideLast = 0

    const stopGlide = () => {
      glideActive = false
      cancelAnimationFrame(glideFrame)
    }

    const glideStep = (now) => {
      if (!glideActive) return
      // ktoś przewinął inaczej (klawiatura, pasek, menu) – nie walczymy z tym
      if (Math.abs(window.scrollY - glidePos) > 3) {
        stopGlide()
        return
      }

      const dt = Math.min(48, now - glideLast)
      glideLast = now
      glidePos += (glideTarget - glidePos) * (1 - Math.exp(-dt / 85))

      if (Math.abs(glideTarget - glidePos) < 0.5) {
        glidePos = glideTarget
        window.scrollTo({ top: glidePos, behavior: 'instant' })
        glideActive = false
        return
      }

      window.scrollTo({ top: glidePos, behavior: 'instant' })
      glideFrame = requestAnimationFrame(glideStep)
    }

    const glideTo = (target) => {
      glideTarget = target
      if (glideActive) return
      glideActive = true
      glidePos = window.scrollY
      glideLast = performance.now()
      glideFrame = requestAnimationFrame(glideStep)
    }

    const animateTo = (target) => {
      stopGlide()
      const from = window.scrollY
      const distance = Math.abs(target - from)
      if (distance < 1) return

      animating = true
      const duration = Math.min(950, 520 + distance * 0.18)
      const started = performance.now()

      const step = (now) => {
        const progress = Math.min(1, (now - started) / duration)
        window.scrollTo({
          top: from + (target - from) * easeInOutCubic(progress),
          behavior: 'instant',
        })

        if (progress < 1) {
          frame = requestAnimationFrame(step)
        } else {
          animating = false
          cooldownUntil = performance.now() + COOLDOWN_MS
        }
      }

      frame = requestAnimationFrame(step)
    }

    const onWheel = (event) => {
      if (event.ctrlKey || event.shiftKey || event.defaultPrevented) return // zoom, ruch poziomy
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return // przewijanie w poziomie
      if (reducedMotion.matches || window.innerWidth < DESKTOP_MIN_WIDTH) return
      if (document.body.style.overflow === 'hidden') return // otwarte okno (np. rezerwacja)
      if (event.target instanceof Element && event.target.closest('textarea, select, [role="dialog"]')) {
        return
      }

      const now = performance.now()

      // Krótka karencja tuż po przejściu – końcówka obrotu kółkiem nie ma uruchomić kolejnego.
      if (now < cooldownUntil) {
        event.preventDefault()
        consumed = true
        lastEventTime = now
        return
      }

      if (now - lastEventTime > GESTURE_GAP_MS) {
        consumed = false
        accumulated = 0
      }
      lastEventTime = now

      const delta = event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY
      if (!delta) return

      // Trwa animacja albo bezwładność po już wykonanym przejściu – blokujemy, żeby
      // jeden gest nie przeskoczył kilku sekcji.
      if (animating || consumed) {
        event.preventDefault()
        return
      }

      const direction = delta > 0 ? 1 : -1
      const y = window.scrollY
      const { stops, regions } = collectStops()

      // Wnętrze wysokiej sekcji – zwykłe przewijanie, aż do jej krawędzi.
      // Krawędzie liczą się do strefy tylko od strony, z której wchodzimy w głąb sekcji.
      const region = regions.find(([start, end]) =>
        direction > 0 ? y >= start - EDGE && y < end - EDGE : y > start + EDGE && y <= end + EDGE,
      )
      if (region) {
        const base = glideActive ? glideTarget : y
        const predicted = base + delta
        if (predicted > region[0] + EDGE && predicted < region[1] - EDGE) {
          event.preventDefault()
          glideTo(predicted)
          return
        }

        event.preventDefault()
        consumed = true
        animateTo(direction > 0 ? region[1] : region[0])
        return
      }

      // Zbieramy ruch, żeby drobne drgnięcie gładzika nie zmieniało sekcji.
      accumulated += delta
      if (Math.abs(accumulated) < MIN_GESTURE_DELTA) {
        event.preventDefault()
        return
      }

      const target =
        direction > 0
          ? stops.find((value) => value > y + EDGE)
          : [...stops].reverse().find((value) => value < y - EDGE)

      if (target === undefined) return // początek / koniec strony – zostaje natywnie

      event.preventDefault()
      consumed = true
      accumulated = 0
      animateTo(target)
    }

    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(frame)
      stopGlide()
    }
  }, [enabled])
}
