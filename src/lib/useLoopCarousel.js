import { useCallback, useEffect, useRef, useState } from 'react'

const AUTO_MS = 4500 // odstęp między automatycznymi przesunięciami
const PAUSE_MS = 9000 // po dotyku/przewinięciu przez użytkownika automat czeka
const SETTLE_MS = 140 // tyle ciszy bez przewijania oznacza, że karuzela się zatrzymała

function mod(value, count) {
  return ((value % count) + count) % count
}

// Trzy kopie kart i niezauważalny skok do środkowej — przewijanie palcem nie ma końca.
// `initialItem` liczy się tylko przy pierwszym rysowaniu; później skacze `goTo`.
export default function useLoopCarousel(count, autoPlay, initialItem = 0) {
  const loop = count > 1
  const copies = loop ? 3 : 1
  const base = loop ? count : 0 // indeks pierwszej karty w środkowej kopii
  const initialItemRef = useRef(initialItem)
  const startItem = count > 0 ? mod(initialItemRef.current, count) : 0
  const startIndex = base + startItem

  const trackRef = useRef(null)
  const cardRefs = useRef([])
  const [active, setActive] = useState(startIndex)
  const activeRef = useRef(startIndex)
  const pausedUntil = useRef(0)
  const inView = useRef(true)
  const touching = useRef(false)
  const frame = useRef(0)
  const settleTimer = useRef(0)

  const scrollToIndex = useCallback((index, behavior = 'smooth') => {
    const track = trackRef.current
    const card = cardRefs.current[index]
    if (!track || !card) return
    const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2
    track.scrollTo({ left, behavior })
  }, [])

  // Aktywna karta = ta, której środek jest najbliżej środka widoku.
  const syncActive = useCallback(() => {
    frame.current = 0
    const track = trackRef.current
    if (!track) return
    const center = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestDistance = Infinity
    cardRefs.current.forEach((card, index) => {
      if (!card) return
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center)
      if (distance < bestDistance) {
        bestDistance = distance
        best = index
      }
    })
    activeRef.current = best
    setActive(best)
  }, [])

  // Po zatrzymaniu przeskakujemy (niezauważalnie) do tej samej karty w środkowej kopii.
  const recenterRef = useRef(() => {})
  const recenter = useCallback(() => {
    if (!loop) return
    if (touching.current) {
      settleTimer.current = window.setTimeout(() => recenterRef.current(), SETTLE_MS)
      return
    }
    const index = activeRef.current
    if (index >= count && index < count * 2) return
    scrollToIndex((index % count) + count, 'instant')
    syncActive()
  }, [loop, count, scrollToIndex, syncActive])

  useEffect(() => {
    recenterRef.current = recenter
  }, [recenter])

  const pause = useCallback(() => {
    pausedUntil.current = Date.now() + PAUSE_MS
  }, [])

  const onScroll = () => {
    if (!frame.current) frame.current = requestAnimationFrame(syncActive)
    clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(recenter, SETTLE_MS)
  }

  const onTouchStart = () => {
    touching.current = true
    pause()
  }

  const onTouchEnd = () => {
    touching.current = false
    pause()
  }

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.stopPropagation() // strzałki nie mogą przełączać kategorii obok
    pause()
    scrollToIndex(activeRef.current + (event.key === 'ArrowRight' ? 1 : -1))
  }

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      clearTimeout(settleTimer.current)
    },
    [],
  )

  // Automatyczne przesuwanie – tylko gdy karuzela jest widoczna, nikt jej nie dotyka,
  // a użytkownik nie wyłączył animacji w systemie.
  useEffect(() => {
    const track = trackRef.current
    if (!track || !autoPlay || !loop) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting
      },
      { threshold: 0.4 },
    )
    observer.observe(track)

    const timer = setInterval(() => {
      if (document.hidden || !inView.current || Date.now() < pausedUntil.current) return
      scrollToIndex(activeRef.current + 1)
    }, AUTO_MS)

    return () => {
      observer.disconnect()
      clearInterval(timer)
    }
  }, [autoPlay, loop, scrollToIndex])

  useEffect(() => {
    const item = count > 0 ? mod(initialItemRef.current, count) : 0
    scrollToIndex(base + item, 'instant')
    syncActive()
  }, [base, count, scrollToIndex, syncActive])

  const goTo = (index) => {
    pause()
    scrollToIndex(index + base)
  }

  const reset = useCallback(() => {
    scrollToIndex(base, 'instant')
    syncActive()
  }, [base, scrollToIndex, syncActive])

  const focusCard = (index) => {
    pause()
    scrollToIndex(index)
  }

  return {
    loop,
    copies,
    trackRef,
    cardRefs,
    active,
    activeItem: count ? ((active % count) + count) % count : 0,
    goTo,
    focusCard,
    reset,
    trackProps: {
      onScroll,
      onTouchStart,
      onTouchEnd,
      onTouchCancel: onTouchEnd,
      onPointerDown: pause,
      onWheel: pause,
      onKeyDown,
    },
  }
}
