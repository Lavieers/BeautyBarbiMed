import { motion } from 'motion/react'
import Button from './Button'
import Icon from './Icon'
import { treatmentTitleLines } from '../data/treatmentGuide'
import './BookingModal.scss'
import './PackageModal.scss'

// Cena z cennika: „270 zł” → duża liczba i mały napis PLN, jak w oknie pakietu.
function Price({ value }) {
  const match = String(value ?? '').match(/^\s*(\d+)\s*zł\s*$/i)
  if (!match) return <>{value}</>
  return (
    <>
      {match[1]} <span>PLN</span>
    </>
  )
}

// Wnętrze okna zabiegu: przycisk zamknięcia, zdjęcie i treść. Używa go okno na stronie
// (TreatmentModal) oraz podgląd w panelu admina – dzięki temu oba wyglądają tak samo.
// `still` wyłącza animacje wejścia (podgląd w panelu ma tylko się odświeżać).
// `slots` pozwala panelowi admina podmienić miejsca na pola do pisania.
function TreatmentCard({ name, price, guide, nav, onBook, onClose, still = false, slots = {} }) {
  const lines = treatmentTitleLines(name)
  const fade = still ? false : { opacity: 0 }
  const slide = still ? false : { opacity: 0, y: 6 }

  const defaultSections = [
    { title: 'Dla kogo', text: guide.forWhom },
    { title: 'Efekty', text: guide.effects },
    { title: 'Przeciwwskazania', text: guide.avoid },
  ].filter((block) => block.text)

  return (
    <>
      <button type="button" className="booking__close" onClick={onClose} aria-label="Zamknij">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <div className="package-modal__media">
        <motion.img
          key={guide.image}
          src={guide.image}
          alt=""
          style={{ objectPosition: guide.position }}
          initial={fade}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        />
        {slots.photoTools ?? null}
        {nav ? (
          <div className="package-modal__nav" role="group" aria-label="Przechodzenie między zabiegami">
            <button type="button" onClick={() => nav.go(-1)} aria-label="Poprzedni zabieg">
              <Icon name="chevronLeft" />
            </button>
            <span aria-live="polite">
              {nav.position + 1} / {nav.total}
            </span>
            <button type="button" onClick={() => nav.go(1)} aria-label="Następny zabieg">
              <Icon name="chevronRight" />
            </button>
          </div>
        ) : null}
      </div>

      <motion.div
        className="package-modal__content"
        initial={slide}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="package-modal__body">
          <p className="package-modal__kicker">Opis zabiegu</p>
          <h2 id="treatment-modal-title" className="package-modal__title">
            {slots.title ??
              lines.map((line) => (
                <span key={line} className="package-modal__title-line">
                  {line}
                </span>
              ))}
          </h2>

          {slots.duration ??
            (guide.duration ? (
              <p className="package-modal__duration">
                <Icon name="clock" />
                {guide.duration}
              </p>
            ) : null)}

          {slots.what ?? (guide.what ? <p className="package-modal__what">{guide.what}</p> : null)}

          {slots.sections ?? (
            <div className="package-modal__sections">
              {defaultSections.map(({ title, text }) => (
                <section key={title} className="package-modal__block">
                  <h3 className="package-modal__block-title">{title}</h3>
                  <p className="package-modal__block-text">{text}</p>
                </section>
              ))}
            </div>
          )}
        </div>

        {slots.note ??
          (guide.note ? (
            <p className="package-modal__important">
              <strong>Ważne</strong>
              {guide.note}
            </p>
          ) : null)}

        <footer className="package-modal__footer">
          <div className="package-modal__price">
            <p className="package-modal__price-main">
              {slots.price ? (
                <>
                  {slots.price} <span>PLN</span>
                </>
              ) : (
                <Price value={price} />
              )}
            </p>
          </div>

          <div className="package-modal__contact">
            <Button variant="booking" block className="package-modal__call" onClick={onBook}>
              <Icon name="calendar" />
              Umów wizytę
            </Button>
          </div>
        </footer>
      </motion.div>
    </>
  )
}

export default TreatmentCard
