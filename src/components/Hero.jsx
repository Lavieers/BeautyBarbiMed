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

function Hero({ onBook }) {
  const content = useSection('hero')
  const background = mediaUrl(content.backgroundImage) || heroImage

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

        <motion.div
          className="hero__actions"
          {...fadeUp}
          transition={{ duration: 0.95, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
