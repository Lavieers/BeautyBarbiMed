import { useEffect, useRef, useState } from 'react'
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

function cardCopy(text) {
  if (text == null || text === '') return text
  return String(text)
    .replace(/„([^”]+)”/g, '$1')
    .replace(/[„”""]/g, '')
    .trim()
}

function renderRecLead(text) {
  const clean = cardCopy(text)
  const desktopBr = <br className="skin-guide__why-br" aria-hidden="true" />
  const rules = [
    /^(.+\.)\s+(Idealny,.+)$/i,
    /^(.+\bzachwycić)\s+(pod makijażem\s+[—–-]\s*bez przestoju\.)$/iu,
    /^(.+\bw skórę)\s+(właściwą\s+[—–-]\s*szybka droga do promiennej, nawilżonej cery\.)$/iu,
    /^(.+\btwarzy)\s+(i\s+przywraca.+)$/i,
    /^(.+\btęczówki)\s+(i\s+oszczędza.+)$/i,
    /^(.+?)\s+([—–-]\s*.+)$/u,
  ]

  for (const rule of rules) {
    const match = rule.exec(clean)
    if (match) {
      return (
        <>
          {match[1]}
          {desktopBr}
          {match[2]}
        </>
      )
    }
  }

  return clean
}

function renderWhyLine(line) {
  const clean = cardCopy(line)
  const juzBreak = /^(.+?\stekstury)\s+(już\s.+)$/i.exec(clean)
  if (juzBreak) {
    return (
      <>
        {juzBreak[1]}
        <br className="skin-guide__why-br" aria-hidden="true" />
        {juzBreak[2]}
      </>
    )
  }
  return clean
}

function whyItems(opt) {
  if (Array.isArray(opt?.whyPoints) && opt.whyPoints.length) {
    return opt.whyPoints.map((line) => cardCopy(line)).filter(Boolean)
  }
  const raw = cardCopy(opt?.why || '')
  if (!raw) {
    return [
      'Indywidualnie dobrany plan zabiegowy i opieka po wizycie — bez presji, w Twoim tempie.',
    ]
  }
  const split = raw
    .split(/\s*[•·|]\s*|\n+/)
    .map((s) => cardCopy(s))
    .filter(Boolean)
  if (split.length > 1) return split
  return [raw]
}

function WhyCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.55" />
      <path
        d="m8.25 12.1 2.15 2.15 5.35-5.5"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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
  const tabsRef = useRef(null)
  const displayRef = useRef(null)
  const [tabsHeightPx, setTabsHeightPx] = useState(null)

  useEffect(() => {
    const tabsEl = tabsRef.current
    if (!tabsEl) return undefined

    const desktopQuery = window.matchMedia('(min-width: 901px)')

    const syncTabsHeight = () => {
      if (!desktopQuery.matches) {
        setTabsHeightPx(null)
        return
      }
      setTabsHeightPx(Math.round(tabsEl.getBoundingClientRect().height))
    }

    syncTabsHeight()
    const observer = new ResizeObserver(syncTabsHeight)
    observer.observe(tabsEl)
    desktopQuery.addEventListener('change', syncTabsHeight)
    window.addEventListener('resize', syncTabsHeight)

    return () => {
      observer.disconnect()
      desktopQuery.removeEventListener('change', syncTabsHeight)
      window.removeEventListener('resize', syncTabsHeight)
    }
  }, [options])

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

  const renderDetails = (variant) => {
    const chip = variant === 'chip'
    const className = chip ? 'skin-guide__media-chip' : 'skin-guide__book skin-guide__foot-details'
    const label = chip ? (
      <>
        <span className="skin-guide__media-dot" aria-hidden="true" />
        Szczegóły
      </>
    ) : (
      <>
        Szczegóły
        <Icon name="chevronRight" className="skin-guide__foot-details-arrow" aria-hidden="true" />
      </>
    )

    if (treatmentIds) {
      return (
        <button
          type="button"
          className={className}
          onClick={() => onTreatmentInfo(treatmentIds[0], treatmentIds)}
        >
          {label}
        </button>
      )
    }

    return (
      <a className={className} href="#cennik">
        {label}
      </a>
    )
  }

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
        <div
          className="skin-guide__container"
          style={
            tabsHeightPx != null
              ? { '--skin-guide-tabs-px': `${tabsHeightPx}px` }
              : undefined
          }
        >
          <div
            ref={tabsRef}
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
                <div className="skin-guide__card-inner">
                  <div className="skin-guide__card-media">
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
                    <p className="skin-guide__media-badge">
                      {content.expertBadge || 'Rekomendacja eksperta'}
                    </p>
                    <div className="skin-guide__media-details">{renderDetails('chip')}</div>
                  </div>

                  <div className="skin-guide__card-body">
                    <header className="skin-guide__card-head">
                      {current.tag ? <p className="skin-guide__rec-tag">{current.tag}</p> : null}
                      <h3 className="skin-guide__rec-title">{current.recommended}</h3>
                    </header>

                    <p className="skin-guide__rec-lead">{renderRecLead(current.desc)}</p>

                    <div className="skin-guide__why">
                      <p className="skin-guide__why-head">Dlaczego warto?</p>
                      <ul className="skin-guide__why-list">
                        {whyItems(current)
                          .slice(0, 6)
                          .map((line, index) => (
                            <li key={`${current.id}-why-${index}`} className="skin-guide__why-item">
                              <span className="skin-guide__why-icon">
                                <WhyCheckIcon />
                              </span>
                              <span className="skin-guide__why-text">{renderWhyLine(line)}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <footer className="skin-guide__card-foot">
                      <div className="skin-guide__foot-meta">
                        <div className="skin-guide__meta-item">
                          <span className="skin-guide__meta-label">Czas</span>
                          <span className="skin-guide__meta-value">{current.duration}</span>
                        </div>
                        <div className="skin-guide__meta-item skin-guide__meta-item--price-block">
                          <span className="skin-guide__meta-label">Cena</span>
                          <span className="skin-guide__meta-value">{current.price}</span>
                        </div>
                      </div>
                      <div className="skin-guide__foot-cta">
                        <div className="skin-guide__foot-sub">
                          <span className="skin-guide__foot-price" aria-label={`Cena ${current.price}`}>
                            {current.price}
                          </span>
                          {renderDetails('link')}
                        </div>
                        <Button
                          variant="cta-primary"
                          size="compact"
                          className="skin-guide__foot-book"
                          onClick={onBook}
                        >
                          Umów wizytę
                        </Button>
                      </div>
                    </footer>
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
