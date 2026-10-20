import { useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import PackageCard from './PackageCard'
import useModalBehavior from '../lib/useModalBehavior'
import useSwipe from '../lib/useSwipe'
import './BookingModal.scss'
import './PackageModal.scss'

// Okno „Dowiedz się więcej” przy pakiecie – pakiety rezerwuje się telefonicznie.
function PackageModal({ open, pkg, category, onSelect, onClose }) {
  const reduced = useReducedMotion()
  const panelRef = useModalBehavior(open, onClose)
  const duration = reduced ? 0 : 0.3

  // Strzałki: przechodzenie między pakietami tej samej kategorii (po ostatnim wraca pierwszy).
  const list = useMemo(() => category?.packages ?? [], [category])
  const position = pkg ? list.findIndex((item) => item.id === pkg.id) : -1
  const canNavigate = list.length > 1 && position >= 0
  const go = useCallback(
    (delta) => {
      if (!canNavigate) return
      onSelect?.(list[(position + delta + list.length) % list.length], category)
    },
    [canNavigate, list, position, category, onSelect],
  )

  // Na telefonie: przesunięcie palcem w lewo/prawo zmienia pakiet.
  const swipe = useSwipe(canNavigate, go)

  useEffect(() => {
    if (!open || !canNavigate) return undefined
    const onKey = (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.stopPropagation() // strzałki nie mogą przełączać kategorii pod oknem
      go(event.key === 'ArrowLeft' ? -1 : 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, canNavigate, go])

  return (
    <AnimatePresence>
      {open && pkg && (
        <div className="booking" role="presentation">
          <motion.div
            className="booking__backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          />

          <motion.div
            ref={panelRef}
            className="package-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-modal-title"
            tabIndex={-1}
            {...swipe}
            initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.98 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <PackageCard
              pkg={pkg}
              category={category}
              nav={canNavigate ? { go, position, total: list.length } : null}
              onClose={onClose}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PackageModal
