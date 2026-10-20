import { useRef } from 'react'

const MIN_DISTANCE = 50 // px
const DOMINANCE = 1.5 // ruch musi być wyraźnie bardziej poziomy niż pionowy

// Przesunięcie palcem w lewo/prawo: `onSwipe(1)` – w lewo (następny), `onSwipe(-1)` – w prawo
// (poprzedni). Liczą się tylko wyraźnie poziome ruchy, więc pionowe przewijanie działa jak dotąd.
// Zwraca propsy do rozpięcia na elemencie.
export default function useSwipe(enabled, onSwipe) {
  const start = useRef(null)

  const onTouchStart = (event) => {
    if (!enabled || event.touches.length !== 1) {
      start.current = null
      return
    }
    const { clientX, clientY } = event.touches[0]
    start.current = { x: clientX, y: clientY }
  }

  const onTouchEnd = (event) => {
    const origin = start.current
    start.current = null
    if (!origin || !enabled) return
    const { clientX, clientY } = event.changedTouches[0]
    const dx = clientX - origin.x
    const dy = clientY - origin.y
    if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * DOMINANCE) return
    onSwipe(dx < 0 ? 1 : -1)
  }

  return { onTouchStart, onTouchEnd }
}
