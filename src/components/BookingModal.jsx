import { useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Button from './Button'
import Icon from './Icon'
import { useContactInfo, useSection } from '../content/context'
import { parseHoursLine } from '../lib/hours'
import useModalBehavior from '../lib/useModalBehavior'
import './BookingModal.scss'

function BookingModal({ open, onClose }) {
  const reduced = useReducedMotion()
  const content = useSection('booking')
  const contactData = useContactInfo()
  const hours = useMemo(
    () => (Array.isArray(contactData.hours) ? contactData.hours : []).filter(Boolean).map(parseHoursLine),
    [contactData.hours],
  )
  const panelRef = useModalBehavior(open, onClose)

  const duration = reduced ? 0 : 0.3

  return (
    <AnimatePresence>
      {open && (
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
            className="booking__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.98 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <button type="button" className="booking__close" onClick={onClose} aria-label="Zamknij">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>

            <span className="booking__ornament" aria-hidden="true" />
            <p className="booking__kicker">{content.kicker}</p>
            <h2 id="booking-title" className="booking__title">
              {content.title}
            </h2>
            <p className="booking__text">{content.text}</p>

            {contactData.booksy && (
              <Button
                variant="cta-accent"
                block
                href={contactData.booksy}
                external
                className="booking__online"
              >
                Zarezerwuj online
              </Button>
            )}

            <ul className="booking__options">
              <li>
                <a href={contactData.phoneHref} className="booking__option">
                  <span className="booking__option-icon">
                    <Icon name="phone" />
                  </span>
                  <span className="booking__option-body">
                    <span className="booking__option-label">Zadzwoń</span>
                    <span className="booking__option-value booking__option-value--phone">
                      {contactData.phone}
                    </span>
                  </span>
                  <span className="booking__arrow" aria-hidden="true" />
                </a>
              </li>
            </ul>

            <div className="booking__hours">
              <p className="booking__hours-title">
                <span className="booking__hours-icon">
                  <Icon name="clock" />
                </span>
                Godziny otwarcia
              </p>
              {hours.length > 0 && (
                <dl className="booking__hours-list">
                  {hours.map(({ days, time, closed }, index) => (
                    <div
                      key={`${days}-${index}`}
                      className={`booking__hours-row${closed ? ' booking__hours-row--closed' : ''}`}
                    >
                      <dt>{days}</dt>
                      {time && <dd>{time}</dd>}
                    </div>
                  ))}
                </dl>
              )}
              {content.note && <p className="booking__note">{content.note}</p>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default BookingModal
