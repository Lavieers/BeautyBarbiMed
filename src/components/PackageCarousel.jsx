import { useEffect, useRef } from 'react'
import useLoopCarousel from '../lib/useLoopCarousel'
import useMediaQuery from '../lib/useMediaQuery'
import { cleanPackageName } from '../data/packageStories'
import { packagePhoto } from '../data/packageImages'
import { resolveCardText } from '../lib/packageDetails'

// Karuzela pakietów na telefonie: duże zdjęcie z ceną i napisem „Szczegóły”, pod nim nazwa
// i krótki opis. Na telefonie karty są wyśrodkowane (z brzegu wyglądają sąsiednie), a całość jest
// zapętlona (patrz useLoopCarousel). Na komputerze i dużych ekranach pakiety stoją w miejscu:
// wszystkie karty mają ten sam stały wymiar, nic się nie przesuwa ani nie przygasza, więc strona nie skacze.
function PackageCarousel({ packages, category, autoPlay, onPackageInfo }) {
  const count = packages.length
  const fixed = useMediaQuery('(min-width: 901px)')
  const { loop, copies, trackRef, cardRefs, active, activeItem, goTo, focusCard, reset, trackProps } =
    useLoopCarousel(count, autoPlay && !fixed)
  const activePackage = activeItem

  // Po powrocie z dużego ekranu na telefon karuzela wraca na środkową kopię kart.
  const wasFixed = useRef(fixed)
  useEffect(() => {
    if (wasFixed.current && !fixed) reset()
    wasFixed.current = fixed
  }, [fixed, reset])

  const cards = []
  for (let copy = 0; copy < copies; copy += 1) {
    const isClone = loop && copy !== 1
    packages.forEach((pkg, i) => {
      const index = copy * count + i
      const photo = packagePhoto(pkg, category)
      const text = resolveCardText(pkg)
      const name = cleanPackageName(pkg.name)
      cards.push(
        <li
          key={`${copy}-${pkg.id}`}
          ref={(node) => {
            cardRefs.current[index] = node
          }}
          className={`pkg-card${index === active ? ' pkg-card--active' : ''}${isClone ? ' pkg-card--clone' : ''}`}
          aria-roledescription={fixed ? undefined : 'slajd'}
          aria-label={fixed ? undefined : `${i + 1} z ${count}`}
          aria-hidden={isClone ? 'true' : undefined}
        >
          <article
            className="pkg-card__inner"
            onClick={() => {
              // kliknięcie sąsiedniej karty (wystającej z boku) wyśrodkowuje ją, kliknięcie aktywnej otwiera okno
              if (loop && !fixed && index !== active) focusCard(index)
              else onPackageInfo?.(pkg, category)
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
                  onPackageInfo?.(pkg, category)
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

  return (
    <div
      className={`pkg-carousel${loop ? '' : ' pkg-carousel--single'}`}
      role="group"
      aria-roledescription={fixed ? undefined : 'karuzela'}
      aria-label="Pakiety w tej kategorii"
    >
      <ul ref={trackRef} className="pkg-carousel__track" {...(fixed ? {} : trackProps)}>
        {cards}
      </ul>

      {count > 1 && !fixed ? (
        <div className="pkg-carousel__dots" role="group" aria-label="Wybór pakietu">
          {packages.map((pkg, index) => (
            <button
              key={pkg.id}
              type="button"
              className={`pkg-carousel__dot${index === activePackage ? ' pkg-carousel__dot--active' : ''}`}
              aria-label={`Pakiet ${index + 1} z ${count}`}
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
