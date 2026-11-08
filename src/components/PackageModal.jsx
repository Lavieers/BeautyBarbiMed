import { useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import PackageCard from './PackageCard'
import useModalBehavior from '../lib/useModalBehavior'
import useSwipe from '../lib/useSwipe'
import './PackageModal.scss'

function tabLabelFor(category) {
  if (category?.tabLabel) return category.tabLabel.replace(/^mezoterapii$/i, 'MEZOTERAPIA')
  const fromTitle = String(category?.title ?? '').replace(/^PAKIET(Y)? /i, '').trim()
  return fromTitle || 'Pakiet zabiegowy'
}

// Okno „Dowiedz się więcej” przy pakiecie – pakiety rezerwuje się telefonicznie.
// Strzałki i gest idą przez wszystkie zakładki: po ostatnim pakiecie jednej wchodzi pierwsza z następnej.
function PackageModal({ open, pkg, category, categories = [], onSelect, onClose }) {
  const reduced = useReducedMotion()
  const panelRef = useModalBehavior(open, onClose)
  const duration = reduced ? 0 : 0.3

  const sequence = useMemo(() => {
    const source = categories.length > 0 ? categories : category ? [category] : []
    return source.flatMap((item) =>
      (item.packages ?? []).map((entry) => ({ pkg: entry, category: item })),
    )
  }, [categories, category])
  const position = pkg ? sequence.findIndex((item) => item.pkg.id === pkg.id) : -1
  const current = position >= 0 ? sequence[position] : null
  const siblings = current?.category?.packages ?? category?.packages ?? []
  const localPosition = current ? siblings.findIndex((item) => item.id === current.pkg.id) : -1
  const canNavigate = sequence.length > 1 && position >= 0
  const go = useCallback(
    (delta) => {
      if (!canNavigate) return
      const next = sequence[(position + delta + sequence.length) % sequence.length]
      onSelect?.(next.pkg, next.category)
    },
    [canNavigate, sequence, position, onSelect],
  )

  // Na telefonie: przesunięcie palcem w lewo/prawo zmienia pakiet.
  const swipe = useSwipe(canNavigate, go)

  useEffect(() => {
    if (!open || !canNavigate) return undefined
    const onKey = (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.stopPropagation() // okno samo zmienia zakładkę; strzałka nie może jej przesunąć drugi raz
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
              category={current?.category ?? category}
              kicker={tabLabelFor(current?.category ?? category)}
              nav={
                canNavigate
                  ? {
                      go,
                      position: localPosition >= 0 ? localPosition : 0,
                      total: Math.max(siblings.length, 1),
                    }
                  : null
              }
              onClose={onClose}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PackageModal
