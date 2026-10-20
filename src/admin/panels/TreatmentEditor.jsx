import { useLayoutEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'
import TreatmentCard from '../../components/TreatmentCard'
import { buildGuide } from '../../data/treatmentGuide'
import useMediaQuery from '../../lib/useMediaQuery'
import ScaledPreview from '../ScaledPreview'
import { PackageEditorModal } from './PackageEditor'
import {
  InlineNumber,
  InlinePricingPhotoTools,
  InlineText,
} from './InlineEdit'
import './PackageEditor.scss'
import './TreatmentEditor.scss'

const BLOCKS = [
  { key: 'forWhom', title: 'Dla kogo', label: 'Dla kogo', placeholder: 'Dla kogo polecany jest zabieg' },
  { key: 'effects', title: 'Efekty', label: 'Efekty', placeholder: 'Jakie efekty daje zabieg' },
  { key: 'avoid', title: 'Przeciwwskazania', label: 'Przeciwwskazania', placeholder: 'Kiedy zabiegu nie wykonujemy' },
]

// Edycja pozycji cennika: okno „Dowiedz się więcej” jak na stronie — klikasz w tekst i wpisujesz.
export function TreatmentEditForm({ value, categories, onChange }) {
  const wide = useMediaQuery('(min-width: 60rem)')
  const stageRef = useRef(null)
  const [overflow, setOverflow] = useState(false)
  const listId = 'adm-pricing-categories-inline'
  const info = value.info ?? {}

  const patch = (next) => onChange({ ...value, ...next })
  const patchInfo = (next) => patch({ info: { ...info, ...next } })

  const guide = buildGuide(value)
  const priceDisplay =
    String(value.price ?? '').trim() === ''
      ? '—'
      : `${String(value.price).replace(/\s*(zł|zl|pln)\.?\s*$/i, '').trim()} zł`

  useLayoutEffect(() => {
    const body = stageRef.current?.querySelector('.package-modal__body')
    if (!body) return undefined

    const measure = () => {
      const next = wide && body.scrollHeight > body.clientHeight + 1
      setOverflow((prev) => (prev === next ? prev : next))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(body)
    let alive = true
    document.fonts?.ready.then(() => {
      if (alive) measure()
    })
    window.addEventListener('resize', measure)
    return () => {
      alive = false
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [wide, value])

  const slots = {
    photoTools: (
      <>
        <InlinePricingPhotoTools
          value={info.image ?? ''}
          onChange={(image) => patchInfo({ image, position: '' })}
        />
        {overflow ? (
          <span className="pkg-overflow-warn" role="status">
            Za dużo tekstu – w oknie na stronie pojawi się pasek przewijania. Skróć opis.
          </span>
        ) : null}
      </>
    ),
    title: (
      <InlineText
        single
        label="Nazwa zabiegu"
        placeholder="Nazwa zabiegu"
        value={value.name}
        onChange={(name) => patch({ name })}
      />
    ),
    duration: (
      <p className="package-modal__duration pkg-editor__duration">
        <Icon name="clock" />
        <InlineText
          single
          label="Czas zabiegu"
          placeholder="np. ok. 60 min"
          value={info.duration}
          onChange={(duration) => patchInfo({ duration })}
        />
      </p>
    ),
    what: (
      <p className="package-modal__what">
        <InlineText
          label="Opis zabiegu"
          placeholder="Co to jest i jak działa – 1–2 zdania"
          value={info.what}
          onChange={(what) => patchInfo({ what })}
        />
      </p>
    ),
    sections: (
      <div className="package-modal__sections">
        {BLOCKS.map(({ key, title, label, placeholder }) => (
          <section key={key} className="package-modal__block">
            <h3 className="package-modal__block-title">{title}</h3>
            <p className="package-modal__block-text">
              <InlineText
                label={label}
                placeholder={placeholder}
                value={info[key]}
                onChange={(text) => patchInfo({ [key]: text })}
              />
            </p>
          </section>
        ))}
      </div>
    ),
    note: (
      <p className="package-modal__important">
        <strong>Ważne</strong>
        <InlineText
          label="Ważne"
          placeholder="Krótka uwaga nad ceną (opcjonalnie)"
          value={info.note}
          onChange={(note) => patchInfo({ note })}
        />
      </p>
    ),
    price: (
      <InlineNumber
        variant="main-price"
        place="below"
        label="Cena"
        placeholder="0"
        value={
          (() => {
            const amount = String(value.price ?? '')
              .replace(/\s*(zł|zl|pln)\.?\s*$/i, '')
              .trim()
            if (amount === '') return ''
            const number = Number(amount)
            return Number.isFinite(number) ? number : ''
          })()
        }
        onChange={(price) => patch({ price: price === '' ? '' : price })}
      />
    ),
  }

  const card = (
    <TreatmentCard still guide={guide} name={value.name || 'Nazwa zabiegu'} price={priceDisplay} slots={slots} />
  )

  return (
    <div className="pkg-editor tm-editor">
      <label className="pkg-editor__strip">
        <span className="pkg-editor__strip-label">Kategoria w cenniku</span>
        <input
          className="adm-input"
          list={listId}
          value={value.category ?? ''}
          onChange={(event) => patch({ category: event.target.value })}
          placeholder="np. Pedicure"
        />
        <datalist id={listId}>
          {categories.map((label) => (
            <option key={label} value={label} />
          ))}
        </datalist>
      </label>

      <div ref={stageRef} className="pkg-editor__stage">
        {wide ? (
          <ScaledPreview fit>
            <div className="package-modal package-modal--treatment pkg-editor__card">{card}</div>
          </ScaledPreview>
        ) : (
          <div className="package-modal package-modal--treatment pkg-editor__card pkg-editor__card--flow">
            {card}
          </div>
        )}
      </div>
    </div>
  )
}

export { PackageEditorModal as TreatmentEditorModal }
