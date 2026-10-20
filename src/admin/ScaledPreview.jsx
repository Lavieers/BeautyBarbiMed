import { useLayoutEffect, useRef, useState } from 'react'
import './ScaledPreview.scss'

// Podgląd okna jest zawsze w prawdziwej wielkości (jak na stronie), a tu tylko pomniejszany
// do szerokości kolumny. Wspólny dla podglądu zabiegu (cennik) i pakietu.
// Z `fit` okno jest dopasowane także do wysokości miejsca, w którym stoi – dzięki temu mieści się
// w całości bez przewijania (miejsce wyznacza rodzic, np. kolumna o stałej wysokości).
export default function ScaledPreview({ children, fit = false }) {
  const wrapRef = useRef(null)
  const innerRef = useRef(null)
  const [box, setBox] = useState({ scale: 0.7, height: 380, left: 0 })

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return undefined

    const measure = () => {
      const byWidth = wrap.clientWidth / inner.offsetWidth
      const byHeight = fit && wrap.clientHeight > 0 ? wrap.clientHeight / inner.offsetHeight : Infinity
      const scale = Math.min(1, byWidth, byHeight)
      const height = inner.offsetHeight * scale
      const left = fit ? Math.max(0, (wrap.clientWidth - inner.offsetWidth * scale) / 2) : 0
      setBox((prev) =>
        Math.abs(prev.scale - scale) < 0.001 &&
        Math.abs(prev.height - height) < 0.5 &&
        Math.abs(prev.left - left) < 0.5
          ? prev
          : { scale, height, left },
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(wrap)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [fit])

  return (
    <div
      ref={wrapRef}
      className={`adm-scaled${fit ? ' adm-scaled--fit' : ''}`}
      style={fit ? undefined : { height: box.height }}
    >
      <div
        ref={innerRef}
        className="adm-scaled__inner"
        style={{ transform: `scale(${box.scale})`, left: fit ? box.left : undefined }}
      >
        {children}
      </div>
    </div>
  )
}
