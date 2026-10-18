import { useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import TreatmentCard from './TreatmentCard'
import useModalBehavior from '../lib/useModalBehavior'
import { useSection } from '../content/context'
import { guideFor, rowKey } from '../data/treatmentGuide'
import './BookingModal.scss'
import './PackageModal.scss'

// Okno „Dowiedz się więcej” przy zabiegu – ten sam wygląd co okno pakietu.
// `ids` to lista zabiegów (klucze z `rowKey`), po których można przechodzić strzałkami.
function TreatmentModal({ open, ids, currentId, onSelect, onBook, onClose }) {
  const reduced = useReducedMotion()
  const pricing = useSection('pricing')
  const panelRef = useModalBehavior(open, onClose)
  const duration = reduced ? 0 : 0.3

  // Nazwa, cena i opis zawsze z cennika – wiersz bez opisu albo usunięty z cennika pomijamy.
  const entries = useMemo(() => {
    const map = {}
    for (const group of pricing.groups ?? []) {
      for (const row of group.rows ?? []) {
        const guide = guideFor(row)
        if (guide) map[rowKey(row)] = { row, guide }
      }
    }
    return map
  }, [pricing])

  const list = useMemo(() => (ids ?? []).filter((id) => entries[id]), [ids, entries])

  const entry = currentId ? entries[currentId] : null
  const position = list.indexOf(currentId)
  const canNavigate = list.length > 1 && position >= 0

  const go = useCallback(
    (delta) => {
      if (!canNavigate) return
      onSelect?.(list[(position + delta + list.length) % list.length])
    },
    [canNavigate, list, position, onSelect],
  )

  useEffect(() => {
    if (!open || !canNavigate) return undefined
    const onKey = (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.stopPropagation()
      go(event.key === 'ArrowLeft' ? -1 : 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, canNavigate, go])

  return (
    <AnimatePresence>
      {open && entry && (
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
            className="package-modal package-modal--treatment"
            role="dialog"
            aria-modal="true"
            aria-labelledby="treatment-modal-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.98 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <TreatmentCard
              key={currentId}
              name={entry.row.name}
              price={entry.row.price}
              guide={entry.guide}
              nav={canNavigate ? { position, total: list.length, go } : null}
              onBook={onBook}
              onClose={onClose}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default TreatmentModal
