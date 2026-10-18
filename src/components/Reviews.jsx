import { useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Icon from './Icon'
import { useContactInfo, useReviews, useSection } from '../content/context'
import './Reviews.scss'

function Stars({ rating }) {
  const value = Number(rating)
  if (!Number.isFinite(value) || value < 1 || value > 5) return null

  const filled = Math.round(value)

  return (
    <p className="reviews__stars" aria-label={`Ocena ${value} na 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < filled ? 'is-filled' : undefined}>
          <Icon name="star" />
        </span>
      ))}
    </p>
  )
}

function Reviews() {
  const reduced = useReducedMotion()
  const content = useSection('reviews')
  const contact = useContactInfo()
  const dbReviews = useReviews()
  const reviews = dbReviews.length > 0 ? dbReviews : (content.fallbackReviews || [])
  const carouselRef = useRef(null)   // __grid-wrap — scroll container
  const gridRef = useRef(null)       // __grid — do odczytu gap

  if (!reviews.length) return null

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
        }

  const moveCarousel = (direction) => {
    const carousel = carouselRef.current
    const grid = gridRef.current
    const card = grid?.querySelector('.reviews__card')
    if (!carousel || !card) return

    const gap = Number.parseFloat(window.getComputedStyle(grid).columnGap) || 0
    const offset = card.getBoundingClientRect().width + gap
    carousel.scrollBy({ left: direction * offset, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <section className="reviews" id="opinie" aria-labelledby="reviews-title">
      <div className="reviews__header">
        <motion.h2 id="reviews-title" className="reviews__title" {...reveal(0.05)}>
          {content.titleLead}{' '}
          <span>{content.titleAccent}</span>
        </motion.h2>
        <span className="reviews__ornament" aria-hidden="true" />
        {content.intro ? (
          <motion.p className="reviews__intro" {...reveal(0.12)}>
            {content.intro}
          </motion.p>
        ) : null}
      </div>

      <div className="reviews__carousel">
        <div ref={carouselRef} className="reviews__grid-wrap">
        <ul ref={gridRef} className="reviews__grid" aria-label="Opinie klientek">
          {reviews.map((review, index) => (
            <motion.li
              key={review.id}
              className={`reviews__card${review.is_featured ? ' reviews__card--featured' : ''}`}
              {...reveal(0.18 + index * 0.06)}
            >
              <div className="reviews__card-top">
                <span className="reviews__quote" aria-hidden="true">
                  <Icon name="quote" />
                </span>
              </div>

              <blockquote className="reviews__body">{review.body}</blockquote>

              <Stars rating={review.rating} />

              <footer className="reviews__meta">
                <p className="reviews__author">{review.author}</p>
                {review.treatment ? <p className="reviews__treatment">{review.treatment}</p> : null}
              </footer>
            </motion.li>
          ))}
        </ul>
        </div>

        {(reviews.length > 3 || contact.reviewsLink || contact.facebook) && (
          <div className="reviews__bottom">
            {reviews.length > 3 && (
              <div className="reviews__carousel-controls">
                <button type="button" onClick={() => moveCarousel(-1)} aria-label="Pokaż poprzednie opinie">
                  <Icon name="chevronLeft" />
                </button>
                <button type="button" onClick={() => moveCarousel(1)} aria-label="Pokaż kolejne opinie">
                  <Icon name="chevronRight" />
                </button>
              </div>
            )}

            {(contact.reviewsLink || contact.facebook) && (
              <div className="reviews__action-wrap">
                <p className="reviews__action-label">Chcesz zobaczyć więcej opinii lub zostawić własną?</p>
                <div className="reviews__action-links">
                  {contact.reviewsLink && (
                    <a href={contact.reviewsLink} target="_blank" rel="noreferrer">
                      <span className="reviews__google-mark" aria-hidden="true">G</span>
                      Google Reviews
                    </a>
                  )}
                  {contact.facebook && (
                    <a href={contact.facebook} target="_blank" rel="noreferrer">
                      <Icon name="facebook" />
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default Reviews
