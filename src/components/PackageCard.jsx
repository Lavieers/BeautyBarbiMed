import { motion } from 'motion/react'
import Button from './Button'
import Icon from './Icon'
import { useContactInfo } from '../content/context'
import { packageTitleLines } from '../data/packageStories'
import { packagePhoto } from '../data/packageImages'
import { resolveLead, resolveSteps } from '../lib/packageDetails'
import './BookingModal.scss'
import './PackageModal.scss'

// Lista kroków – ta sama oś z punktami co w sekcji „Standard wizyty”.
function Steps({ pkgId, steps }) {
  return (
    <ol className="package-modal__flow">
      {steps.map(({ title, text }, index) => (
        <li
          key={`${pkgId}-${index}`}
          className={`package-modal__step${index === steps.length - 1 ? ' package-modal__step--last' : ''}`}
        >
          <span className="package-modal__marker" aria-hidden="true" />
          <div className="package-modal__step-body">
            <h3 className="package-modal__step-title">{title}</h3>
            {text ? <p className="package-modal__step-text">{text}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

const hasValue = (value) => value != null && value !== ''

// Wnętrze okna pakietu: przycisk zamknięcia, zdjęcie i treść. Używa go okno na stronie
// (PackageModal) oraz podgląd w panelu admina – dzięki temu oba wyglądają tak samo.
// `still` wyłącza animacje wejścia (podgląd w panelu ma tylko się odświeżać).
// `slots` pozwala panelowi admina podmienić wybrane miejsca na pola do pisania
// (title, lead, steps, price, priceInfo, photoTools) – bez zmiany układu okna.
function PackageCard({ pkg, category, nav, onClose, still = false, slots = {} }) {
  const contactData = useContactInfo()

  const lead = resolveLead(pkg)
  const steps = resolveSteps(pkg)
  const photo = packagePhoto(pkg, category)
  const note = category?.footnote
  const fade = still ? false : { opacity: 0 }
  const slide = still ? false : { opacity: 0, y: 6 }

  return (
    <>
      <button type="button" className="booking__close" onClick={onClose} aria-label="Zamknij">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <div className="package-modal__media">
        <motion.img
          key={photo.src}
          src={photo.src}
          alt=""
          style={{ objectPosition: photo.position }}
          initial={fade}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        />
        {slots.photoTools ?? null}
        {nav ? (
          <div className="package-modal__nav" role="group" aria-label="Przechodzenie między pakietami">
            <button type="button" onClick={() => nav.go(-1)} aria-label="Poprzedni pakiet">
              <Icon name="chevronLeft" />
            </button>
            <span aria-live="polite">
              {nav.position + 1} / {nav.total}
            </span>
            <button type="button" onClick={() => nav.go(1)} aria-label="Następny pakiet">
              <Icon name="chevronRight" />
            </button>
          </div>
        ) : null}
      </div>

      <motion.div
        key={pkg.id}
        className="package-modal__content"
        initial={slide}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="package-modal__body">
          <p className="package-modal__kicker">Pakiet zabiegowy</p>
          <h2 id="package-modal-title" className="package-modal__title">
            {slots.title ??
              packageTitleLines(pkg.name).map((line) => (
                <span key={line} className="package-modal__title-line">
                  {line}
                </span>
              ))}
          </h2>
          {slots.lead ? (
            <p className="package-modal__lead">{slots.lead}</p>
          ) : lead ? (
            <p className="package-modal__lead">{lead}</p>
          ) : null}

          {slots.steps ?? (steps.length ? <Steps pkgId={pkg.id} steps={steps} /> : null)}
        </div>

        <footer className="package-modal__footer">
          <div className="package-modal__price">
            <p className="package-modal__price-main">
              {slots.price ?? pkg.price} <span>PLN</span>
            </p>
            {slots.priceInfo ? (
              <p className="package-modal__price-info">{slots.priceInfo}</p>
            ) : hasValue(pkg.was) || hasValue(pkg.save) ? (
              <p className="package-modal__price-info">
                {hasValue(pkg.was) ? <s>{pkg.was} PLN</s> : null}
                {hasValue(pkg.save) ? (
                  <span className="package-modal__save">-{pkg.save} PLN</span>
                ) : null}
              </p>
            ) : null}
          </div>

          <div className="package-modal__contact">
            <Button
              variant="booking"
              block
              href={contactData.phoneHref}
              className="package-modal__call"
            >
              <Icon name="phone" />
              {contactData.phone}
            </Button>
          </div>

          <div className="package-modal__notes">
            {note ? <p>{note.replace(/\.\s*$/, '')}</p> : null}
            <p>Zadzwoń, a ustalimy termin</p>
          </div>
        </footer>
      </motion.div>
    </>
  )
}

export default PackageCard
