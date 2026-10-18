import { motion, useReducedMotion } from 'motion/react'
import { useSection } from '../content/context'
import { guideFor, rowKey } from '../data/treatmentGuide'
import './Pricing.scss'

function Pricing({ onTreatmentInfo }) {
  const reduced = useReducedMotion()
  const content = useSection('pricing')
  const groups = content.groups ?? []

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
        }

  const colLeft = groups.slice(0, 1)
  const colRight = groups.slice(1)

  const renderGroup = ({ id, label, rows }, index, baseDelay = 0) => (
    <motion.div key={id} className="pricing__group" {...reveal(baseDelay + index * 0.08)}>
      <div className="pricing__group-header">
        <h3 className="pricing__label">{label}</h3>
      </div>
      <div className="pricing__divider" aria-hidden="true" />
      <dl className="pricing__rows">
        {(rows ?? []).map((row) => {
          const { id: rowId, name, price } = row
          // Zabieg z opisem (domyślnym albo wpisanym w panelu) otwiera okno;
          // strzałki w oknie przechodzą po zabiegach tej grupy.
          const key = rowKey(row)
          const hasInfo = Boolean(onTreatmentInfo && guideFor(row))
          return (
            <div key={rowId} className={`pricing__row${hasInfo ? ' pricing__row--info' : ''}`}>
              <dt className="pricing__name">
                {hasInfo ? (
                  <button
                    type="button"
                    className="pricing__info"
                    aria-haspopup="dialog"
                    aria-label={`${name} – zobacz opis zabiegu`}
                    onClick={() =>
                      onTreatmentInfo(
                        key,
                        (rows ?? []).filter((other) => guideFor(other)).map((other) => rowKey(other)),
                      )
                    }
                  >
                    <span className="pricing__info-text">{name}</span>
                    <span className="pricing__info-icon" aria-hidden="true" />
                  </button>
                ) : (
                  name
                )}
              </dt>
              <span className="pricing__leader" aria-hidden="true" />
              <dd className="pricing__price">{price}</dd>
            </div>
          )
        })}
      </dl>
    </motion.div>
  )

  return (
    <section className="pricing" id="cennik" aria-labelledby="pricing-title">
      <div className="pricing__header">
        <motion.h2 id="pricing-title" className="pricing__title" {...reveal(0.05)}>
          {content.titleLead}
          {content.titleAccent && <span> {content.titleAccent}</span>}
        </motion.h2>
        <span className="pricing__ornament" aria-hidden="true" />
      </div>

      <div className="pricing__list">
        <div className="pricing__col pricing__col--left">
          {colLeft.map((g, i) => renderGroup(g, i, 0.18))}
        </div>
        <div className="pricing__col pricing__col--right">
          {colRight.map((g, i) => renderGroup(g, i, 0.26))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
