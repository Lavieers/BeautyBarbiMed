import { useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Button from './Button'
import Icon from './Icon'
import { useContactInfo } from '../content/context'
import useModalBehavior from '../lib/useModalBehavior'
import { describeTreatment } from '../data/treatmentInfo'
import { packageStories, packageTitleLines } from '../data/packageStories'
import maskImage from '../assets/guide-maska.webp'
import mezoImage from '../assets/mezo.webp'
import mezoMikroImage from '../assets/mezo-mikro.webp'
import mezoIglaImage from '../assets/mezo-igla.webp'
import mezoBezIglaImage from '../assets/mezo-bezigla.webp'
import pediKlasycznyImage from '../assets/pedi-klasyczny.webp'
import pediSpaImage from '../assets/pedi-spa.webp'
import pediLuksusImage from '../assets/pedi-luksus.webp'
import lashesImage from '../assets/rzesy-naturalne.webp'
import cabinetImage from '../assets/gabinet-wnetrze.webp'
import okazjaImage from '../assets/okazja-tulipany.webp'
import urodaImage from '../assets/uroda-4-tygodnie.webp'
import './BookingModal.scss'
import './PackageModal.scss'

// Zdjęcie u góry zależy od kategorii pakietu; pozostałe dostają wnętrze gabinetu.
const categoryImages = {
  twarz: maskImage,
  mezoterapia: mezoImage,
  'rzesy-brwi': lashesImage,
}

// Pakiety mezoterapii mają własne zdjęcia: każdy rodzaj zabiegu pokazujemy na właściwym ujęciu.
const packageImages = {
  'mezo-mikro-3': { src: mezoMikroImage, position: '62% 50%' },
  'mezo-iglowa-3': { src: mezoIglaImage, position: '58% 30%' },
  'mezo-beziglowa-3': { src: mezoBezIglaImage, position: '55% 40%' },
  // pakiety na stopy (środkowy: ciepłe, brązowe zdjęcie z kąpielą z płatkami róż)
  'klasyczny-relaks': { src: pediKlasycznyImage, position: '40% 55%' },
  'spa-nawilzenie': { src: pediSpaImage, position: '45% 68%' },
  'luksusowe-spa': { src: pediLuksusImage, position: '42% 50%' },
  // pakiety „Na specjalną okazję”
  'perfect-day': { src: okazjaImage, position: '50% 62%' },
  'panny-mlodej': { src: okazjaImage, position: '50% 62%' },
  // pakiet „Uroda na 4 tygodnie”
  'miesieczna-pielegnacja': { src: urodaImage, position: '50% 45%' },
}

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

// Zapasowy widok dla pakietu bez własnej opowieści (np. dodanego później w panelu).
function fallbackSteps(pkg) {
  const names = pkg.items?.length ? pkg.items : [pkg.name]
  return names.map((name) => ({ title: name, text: describeTreatment(name)?.text ?? '' }))
}

// Okno „Dowiedz się więcej” przy pakiecie – pakiety rezerwuje się telefonicznie.
function PackageModal({ open, pkg, category, onSelect, onClose }) {
  const reduced = useReducedMotion()
  const contactData = useContactInfo()
  const panelRef = useModalBehavior(open, onClose)
  const duration = reduced ? 0 : 0.3

  const story = pkg ? packageStories[pkg.id] : null
  const lead = story ? story.lead : pkg?.description
  const steps = story ? story.steps : pkg ? fallbackSteps(pkg) : []
  const photo = (pkg && packageImages[pkg.id]) || {
    src: categoryImages[category?.id] ?? cabinetImage,
    position: 'center',
  }
  const note = category?.footnote

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
            initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.98 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
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
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
              />
              {canNavigate ? (
                <div className="package-modal__nav" role="group" aria-label="Przechodzenie między pakietami">
                  <button type="button" onClick={() => go(-1)} aria-label="Poprzedni pakiet">
                    <Icon name="chevronLeft" />
                  </button>
                  <span aria-live="polite">
                    {position + 1} / {list.length}
                  </span>
                  <button type="button" onClick={() => go(1)} aria-label="Następny pakiet">
                    <Icon name="chevronRight" />
                  </button>
                </div>
              ) : null}
            </div>

            <motion.div
              key={pkg.id}
              className="package-modal__content"
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="package-modal__body">
                <p className="package-modal__kicker">Pakiet zabiegowy</p>
                <h2 id="package-modal-title" className="package-modal__title">
                  {packageTitleLines(pkg.name).map((line) => (
                    <span key={line} className="package-modal__title-line">
                      {line}
                    </span>
                  ))}
                </h2>
                {lead ? <p className="package-modal__lead">{lead}</p> : null}

                <Steps pkgId={pkg.id} steps={steps} />
              </div>

              <footer className="package-modal__footer">
                <div className="package-modal__price">
                  <p className="package-modal__price-main">
                    {pkg.price} <span>PLN</span>
                  </p>
                  <p className="package-modal__price-info">
                    <s>{pkg.was} PLN</s>
                    <span className="package-modal__save">-{pkg.save} PLN</span>
                  </p>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PackageModal
