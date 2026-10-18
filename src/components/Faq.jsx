import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useContactInfo, useSection } from '../content/context'
import './Faq.scss'

// Słowo „Booksy” w odpowiedzi staje się pogrubionym odnośnikiem do profilu w Booksy.
// Numer telefonu w odpowiedzi zawsze jest podmieniany na aktualny z danych kontaktowych.
function renderAnswer(answer, booksyUrl, phone) {
  if (typeof answer !== 'string') return answer
  const text = phone ? answer.replace(/\+48(?:[\s\u00a0]*\d){9}/g, phone) : answer
  if (!booksyUrl) return text
  return text.split(/(Booksy)/).map((part, index) =>
    part === 'Booksy' ? (
      <a
        key={index}
        className="faq__link"
        href={booksyUrl}
        target="_blank"
        rel="noreferrer"
      >
        <strong>Booksy</strong>
      </a>
    ) : (
      part
    ),
  )
}

function Faq() {
  const reduced = useReducedMotion()
  const content = useSection('faq')
  const contact = useContactInfo()
  const items = content.items ?? []
  // Na starcie wszystkie pytania są zwinięte – odpowiedź pokazuje się po kliknięciu.
  const [openId, setOpenId] = useState(null)
  const activeId = openId

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
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="faq__header">
        <motion.h2 id="faq-title" className="faq__title" {...reveal(0.05)}>
          {content.titleLead}
          <span>{content.titleAccent}</span>
        </motion.h2>
        <span className="faq__ornament" aria-hidden="true" />
      </div>

      <motion.div className="faq__list" {...reveal(0.12)}>
        {items.map(({ id, question, answer }) => {
          const open = activeId === id

          return (
            <div key={id} className={`faq__item${open ? ' faq__item--open' : ''}`}>
              <h3 className="faq__question">
                <button
                  type="button"
                  id={`faq-button-${id}`}
                  className="faq__trigger"
                  aria-expanded={open}
                  aria-controls={`faq-panel-${id}`}
                  onClick={() => setOpenId(open ? '' : id)}
                >
                  <span>{question}</span>
                  <span className="faq__marker" aria-hidden="true" />
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={`faq-panel-${id}`}
                    className="faq__panel"
                    role="region"
                    aria-labelledby={`faq-button-${id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p>{renderAnswer(answer, contact.booksy, contact.phone)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </motion.div>
    </section>
  )
}

export default Faq
