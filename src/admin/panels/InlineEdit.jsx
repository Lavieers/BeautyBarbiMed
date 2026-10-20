import { uid } from '../packageForm'
import { usePhotoUpload } from '../photoUpload'
import './InlineEdit.scss'

// Pola do pisania bezpośrednio w oknie „Dowiedz się więcej”. Dziedziczą krój, rozmiar i kolor
// z miejsca, w którym stoją, więc okno wygląda tak samo jak dla klientki.

// Pole tekstu. Wysokość i łamanie linii bierze zwykły tekst (tak jak na stronie), a pole do
// pisania leży na nim i samo nie zmienia układu. `single` – bez nowych linii (Enter nic nie robi).
export function InlineText({ value, onChange, placeholder, label, single = false }) {
  const text = value ?? ''
  const empty = text.length === 0

  return (
    <span className="pkg-inline-field">
      <span className={`pkg-inline-field__sizer${empty ? ' pkg-inline-field__sizer--empty' : ''}`}>
        {empty ? placeholder || ' ' : text}
      </span>
      <textarea
        rows={1}
        className="pkg-inline"
        aria-label={label}
        value={text}
        onChange={(event) => onChange(single ? event.target.value.replace(/\s*\n+\s*/g, ' ') : event.target.value)}
        onKeyDown={single ? (event) => event.key === 'Enter' && event.preventDefault() : undefined}
      />
    </span>
  )
}

// Liczba (cena). Szerokość jak u wpisanej kwoty na stronie – długi opis pola nie rozpycha wiersza,
// tylko pojawia się po najechaniu.
export function InlineNumber({
  value,
  onChange,
  placeholder = '0',
  label,
  strike = false,
  place = 'above',
  variant,
}) {
  const filled = value == null || value === '' ? '' : String(value)
  const length = Math.max((filled || placeholder).length, 1)
  const variantClass = variant ? ` pkg-num--${variant}` : ''
  return (
    <span className={`pkg-num${place === 'below' ? ' pkg-num--below' : ''}${variantClass}`}>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        className={`pkg-inline pkg-inline--number${strike ? ' pkg-inline--strike' : ''}`}
        style={{ width: `${length + 1}ch` }}
        aria-label={label}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
      />
      {label ? <span className="pkg-num__tip" role="tooltip">{label}</span> : null}
    </span>
  )
}

// Lista „Co wchodzi w pakiet”: ta sama oś z punktami, ale każdy krok można pisać, przesuwać i usuwać.
export function InlineSteps({ steps, onChange }) {
  const list = Array.isArray(steps) ? steps : []
  const patchStep = (index, next) =>
    onChange(list.map((row, position) => (position === index ? { ...row, ...next } : row)))
  const move = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= list.length) return
    const next = [...list]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const insertAfter = (index) =>
    onChange([...list.slice(0, index + 1), { title: '', text: '', _k: uid() }, ...list.slice(index + 1)])

  return (
    <>
      <ol className="package-modal__flow">
        {list.map((step, index) => (
          <li
            key={step._k ?? index}
            className={`package-modal__step${index === list.length - 1 ? ' package-modal__step--last' : ''}`}
          >
            <span className="package-modal__marker" aria-hidden="true" />
            <div className="package-modal__step-body">
              <div className="pkg-step-head">
                <h3 className="package-modal__step-title">
                  <InlineText
                    single
                    label={`Nazwa zabiegu ${index + 1}`}
                    placeholder="Nazwa zabiegu"
                    value={step.title}
                    onChange={(title) => patchStep(index, { title })}
                  />
                </h3>
                <span className="pkg-step-tools">
                  <button
                    type="button"
                    aria-label="Przesuń wyżej"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Przesuń niżej"
                    disabled={index === list.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </button>
                  <button type="button" aria-label="Dodaj zabieg poniżej" onClick={() => insertAfter(index)}>
                    +
                  </button>
                  <button
                    type="button"
                    aria-label="Usuń zabieg"
                    onClick={() => onChange(list.filter((_, position) => position !== index))}
                  >
                    ×
                  </button>
                </span>
              </div>
              <p className="package-modal__step-text">
                <InlineText
                  label={`Opis zabiegu ${index + 1}`}
                  placeholder="Krótki opis (można zostawić puste)"
                  value={step.text}
                  onChange={(text) => patchStep(index, { text })}
                />
              </p>
            </div>
          </li>
        ))}
      </ol>
      {list.length === 0 ? (
        <button
          type="button"
          className="pkg-inline-add"
          onClick={() => onChange([{ title: '', text: '', _k: uid() }])}
        >
          + Dodaj zabieg
        </button>
      ) : null}
    </>
  )
}

// Przyciski na zdjęciu: własne zdjęcie albo powrót do domyślnego.
export function InlinePhotoTools({ value, onChange, uploadOptions }) {
  const { inputRef, busy, error, open, pick, acceptAttr } = usePhotoUpload(onChange, uploadOptions)

  return (
    <div className="pkg-photo-tools">
      <div className="pkg-photo-tools__row">
        <button type="button" onClick={open} disabled={busy}>
          {busy ? 'Wgrywam…' : value ? 'Zmień zdjęcie' : 'Dodaj własne zdjęcie'}
        </button>
        {value ? (
          <button type="button" onClick={() => onChange('')}>
            Zdjęcie domyślne
          </button>
        ) : null}
      </div>
      {error ? <span className="pkg-photo-tools__error">{error}</span> : null}
      <input ref={inputRef} hidden type="file" accept={acceptAttr} onChange={pick} />
    </div>
  )
}

const PRICING_PHOTO = {
  folder: 'cennik',
  acceptTypes: ['image/png'],
  accept: 'image/png,.png',
  typeError: 'Wybierz zdjęcie w formacie PNG (plik .png).',
}

export function InlinePricingPhotoTools({ value, onChange }) {
  return (
    <InlinePhotoTools value={value} onChange={onChange} uploadOptions={PRICING_PHOTO} />
  )
}
