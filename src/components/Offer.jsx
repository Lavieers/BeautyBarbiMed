import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Button from './Button'
import Icon from './Icon'
import { useSection } from '../content/context'
import PackageCarousel from './PackageCarousel'
import './Offer.scss'
import './PackageCarousel.scss'

function tabLabelFor(category) {
  // stary skrót „MEZOTERAPII” mógł zostać zapisany w bazie – pokazujemy poprawną formę
  if (category.tabLabel) return category.tabLabel.replace(/^mezoterapii$/i, 'MEZOTERAPIA')
  return category.title.replace(/^PAKIET(Y)? /i, '')
}

function Offer({ onPackageInfo }) {
  const reduced = useReducedMotion()
  const content = useSection('offer')
  const categories = content.categories ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const count = categories.length
  const safeIndex = count === 0 ? 0 : activeIndex >= count ? 0 : activeIndex

  const goTo = useCallback(
    (index) => {
      if (count === 0) return
      setActiveIndex((index + count) % count)
    },
    [count],
  )

  const goPrev = useCallback(() => goTo(safeIndex - 1), [safeIndex, goTo])
  const goNext = useCallback(() => goTo(safeIndex + 1), [safeIndex, goTo])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
        }

  // Dla elementów poza ekranem po nawigacji do sekcji – animuje się bezwarunkowo,
  // nie czekając aż element pojawi się w viewport.
  const revealFixed = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
        }

  const active = categories[safeIndex]
  const packages = active?.packages ?? []
  const titleLead = content.titleLead ?? ''
  const titleAccent = (content.titleAccent ?? '').trim()
  const showAccent =
    Boolean(titleAccent) && !titleLead.toLowerCase().includes(titleAccent.toLowerCase())

  return (
    <section className="offer" id="oferta" aria-labelledby="offer-title">
      <div className="offer__header">
        <p className="offer__kicker">{content.kicker}</p>
        <span className="offer__ornament" aria-hidden="true" />
        <motion.h2 id="offer-title" className="offer__title" {...reveal(0.05)}>
          {titleLead}
          {showAccent ? (
            <>
              {' '}
              <span>{titleAccent}</span>
            </>
          ) : null}
        </motion.h2>
        <motion.p className="offer__intro" {...reveal(0.1)}>
          {content.intro}
        </motion.p>
      </div>

      {count > 0 && (
        <motion.div className="offer__carousel-wrap" {...reveal(0.14)}>
          <div className="offer__tabs" role="tablist" aria-label="Kategorie pakietów">
            {categories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                id={`offer-tab-${category.id}`}
                aria-selected={index === safeIndex}
                aria-controls="offer-tabpanel"
                className={`offer__tab${index === safeIndex ? ' offer__tab--active' : ''}`}
                onClick={() => goTo(index)}
              >
                {tabLabelFor(category)}
              </button>
            ))}
          </div>

          <div
            className="offer__carousel"
            role="region"
            aria-roledescription="karuzela"
            aria-label="Pakiety zabiegowe"
          >
            <button
              type="button"
              className="offer__nav offer__nav--prev"
              onClick={goPrev}
              aria-label="Poprzednia kategoria"
            >
              <Icon name="chevronLeft" />
            </button>

            <div
              className="offer__viewport"
              id="offer-tabpanel"
              role="tabpanel"
              aria-labelledby={active ? `offer-tab-${active.id}` : undefined}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {active && (
                  <motion.article
                    key={active.id}
                    className="offer__slide"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <PackageCarousel
                      key={active.id}
                      packages={packages}
                      category={active}
                      autoPlay={!reduced}
                      onPackageInfo={onPackageInfo}
                    />
                  </motion.article>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              className="offer__nav offer__nav--next"
              onClick={goNext}
              aria-label="Następna kategoria"
            >
              <Icon name="chevronRight" />
            </button>
          </div>
        </motion.div>
      )}

      <motion.div className="offer__cennik-link" {...revealFixed(0.17)}>
        <Button variant="link" href="#cennik">
          Zobacz pełny cennik usług
        </Button>
      </motion.div>
    </section>
  )
}

export default Offer
