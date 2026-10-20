import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import gabinetInterior from '../assets/gabinet-wnetrze.webp'
import guideBiopen from '../assets/guide-biopen.webp'
import guideSuchosc from '../assets/guide-suchosc.webp'
import guideRf from '../assets/guide-rf.webp'
import guideMaska from '../assets/guide-maska.webp'
import guideRzesy from '../assets/guide-rzesy.webp'
import guideDiament from '../assets/guide-diament.webp'
import guideMezo from '../assets/guide-mezo.webp'
import { useSection } from '../content/context'
import { mediaUrl } from '../lib/supabaseConfig'
import { guideTreatmentIds } from '../data/treatmentGuide'
import Button from './Button'
import Icon from './Icon'
import './SkinGuide.scss'

const OPTION_IMAGES = {
  zmarszczki: guideBiopen,
  suchosc: guideSuchosc,
  owal: guideRf,
  bankiet: guideMaska,
  spojrzenie: guideRzesy,
  pory: guideDiament,
  przebarwienia: guideMezo,
}

// Zdjęcie RF jest poziome – twarz jest po prawej, więc kadr przesuwamy w jej stronę.
const OPTION_IMAGE_POSITION = {
  owal: '72% center',
  przebarwienia: '100% 40%', // twarz po prawej stronie kadru
}

function optionImage(opt) {
  if (opt?.image) return mediaUrl(opt.image) || OPTION_IMAGES[opt.id] || gabinetInterior
  return OPTION_IMAGES[opt.id] || gabinetInterior
}

function moveTab(event, index, options, tabRefs, select) {
  const last = options.length - 1
  if (last < 0) return

  let next
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    next = index === last ? 0 : index + 1
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    next = index === 0 ? last : index - 1
  } else if (event.key === 'Home') {
    next = 0
  } else if (event.key === 'End') {
    next = last
  } else {
    return
  }

  event.preventDefault()
  select(options[next].id)
  tabRefs.current[next]?.focus()
}

function SkinGuide({ onBook, onTreatmentInfo }) {
  const reduced = useReducedMotion()
  const content = useSection('skinGuide')
  const options = content.options || []
  const [selectedId, setSelectedId] = useState(options[0]?.id || 'zmarszczki')
  const tabRefs = useRef([])
  const displayRef = useRef(null)

  // Na telefonie karta zabiegu leży pod listą zakładek – po kliknięciu przewijamy do niej,
  // żeby było widać, co się zmieniło.
  const selectByClick = (id) => {
    setSelectedId(id)
    if (!window.matchMedia('(max-width: 900px)').matches) return
    displayRef.current?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const current = options.find((opt) => opt.id === selectedId) || options[0]
  const treatmentIds =
    onTreatmentInfo && guideTreatmentIds[current?.id]?.length ? guideTreatmentIds[current.id] : null

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-40px' },
          transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
        }

  if (!options.length) return null

  const titleLead = content.titleLead || 'Dobierz pielęgnację'
  const titleAccent = (content.titleAccent || '').trim()
  const showAccent =
    Boolean(titleAccent) && !titleLead.toLowerCase().includes(titleAccent.toLowerCase())

  return (
    <section className="skin-guide" id="dobierz-zabieg" aria-labelledby="guide-title">
      <div className="skin-guide__header">
        {content.kicker ? <p className="skin-guide__kicker">{content.kicker}</p> : null}
        <motion.h2 id="guide-title" className="skin-guide__title" {...reveal(0.05)}>
          {titleLead}
          {showAccent ? (
            <>
              {' '}
              <span>{titleAccent}</span>
            </>
          ) : null}
        </motion.h2>
        <span className="skin-guide__ornament" aria-hidden="true" />
        <motion.p className="skin-guide__intro" {...reveal(0.1)}>
          {content.intro ||
            'Skupiamy się na realnych efektach. Wybierz obszar, nad którym chcesz popracować, a my zaproponujemy sprawdzone rozwiązanie.'}
        </motion.p>
      </div>

      <div className="skin-guide__stage">
        <div className="skin-guide__container">
          <div
            className="skin-guide__tabs"
            role="tablist"
            aria-orientation="vertical"
            aria-label="Dobierz zabieg"
          >
          {options.map((opt, index) => {
            const isSelected = opt.id === current?.id
            return (
              <button
                key={opt.id}
                ref={(node) => {
                  tabRefs.current[index] = node
                }}
                type="button"
                role="tab"
                id={`skin-guide-tab-${opt.id}`}
                aria-selected={isSelected}
                aria-controls="skin-guide-panel"
                tabIndex={isSelected ? 0 : -1}
                className={`skin-guide__tab${isSelected ? ' skin-guide__tab--active' : ''}`}
                onClick={() => selectByClick(opt.id)}
                onKeyDown={(event) => moveTab(event, index, options, tabRefs, setSelectedId)}
              >
                <span className="skin-guide__tab-marker" aria-hidden="true" />
                <span className="skin-guide__tab-label">{opt.label}</span>
              </button>
            )
          })}
          </div>

          <div
            ref={displayRef}
            className="skin-guide__display"
            id="skin-guide-panel"
            role="tabpanel"
            aria-labelledby={current ? `skin-guide-tab-${current.id}` : undefined}
          >
          <AnimatePresence mode="wait">
            {current && (
              <motion.article
                key={current.id}
                className="skin-guide__card"
                initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -10 }}
                transition={{ duration: reduced ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="skin-guide__card-media">
                  <div className="skin-guide__photo-frame">
                    <span className="skin-guide__photo-pin" aria-hidden="true" />
                    <div className="skin-guide__photo-mat">
                      <img
                        src={optionImage(current)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={
                          !current.image && OPTION_IMAGE_POSITION[current.id]
                            ? { objectPosition: OPTION_IMAGE_POSITION[current.id] }
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="skin-guide__card-body">
                  <span className="skin-guide__expert-badge">
                    {content.expertBadge || 'Rekomendacja eksperta'}
                  </span>

                  <h3 className="skin-guide__rec-title">{current.recommended}</h3>
                  <p className="skin-guide__rec-lead">{current.desc}</p>

                  <div className="skin-guide__why">
                    <p className="skin-guide__why-head">
                      <span className="skin-guide__why-icon" aria-hidden="true">
                        <Icon name="check" />
                      </span>
                      <span>Dlaczego warto?</span>
                    </p>
                    <p className="skin-guide__why-text">
                      {current.why ||
                        'Indywidualnie dobrany plan zabiegowy i opieka po wizycie — bez presji, w Twoim tempie.'}
                    </p>
                  </div>

                  <div className="skin-guide__meta">
                    <div className="skin-guide__meta-item">
                      <span className="skin-guide__meta-label">Czas trwania</span>
                      <span className="skin-guide__meta-value">{current.duration}</span>
                    </div>
                    <div className="skin-guide__meta-item">
                      <span className="skin-guide__meta-label">Cena</span>
                      <span className="skin-guide__meta-value">{current.price}</span>
                    </div>
                  </div>

                  <div className="skin-guide__card-footer">
                    <Button variant="booking" onClick={onBook}>
                      Umów wizytę
                    </Button>

                    {/* Karta z opisanymi zabiegami otwiera okno; nowa karta z panelu – dalej cennik */}
                    {treatmentIds ? (
                      <Button
                        variant="secondary"
                        onClick={() => onTreatmentInfo(treatmentIds[0], treatmentIds)}
                      >
                        Dowiedz się więcej
                      </Button>
                    ) : (
                      <Button variant="secondary" href="#cennik">
                        Dowiedz się więcej
                      </Button>
                    )}
                  </div>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SkinGuide
