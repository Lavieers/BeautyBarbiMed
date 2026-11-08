import { useEffect, useMemo, useRef } from 'react'
import useLoopCarousel from '../lib/useLoopCarousel'
import useMediaQuery from '../lib/useMediaQuery'
import { cleanPackageName } from '../data/packageStories'
import { packagePhoto } from '../data/packageImages'
import { resolveCardText } from '../lib/packageDetails'

// Na komputerze karty stoją w miejscu, żeby układ się nie przesuwał.
// Na telefonie jeden rząd pakietów przechodzi między zakładkami.
function PackageCarousel({
  packages = [],
  category,
  sequence = null,
  activeCategoryIndex = 0,
  onCategoryChange,
  focusPackageId = null,
  autoPlay,
  onPackageInfo,
}) {
  const fixed = useMediaQuery('(min-width: 901px)')
  const continuous = !fixed && Array.isArray(sequence) && sequence.length > 0
  const slides = useMemo(() => {
    if (continuous) return sequence
    return packages.map((pkg) => ({ pkg, category, categoryIndex: activeCategoryIndex }))
  }, [continuous, sequence, packages, category, activeCategoryIndex])
  const count = slides.length
  const initialItemRef = useRef(undefined)
  if (initialItemRef.current === undefined) {
    const found = continuous
      ? slides.findIndex((slide) => slide.categoryIndex === activeCategoryIndex)
      : 0
    initialItemRef.current = found < 0 ? 0 : found
  }
  const { loop, copies, trackRef, cardRefs, active, activeItem, goTo, focusCard, reset, trackProps } =
    useLoopCarousel(count, autoPlay && !fixed, initialItemRef.current)
  const activePackage = activeItem
  const slidesRef = useRef(slides)
  const activeItemRef = useRef(activeItem)
  const categoryIndexRef = useRef(activeCategoryIndex)
  const goToRef = useRef(goTo)
  const programmatic = useRef(false)
  slidesRef.current = slides
  activeItemRef.current = activeItem
  categoryIndexRef.current = activeCategoryIndex
  goToRef.current = goTo

  // Przesunięcie palcem na pakiet z innej zakładki podświetla tę zakładkę.
  useEffect(() => {
    if (!continuous || !onCategoryChange) return undefined
    const next = slides[activeItem]?.categoryIndex
    if (next == null) return undefined
    if (programmatic.current) {
      if (next === categoryIndexRef.current) programmatic.current = false
      return undefined
    }
    if (next === categoryIndexRef.current) return undefined
    onCategoryChange(next)
    return undefined
  }, [continuous, activeItem, onCategoryChange, slides])

  // Kliknięcie zakładki przewija do jej pierwszego pakietu (bez cofania w trakcie animacji).
  // Gdy otwarte są szczegóły konkretnego pakietu, nie cofamy karuzeli na początek zakładki.
  useEffect(() => {
    if (!continuous) return
    if (focusPackageId) {
      const focused = slidesRef.current.find((slide) => slide.pkg.id === focusPackageId)
      if (focused?.categoryIndex === activeCategoryIndex) return
    }
    const current = slidesRef.current[activeItemRef.current]?.categoryIndex
    if (current === activeCategoryIndex) return
    const target = slidesRef.current.findIndex((slide) => slide.categoryIndex === activeCategoryIndex)
    if (target < 0) return
    programmatic.current = true
    goToRef.current(target)
  }, [continuous, activeCategoryIndex, focusPackageId])

  // Okno szczegółów otworzyło pakiet z innej karty — karuzela staje na nim, nie na pierwszym z zakładki.
  useEffect(() => {
    if (!continuous || !focusPackageId) return
    const target = slidesRef.current.findIndex((slide) => slide.pkg.id === focusPackageId)
    if (target < 0 || target === activeItemRef.current) return
    programmatic.current = true
    goToRef.current(target)
  }, [continuous, focusPackageId])

  // Po powrocie z dużego ekranu na telefon karuzela wraca na środkową kopię kart.
  const wasFixed = useRef(fixed)
  useEffect(() => {
    if (wasFixed.current && !fixed) reset()
    wasFixed.current = fixed
  }, [fixed, reset])

  const releaseProgrammatic = () => {
    programmatic.current = false
  }

  const ordinals = useMemo(() => {
    const seen = new Map()
    return slides.map((slide) => {
      const order = seen.get(slide.categoryIndex) ?? 0
      seen.set(slide.categoryIndex, order + 1)
      return order
    })
  }, [slides])
  const categoryTotals = useMemo(() => {
    const totals = new Map()
    slides.forEach((slide) => {
      totals.set(slide.categoryIndex, (totals.get(slide.categoryIndex) ?? 0) + 1)
    })
    return totals
  }, [slides])

  const cards = []
  for (let copy = 0; copy < copies; copy += 1) {
    const isClone = loop && copy !== 1
    slides.forEach((slide, i) => {
      const { pkg, category: slideCategory } = slide
      const index = copy * count + i
      const photo = packagePhoto(pkg, slideCategory)
      const text = resolveCardText(pkg)
      const name = cleanPackageName(pkg.name)
      const place = ordinals[i] ?? i
      const total = categoryTotals.get(slide.categoryIndex) ?? count
      cards.push(
        <li
          key={`${copy}-${slide.categoryIndex}-${pkg.id}`}
          ref={(node) => {
            cardRefs.current[index] = node
          }}
          className={`pkg-card${index === active ? ' pkg-card--active' : ''}${isClone ? ' pkg-card--clone' : ''}`}
          aria-roledescription={fixed ? undefined : 'slajd'}
          aria-label={fixed ? undefined : `${place + 1} z ${total}`}
          aria-hidden={isClone ? 'true' : undefined}
        >
          <article
            className="pkg-card__inner"
            onClick={() => {
              // kliknięcie sąsiedniej karty (wystającej z boku) wyśrodkowuje ją, kliknięcie aktywnej otwiera okno
              if (loop && !fixed && index !== active) focusCard(index)
              else onPackageInfo?.(pkg, slideCategory)
            }}
          >
            <div className="pkg-card__media">
              <img
                src={photo.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable="false"
                style={{ objectPosition: photo.position }}
              />
              <button
                type="button"
                className="pkg-card__chip pkg-card__chip--more"
                tabIndex={isClone ? -1 : undefined}
                onClick={(event) => {
                  event.stopPropagation()
                  onPackageInfo?.(pkg, slideCategory)
                }}
              >
                <span className="pkg-card__dot" aria-hidden="true" />
                Szczegóły
                <span className="visually-hidden"> pakietu {name}</span>
              </button>
              <span
                className="pkg-card__chip pkg-card__chip--price"
                aria-label={`Cena pakietu ${pkg.price} złotych`}
              >
                {pkg.price} zł
              </span>
            </div>

            <h3 className="pkg-card__name">{name}</h3>
            {text ? <p className="pkg-card__text">{text}</p> : null}
          </article>
        </li>,
      )
    })
  }

  const activeSlide = slides[activePackage]
  const dots = slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) =>
      continuous ? slide.categoryIndex === activeSlide?.categoryIndex : true,
    )

  return (
    <div
      className={`pkg-carousel${count > 1 ? '' : ' pkg-carousel--single'}`}
      role="group"
      aria-roledescription={fixed ? undefined : 'karuzela'}
      aria-label={continuous ? 'Wszystkie pakiety zabiegowe' : 'Pakiety w tej kategorii'}
    >
      <ul
        ref={trackRef}
        className="pkg-carousel__track"
        {...(fixed
          ? {}
          : {
              ...trackProps,
              onTouchStart: (event) => {
                releaseProgrammatic()
                trackProps.onTouchStart(event)
              },
              onPointerDown: (event) => {
                releaseProgrammatic()
                trackProps.onPointerDown(event)
              },
              onKeyDown: (event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') releaseProgrammatic()
                trackProps.onKeyDown(event)
              },
            })}
      >
        {cards}
      </ul>

      {dots.length > 1 && !fixed ? (
        <div className="pkg-carousel__dots" role="group" aria-label="Wybór pakietu">
          {dots.map(({ slide, index }, dotIndex) => (
            <button
              key={`${slide.categoryIndex}-${slide.pkg.id}`}
              type="button"
              className={`pkg-carousel__dot${index === activePackage ? ' pkg-carousel__dot--active' : ''}`}
              aria-label={`Pakiet ${dotIndex + 1} z ${dots.length}`}
              aria-current={index === activePackage ? 'true' : undefined}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default PackageCarousel
