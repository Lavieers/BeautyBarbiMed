import { motion, useReducedMotion } from 'motion/react'
import { useSection } from '../content/context'
import './Process.scss'

function Process() {
  const reduced = useReducedMotion()
  const content = useSection('process')
  const steps = content.steps ?? []

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
        }

  return (
    <section className="process" id="proces" aria-labelledby="process-title">
      <div className="process__inner">
        {/* Lewa kolumna — nagłówek + cytat na dole */}
        <div className="process__left">
          <div className="process__left-top">
            <motion.p className="process__kicker" {...reveal(0.05)}>
              {content.kicker}
            </motion.p>

            <motion.h2 id="process-title" className="process__title" {...reveal(0.1)}>
              {content.titleLead} {content.titleAccent}
            </motion.h2>

            <motion.div className="process__divider" aria-hidden="true" {...reveal(0.13)} />

            {content.intro && (
              <motion.p className="process__intro" {...reveal(0.16)}>
                {content.intro}
              </motion.p>
            )}
          </div>

          {content.quote && (
            <motion.blockquote className="process__left-quote" {...reveal(0.22)}>
              <p>{content.quote}</p>
            </motion.blockquote>
          )}
        </div>

        {/* Prawa kolumna — kroki */}
        <div className="process__right">
          <ol className="process__steps">
            {steps.map(({ id, title, text }, index) => (
              <motion.li
                key={id ?? index}
                className={`process__step${index === steps.length - 1 ? ' process__step--last' : ''}`}
                {...reveal(0.18 + index * 0.09)}
              >
                <span className="process__marker" aria-hidden="true" />
                <div className="process__step-body">
                  <h3 className="process__step-title">{title}</h3>
                  <p className="process__text">{text}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default Process
