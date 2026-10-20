import { motion } from 'motion/react'
import heroImage from '../assets/hero-bg.webp'
import Button from './Button'
import { useSection } from '../content/context'
import { mediaUrl } from '../lib/supabaseConfig'
import './Hero.scss'

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
}

const HIGHLIGHT_DEFAULTS = [
  { id: 'nurse', primary: 'Pielęgniarka', secondary: 'kwalifikacje medyczne' },
  { id: 'biopen', primary: 'BioPen', secondary: 'Tropokolagen' },
  { id: 'sterile', primary: 'Standard medyczny', secondary: 'sterylność procedur' },
  { id: 'location', primary: 'Lublin', secondary: 'ul. Romera 30' },
]

// Na telefonach pokazujemy tylko wybrane atuty (+ jeden dodatkowy, widoczny wyłącznie na mobile).
const MOBILE_HIGHLIGHT_IDS = ['nurse']
const MOBILE_EXTRA_HIGHLIGHT = {
  primary: 'Indywidualne podejście',
  secondary: 'kameralny gabinet',
}

const LOCATION_HIGHLIGHT = HIGHLIGHT_DEFAULTS.find((row) => row.id === 'location')

function normalizeHighlight(item) {
  if (item?.id === 'booksy') {
    return LOCATION_HIGHLIGHT
  }

  if (item?.primary) {
    if (/5\.0|Booksy.*Google/i.test(`${item.primary} ${item.secondary || ''}`)) {
      return LOCATION_HIGHLIGHT
    }

    return {
      id: item.id || item.primary,
      primary: item.primary,
      secondary: item.secondary || '',
    }
  }

  const fallback = HIGHLIGHT_DEFAULTS.find((row) => row.id === item?.id)
  if (fallback) return fallback

  return {
    id: item?.id || 'custom',
    primary: item?.text || '',
    secondary: '',
  }
}

function Hero({ onBook }) {
  const content = useSection('hero')
  const background = mediaUrl(content.backgroundImage) || heroImage

  const rawHighlights = content.trustHighlights?.length
    ? content.trustHighlights
    : HIGHLIGHT_DEFAULTS
  const highlights = rawHighlights.map(normalizeHighlight)

  const primaryLabel = content.primaryCta || 'Umów wizytę'
  const secondaryLabel = content.secondaryCta || 'Zabiegi i cennik'

  return (
    <section className="hero" id="home" aria-label="Sekcja powitalna">
      <div
        className="hero__background"
        style={{ backgroundImage: `url(${background})` }}
        aria-hidden="true"
      />
      <div className="hero__veil" aria-hidden="true" />

      <div className="hero__content">
        <motion.p
          className="hero__eyebrow"
          {...fadeUp}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          {content.eyebrow}
        </motion.p>

        <motion.h1
          className="hero__title"
          {...fadeUp}
          transition={{ duration: 0.95, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="hero__title-line">{content.titleLead}</span>
          <span className="hero__title-line hero__title-line--accent">{content.titleAccent}</span>
        </motion.h1>

        <motion.p
          className="hero__description"
          {...fadeUp}
          transition={{ duration: 0.95, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          {content.description}
        </motion.p>

        <motion.ul
          className="hero__highlights"
          {...fadeUp}
          transition={{ duration: 0.95, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Atuty gabinetu"
        >
          {highlights.map((item) => (
            <li
              key={item.id}
              className={`hero__highlight-item${
                MOBILE_HIGHLIGHT_IDS.includes(item.id) ? ' hero__highlight-item--mobile' : ''
              }`}
            >
              <span className="hero__highlight-primary">{item.primary}</span>
              {item.secondary ? (
                <span className="hero__highlight-secondary">{item.secondary}</span>
              ) : null}
            </li>
          ))}
          <li className="hero__highlight-item hero__highlight-item--mobile hero__highlight-item--mobile-only">
            <span className="hero__highlight-primary">{MOBILE_EXTRA_HIGHLIGHT.primary}</span>
            <span className="hero__highlight-secondary">{MOBILE_EXTRA_HIGHLIGHT.secondary}</span>
          </li>
        </motion.ul>

        <motion.div
          className="hero__actions"
          {...fadeUp}
          transition={{ duration: 0.95, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button variant="cta-primary" onClick={onBook}>
            {primaryLabel}
          </Button>

          <Button variant="cta-secondary" href="#oferta">
            {secondaryLabel}
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
