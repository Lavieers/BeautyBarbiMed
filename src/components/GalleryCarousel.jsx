import useLoopCarousel from '../lib/useLoopCarousel'
import { TILE_HEIGHT, TILE_WIDTH, captionOf, imageSrc, tileLabel } from './galleryHelpers'

// Portfolio na telefonie: zdjęcia w zapętlonej karuzeli przesuwanej palcem (jak pakiety).
// Karty są wyśrodkowane, z brzegu widać sąsiednie; kliknięcie otwiera powiększenie.
function GalleryCarousel({ images, autoPlay, onOpen }) {
  const count = images.length
  const { loop, copies, trackRef, cardRefs, active, activeItem, goTo, trackProps } = useLoopCarousel(
    count,
    autoPlay,
  )

  const cards = []
  for (let copy = 0; copy < copies; copy += 1) {
    const isClone = loop && copy !== 1
    images.forEach((image, i) => {
      const index = copy * count + i
      const { treatment, fact } = captionOf(image)
      cards.push(
        <li
          key={`${copy}-${image.id}`}
          ref={(node) => {
            cardRefs.current[index] = node
          }}
          className={`gal-card${index === active ? ' gal-card--active' : ''}`}
          aria-roledescription="slajd"
          aria-label={`${i + 1} z ${count}`}
          aria-hidden={isClone ? 'true' : undefined}
        >
          <button
            type="button"
            className="gal-card__inner"
            tabIndex={isClone ? -1 : undefined}
            aria-haspopup="dialog"
            aria-label={tileLabel(image)}
            onClick={() => onOpen(i)}
          >
            <span className="gal-card__media">
              <img
                src={imageSrc(image)}
                alt={image.alt || ''}
                width={TILE_WIDTH}
                height={TILE_HEIGHT}
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </span>
            {treatment && <span className="gal-card__name">{treatment}</span>}
            {fact && <span className="gal-card__fact">{fact}</span>}
          </button>
        </li>,
      )
    })
  }

  return (
    <div
      className={`gal-carousel${loop ? '' : ' gal-carousel--single'}`}
      role="group"
      aria-roledescription="karuzela"
      aria-label="Portfolio zabiegów i gabinetu"
    >
      <ul ref={trackRef} className="gal-carousel__track" {...trackProps}>
        {cards}
      </ul>

      {count > 1 ? (
        <div className="gal-carousel__dots" role="group" aria-label="Wybór zdjęcia">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={`gal-carousel__dot${index === activeItem ? ' gal-carousel__dot--active' : ''}`}
              aria-label={`Zdjęcie ${index + 1} z ${count}`}
              aria-current={index === activeItem ? 'true' : undefined}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default GalleryCarousel
