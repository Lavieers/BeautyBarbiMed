import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import PackageCard from '../../components/PackageCard'
import useMediaQuery from '../../lib/useMediaQuery'
import ScaledPreview from '../ScaledPreview'
import { packagePhoto } from '../../data/packageImages'
import { usePhotoUpload } from '../photoUpload'
import { InlineNumber, InlinePhotoTools, InlineSteps, InlineText } from './InlineEdit'
import './PackageEditor.scss'

// ── Okno ───────────────────────────────────────────────────────────────────────

// Okno edycji o stałym rozmiarze: nagłówek i przyciski zawsze widoczne, przewija się tylko treść.
// Esc i kliknięcie w tło nie gubią wpisanych zmian bez pytania.
export function PackageEditorModal({ title, size, dirty, onClose, footer, children }) {
  const panelRef = useRef(null)
  const requestClose = () => {
    if (dirty && !window.confirm('Masz niezapisane zmiany. Zamknąć okno bez zapisywania?')) return
    onClose()
  }
  // najnowsza wersja funkcji zamykającej – dzięki temu nasłuch klawisza nie jest co chwilę zakładany od nowa
  const closeRef = useRef(requestClose)
  useEffect(() => {
    closeRef.current = requestClose
  })

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus({ preventScroll: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div className="adm-modal" role="presentation">
      <button type="button" className="adm-modal__backdrop" aria-label="Zamknij" onClick={requestClose} />
      <div
        ref={panelRef}
        className={`adm-modal__panel adm-pkg-modal adm-pkg-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-pkg-modal-title"
        tabIndex={-1}
      >
        <header className="adm-modal__head">
          <h2 id="adm-pkg-modal-title" className="adm-modal__title">
            {title}
          </h2>
          <button type="button" className="adm-modal__close" aria-label="Zamknij" onClick={requestClose}>
            <span />
            <span />
          </button>
        </header>
        <div className="adm-modal__body adm-pkg-modal__body">{children}</div>
        <div className="adm-modal__foot adm-pkg-modal__foot">{footer}</div>
      </div>
    </div>
  )
}

// ── Okno „Nowy pakiet” ─────────────────────────────────────────────────────────

function PhotoField({ pkgId, value, category, onChange }) {
  const { inputRef, busy, error, open, pick } = usePhotoUpload(onChange)
  const photo = packagePhoto({ id: pkgId, image: value }, category)

  return (
    <div className="adm-field">
      <span className="adm-field__label">Zdjęcie pakietu</span>
      <div className="adm-pkg-photo">
        <img className="adm-pkg-photo__thumb" src={photo.src} alt="" style={{ objectPosition: photo.position }} />
        <div className="adm-pkg-photo__side">
          <div className="adm-field__media-row">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={open} disabled={busy}>
              {busy ? 'Wgrywam…' : value ? 'Zmień zdjęcie' : 'Wybierz zdjęcie'}
            </button>
            {value ? (
              <button type="button" className="adm-btn adm-btn--quiet" onClick={() => onChange('')}>
                Wróć do domyślnego
              </button>
            ) : null}
          </div>
          <span className="adm-field__hint">
            PNG, JPG lub WEBP. Bez własnego zdjęcia pakiet pokaże zdjęcie domyślne.
          </span>
          {error ? <span className="adm-field__error">{error}</span> : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={pick}
        className="adm-field__file"
      />
    </div>
  )
}

// To, co widać na karcie pakietu na stronie głównej (okno dodawania pakietu).
export function CardFields({ value, category, onChange }) {
  return (
    <>
      <label className="adm-field">
        <span className="adm-field__label">Nazwa pakietu</span>
        <input
          className="adm-input"
          value={value.name ?? ''}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="np. Odświeżenie i blask"
        />
      </label>

      <PhotoField
        pkgId={value.id}
        value={value.image ?? ''}
        category={category}
        onChange={(image) => onChange({ image })}
      />

      <label className="adm-field adm-pkg-modal__price">
        <span className="adm-field__label">Cena w pakiecie (zł)</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          className="adm-input"
          value={value.price ?? ''}
          onChange={(event) =>
            onChange({ price: event.target.value === '' ? '' : Number(event.target.value) })
          }
        />
      </label>

      <label className="adm-field">
        <span className="adm-field__label">Krótki opis na karcie</span>
        <textarea
          className="adm-input adm-input--area"
          rows={2}
          value={value.description ?? ''}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Np. Dla skóry zmęczonej, pozbawionej energii i naturalnego blasku"
        />
      </label>
    </>
  )
}

// ── Edycja na podglądzie ───────────────────────────────────────────────────────

// Edycja istniejącego pakietu: okno „Dowiedz się więcej” jest od razu polem do pisania –
// klikasz nazwę, opis, zabieg, cenę lub zdjęcie i zmieniasz. Poza oknem stoi tylko opis karty,
// bo na stronie widać go wyłącznie na karcie pakietu.
export function EditForm({ value, category, position, total, onChange }) {
  const wide = useMediaQuery('(min-width: 60rem)')
  const stageRef = useRef(null)
  const [overflow, setOverflow] = useState(false)

  // Okno ma taką samą wysokość i takie same marginesy jak na stronie, więc jeśli tekst się w nim
  // nie mieści (pojawia się przewijanie), to nie zmieści się też klientce – ostrzegamy o tym.
  // Na telefonie okno i tak się przewija, więc tam nie ostrzegamy.
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

  // Oszczędność liczy się sama, gdy znamy obie ceny (można ją potem poprawić ręcznie).
  const patch = (next) => {
    const merged = { ...value, ...next }
    if (!('save' in next) && ('price' in next || 'was' in next)) {
      const price = Number(merged.price)
      const was = Number(merged.was)
      if (merged.price !== '' && merged.was !== '' && was >= price) merged.save = was - price
    }
    onChange(merged)
  }

  const slots = {
    photoTools: (
      <>
        <InlinePhotoTools value={value.image ?? ''} onChange={(image) => patch({ image })} />
        {overflow ? (
          <span className="pkg-overflow-warn" role="status">
            Za dużo tekstu – w oknie na stronie pojawi się pasek przewijania. Skróć opis lub zabiegi.
          </span>
        ) : null}
      </>
    ),
    title: (
      <InlineText
        single
        label="Nazwa pakietu"
        placeholder="Nazwa pakietu"
        value={value.name}
        onChange={(name) => patch({ name })}
      />
    ),
    lead: (
      <InlineText
        label="Opis pod nazwą"
        placeholder="Krótki opis pod nazwą"
        value={value.lead}
        onChange={(lead) => patch({ lead })}
      />
    ),
    steps: <InlineSteps steps={value.steps} onChange={(steps) => patch({ steps })} />,
    price: (
      <InlineNumber
        variant="main-price"
        place="below"
        label="Cena w pakiecie"
        value={value.price}
        onChange={(price) => patch({ price })}
      />
    ),
    // tak samo jak na stronie: przekreślona cena bez pakietu i plakietka z oszczędnością
    priceInfo: (
      <>
        <s>
          <InlineNumber
            strike
            place="below"
            label="Cena bez pakietu"
            placeholder="–"
            value={value.was}
            onChange={(was) => patch({ was })}
          />{' '}
          PLN
        </s>
        <span className="package-modal__save">
          -
          <InlineNumber
            place="below"
            label="Ile się zaoszczędziło"
            placeholder="–"
            value={value.save}
            onChange={(save) => patch({ save })}
          />{' '}
          PLN
        </span>
      </>
    ),
  }

  const card = (
    <PackageCard
      still
      pkg={value}
      category={category}
      slots={slots}
      nav={total > 1 ? { go: () => {}, position, total } : null}
    />
  )

  return (
    <div className="pkg-editor">
      <label className="pkg-editor__strip">
        <span className="pkg-editor__strip-label">Opis na karcie pakietu (strona główna)</span>
        <input
          className="adm-input"
          value={value.description ?? ''}
          onChange={(event) => patch({ description: event.target.value })}
          placeholder="Np. Dla skóry zmęczonej, pozbawionej energii i naturalnego blasku"
        />
      </label>

      <div ref={stageRef} className="pkg-editor__stage">
        {wide ? (
          <ScaledPreview fit>
            <div className="package-modal pkg-editor__card">{card}</div>
          </ScaledPreview>
        ) : (
          <div className="package-modal pkg-editor__card pkg-editor__card--flow">{card}</div>
        )}
      </div>
    </div>
  )
}
