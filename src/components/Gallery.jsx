import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useSection } from '../content/context'
import { usePortfolioImages } from '../data/galleryFallback'
import useMediaQuery from '../lib/useMediaQuery'
import GalleryCarousel from './GalleryCarousel'
import { TILE_HEIGHT, TILE_WIDTH, captionOf, imageSrc, tileLabel } from './galleryHelpers'
import './Gallery.scss'

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

function layoutOf(count) {
  if (count <= 1) return 'single'
  if (count === 2) return 'pair'
  if (count === 3) return 'trio'
  return 'mosaic'
}

function Gallery() {
  const reduced = useReducedMotion()
  const compact = useMediaQuery('(max-width: 900px)')
  const content = useSection('gallery')
  const images = usePortfolioImages()
  const [activeIndex, setActiveIndex] = useState(null)

  if (activeIndex !== null && activeIndex >= images.length) {
    setActiveIndex(null)
  }

  const dialogRef = useRef(null)
  const previouslyFocused = useRef(null)
  const openIndex = activeIndex !== null && activeIndex < images.length ? activeIndex : null
  const isOpen = openIndex !== null

  // Zachowuje zgodność z treścią zapisaną przed odświeżeniem projektu.
  const usesPreviousHeading =
    content.kicker === 'Portfolio & Gabinet' && content.titleLead === 'Zajrzyj do naszego'
  const heading = usesPreviousHeading ? 'Poznaj nasze portfolio' : content.titleLead
  const headingAccent = usesPreviousHeading ? '' : content.titleAccent
  const intro =
    content.intro === 'Precyzja wykonania, sterylne warunki i serdeczna atmosfera przy ul. Romera 30.'
      ? 'Zobacz efekty pracy tworzonej z troską o każdy detal.'
      : content.intro

  const close = useCallback(() => setActiveIndex(null), [])

  const step = useCallback(
    (direction) => {
      setActiveIndex((current) => {
        if (current === null || images.length < 2) return current
        return (current + direction + images.length) % images.length
      })
    },
    [images.length],
  )

  const trapFocus = useCallback((event) => {
    const dialog = dialogRef.current
    if (!dialog) return

    const items = Array.from(dialog.querySelectorAll(focusableSelector))
    if (!items.length) {
      event.preventDefault()
      return
    }

    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement

    if (!dialog.contains(active)) {
      event.preventDefault()
      first.focus()
      return
    }

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    previouslyFocused.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => dialogRef.current?.focus())

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
      }
      if (event.key === 'Tab') trapFocus(event)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close, step, trapFocus])

  if (!images.length) return null

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
        }

  const active = openIndex === null ? null : images[openIndex]
  const layout = layoutOf(images.length)
  const featured = layout === 'trio' || layout === 'mosaic'
  const activeCaption = active ? captionOf(active) : { treatment: '', fact: '' }
  const hasActiveCaption = Boolean(activeCaption.treatment || activeCaption.fact)

  return (
    <section className="gallery" id="galeria" aria-labelledby="gallery-title">
      <div className="gallery__header">
        {content.kicker && !usesPreviousHeading && <p className="gallery__kicker">{content.kicker}</p>}
        <motion.h2 id="gallery-title" className="gallery__title" {...reveal(0.05)}>
          {heading}
          {headingAccent && <span>{headingAccent}</span>}
        </motion.h2>
        <span className="gallery__ornament" aria-hidden="true" />
        {intro && (
          <motion.p className="gallery__intro" {...reveal(0.12)}>
            {intro}
          </motion.p>
        )}
      </div>

      <motion.div className="gallery__stage" {...reveal(0.18)}>
        {compact ? (
          <GalleryCarousel images={images} autoPlay={!reduced} onOpen={setActiveIndex} />
        ) : (
        <ul
          className={`gallery__grid gallery__grid--${layout}`}
          aria-label="Portfolio zabiegów i gabinetu"
        >
          {images.map((image, index) => {
            const { treatment, fact } = captionOf(image)
            const lead = featured && index === 0

            return (
              <li
                key={image.id}
                className={lead ? 'gallery__item gallery__item--lead' : 'gallery__item'}
              >
                <button
                  type="button"
                  className="gallery__thumb"
                  onClick={() => setActiveIndex(index)}
                  aria-haspopup="dialog"
                  aria-label={tileLabel(image)}
                >
                  <img
                    src={imageSrc(image)}
                    alt={image.alt || ''}
                    width={TILE_WIDTH}
                    height={TILE_HEIGHT}
                    loading="lazy"
                  />
                  {(treatment || fact) && (
                    <span className="gallery__caption">
                      {treatment && <span className="gallery__caption-name">{treatment}</span>}
                      {fact && <span className="gallery__caption-fact">{fact}</span>}
                    </span>
                  )}
                  <span className="gallery__zoom" aria-hidden="true">
                    Powiększ
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        )}
      </motion.div>

      <motion.div className="gallery__footer" {...reveal(0.24)}>
        <span className="gallery__footer-ornament" aria-hidden="true">
          <i />
        </span>
      </motion.div>

      <AnimatePresence>
        {active && (
          <motion.div
            key="gallery-lightbox"
            ref={dialogRef}
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-labelledby={hasActiveCaption ? 'gallery-lightbox-caption' : undefined}
            aria-label={hasActiveCaption ? undefined : 'Powiększone zdjęcie'}
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            <div className="lightbox__backdrop" onClick={close} />

            <button type="button" className="lightbox__close" onClick={close} aria-label="Zamknij">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>

            {images.length > 1 && (
              <button
                type="button"
                className="lightbox__nav lightbox__nav--prev"
                onClick={() => step(-1)}
                aria-label="Poprzednie zdjęcie"
              />
            )}

            {images.length > 1 && (
              <button
                type="button"
                className="lightbox__nav lightbox__nav--next"
                onClick={() => step(1)}
                aria-label="Następne zdjęcie"
              />
            )}

            <figure className="lightbox__figure">
              <img
                src={imageSrc(active)}
                alt={active.alt || activeCaption.treatment || ''}
                width={TILE_WIDTH}
                height={TILE_HEIGHT}
              />
              {hasActiveCaption && (
                <figcaption id="gallery-lightbox-caption">
                  {activeCaption.treatment && (
                    <span className="lightbox__treatment">{activeCaption.treatment}</span>
                  )}
                  {activeCaption.fact && <span className="lightbox__fact">{activeCaption.fact}</span>}
                </figcaption>
              )}
            </figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Gallery
