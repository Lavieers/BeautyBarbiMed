import { useCallback, useEffect, useRef, useState } from 'react'

const AUTO_MS = 4500 // odstęp między automatycznymi przesunięciami
const PAUSE_MS = 9000 // po dotyku/przewinięciu przez użytkownika automat czeka
const SETTLE_MS = 140 // tyle ciszy bez przewijania oznacza, że karuzela się zatrzymała

// Logika zapętlonej karuzeli przewijanej palcem (scroll-snap): elementy występują w trzech
// kopiach, a po zatrzymaniu wracamy do tej samej karty w środkowej kopii, więc nie ma końca.
// Wspólna dla karuzeli pakietów i portfolio.
//
// Użycie: `trackRef` na liście (`ul`), `cardRefs.current[copy * count + i]` na kartach,
// `trackProps` rozpięte na liście, `goTo(i)` dla kropek.
export default function useLoopCarousel(count, autoPlay) {
  const loop = count > 1
  const copies = loop ? 3 : 1
  const base = loop ? count : 0 // indeks pierwszej karty w środkowej kopii

  const trackRef = useRef(null)
  const cardRefs = useRef([])
  const [active, setActive] = useState(base)
  const activeRef = useRef(base)
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

  // Start na pierwszej karcie środkowej kopii – bez animacji.
  useEffect(() => {
    scrollToIndex(base, 'instant')
    syncActive()
  }, [base, scrollToIndex, syncActive])

  const goTo = (index) => {
    pause()
    scrollToIndex(index + base)
  }

  // Powrót na pierwszą kartę środkowej kopii (bez animacji) – np. po zmianie szerokości okna.
  const reset = useCallback(() => {
    scrollToIndex(base, 'instant')
    syncActive()
  }, [base, scrollToIndex, syncActive])

  // Wyśrodkowuje konkretną kartę (np. po kliknięciu sąsiedniej, wystającej z boku).
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
