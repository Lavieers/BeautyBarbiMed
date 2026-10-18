import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { sectionDefaults } from '../../data/defaults'
import { buildGuide, rowKey, treatmentGuide } from '../../data/treatmentGuide'
import { useContent } from '../../content/context'
import { blankLike } from '../fields/blank'
import { uploadMedia } from '../upload'
import AdminIcon from '../AdminIcon'
import TreatmentCard from '../../components/TreatmentCard'
import './PricingPanel.scss'

const sectionKey = 'pricing'

// Pola opisu zabiegu, które pokazuje okno „Dowiedz się więcej” (poza zdjęciem).
const INFO_TEXT_FIELDS = ['duration', 'what', 'forWhom', 'effects', 'avoid', 'note']

// W polu „Cena” wpisuje się samą kwotę – „zł” dopisujemy automatycznie przy zapisie.
const CURRENCY_TAIL = /\s*(zł|zl|pln)\.?\s*$/i
const stripCurrency = (price) => String(price ?? '').replace(CURRENCY_TAIL, '').trim()
const withCurrency = (price) => {
  const amount = stripCurrency(price)
  return amount ? `${amount} zł` : ''
}

// Wartości do formularza: to, co zabieg pokazuje na stronie (wpisane w panelu albo domyślne).
function seedInfo(row) {
  const guide = buildGuide(row)
  return {
    duration: guide.duration,
    what: guide.what,
    forWhom: guide.forWhom,
    effects: guide.effects,
    avoid: guide.avoid,
    note: guide.note,
    image: row.info?.image ?? '',
    position: row.info?.position ?? '',
  }
}

function slugId(text) {
  return (
    String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'grupa'
  )
}

function flattenPricingRows(groups) {
  const out = []
  for (const group of groups ?? []) {
    for (const row of group.rows ?? []) {
      out.push({
        id: row.id,
        name: row.name,
        price: row.price,
        category: group.label ?? '',
        groupId: group.id,
        info: row.info,
      })
    }
  }
  return out
}

function groupPricingRows(flat) {
  const groups = []
  const indexByLabel = new Map()

  for (const row of flat) {
    const label = String(row.category ?? '').trim() || 'Inne'
    let idx = indexByLabel.get(label)
    if (idx === undefined) {
      idx = groups.length
      indexByLabel.set(label, idx)
      groups.push({
        id: row.groupId || slugId(label),
        label,
        rows: [],
      })
    }
    groups[idx].rows.push({
      id: row.id || `row-${Math.random().toString(36).slice(2, 8)}`,
      name: row.name ?? '',
      price: row.price ?? '',
      ...(row.info ? { info: row.info } : {}),
    })
  }

  return groups
}

function PricingModal({ title, children, footer, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="adm-modal" role="presentation">
      <button type="button" className="adm-modal__backdrop" aria-label="Zamknij" onClick={onClose} />
      <div
        className="adm-modal__panel adm-modal__panel--pricing"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-pricing-modal-title"
      >
        <header className="adm-modal__head">
          <h2 id="adm-pricing-modal-title" className="adm-modal__title">
            {title}
          </h2>
          <button type="button" className="adm-modal__close" aria-label="Zamknij" onClick={onClose}>
            <span />
            <span />
          </button>
        </header>
        <div className="adm-modal__body">{children}</div>
        {footer ? <div className="adm-modal__foot adm-pricing__modal-foot">{footer}</div> : null}
      </div>
    </div>
  )
}

// Pole opisu: jednolinijkowe albo wielowierszowe, w stylu reszty panelu.
function InfoField({ label, hint, area = false, rows = 2, value, onChange, placeholder }) {
  return (
    <label className="adm-field">
      <span className="adm-field__label">{label}</span>
      {area ? (
        <textarea
          className="adm-input adm-input--area"
          rows={rows}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="adm-input"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint ? <span className="adm-field__hint">{hint}</span> : null}
    </label>
  )
}

// Zdjęcie po lewej stronie okna: własne (wgrane) albo domyślne dla zabiegu.
function InfoImageField({ value, onChange }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const pick = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isPng = file.type === 'image/png' || /\.png$/i.test(file.name)
    if (!isPng) {
      setError('Wybierz zdjęcie w formacie PNG (plik z rozszerzeniem .png).')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setBusy(true)
    setError(null)
    try {
      onChange(await uploadMedia(file, 'cennik'))
    } catch (cause) {
      setError(cause.message ?? 'Nie udało się wgrać pliku.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="adm-field">
      <span className="adm-field__label">Zdjęcie w oknie</span>
      <div className="adm-field__media-row">
        <button
          type="button"
          className="adm-btn adm-btn--ghost"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Wgrywam…' : value ? 'Zmień zdjęcie' : 'Wybierz zdjęcie'}
        </button>
        {value ? (
          <button type="button" className="adm-btn adm-btn--quiet" onClick={() => onChange('')}>
            Wróć do domyślnego
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,.png"
        onChange={pick}
        className="adm-field__file"
      />
      <span className="adm-field__hint">
        Tylko plik PNG – najlepiej wygląda i zajmuje mało miejsca. Zdjęcie pionowe sprawdzi się najlepiej.
        Bez własnego zdjęcia okno pokaże domyślne.
      </span>
      {error ? <span className="adm-field__error">{error}</span> : null}
    </div>
  )
}

// Podgląd okna jest zawsze w prawdziwej wielkości (jak na stronie), a tu tylko pomniejszany do szerokości kolumny.
function ScaledPreview({ children }) {
  const wrapRef = useRef(null)
  const innerRef = useRef(null)
  const [box, setBox] = useState({ scale: 0.7, height: 380 })

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return undefined

    const measure = () => {
      const scale = Math.min(1, wrap.clientWidth / inner.offsetWidth)
      const height = inner.offsetHeight * scale
      setBox((prev) =>
        Math.abs(prev.scale - scale) < 0.001 && Math.abs(prev.height - height) < 0.5
          ? prev
          : { scale, height },
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(wrap)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="adm-pricing__scale" style={{ height: box.height }}>
      <div
        ref={innerRef}
        className="adm-pricing__scale-inner"
        style={{ transform: `scale(${box.scale})` }}
      >
        {children}
      </div>
    </div>
  )
}

// Gotowe okno „Dowiedz się więcej” – dokładnie to, co klientka zobaczy na stronie, odświeżane na bieżąco.
function TreatmentPreview({ value }) {
  const guide = buildGuide({ id: value.id, info: value.info })

  return (
    <aside className="adm-pricing__preview" aria-label="Podgląd okna zabiegu">
      <p className="adm-pricing__preview-title">Podgląd okna na stronie</p>
      <ScaledPreview>
        <div className="package-modal package-modal--treatment adm-pricing__preview-card">
          <TreatmentCard
            still
            name={value.name?.trim() || 'Nazwa zabiegu'}
            price={withCurrency(value.price) || '—'}
            guide={guide}
          />
        </div>
      </ScaledPreview>
      <p className="adm-field__hint">
        Tak okno zobaczą klientki po kliknięciu w zabieg w cenniku. Pola, które zostawisz puste, znikają z
        okna. Jeśli zostawisz puste wszystkie opisy, zabieg nie będzie miał okna.
      </p>
    </aside>
  )
}

function PriceRowForm({ value, onChange, categories }) {
  const patch = (next) => onChange({ ...value, ...next })
  const info = value.info ?? {}
  const patchInfo = (next) => patch({ info: { ...info, ...next } })
  const listId = 'adm-pricing-categories'

  return (
    <>
      <label className="adm-field">
        <span className="adm-field__label">Nazwa zabiegu</span>
        <input
          className="adm-input"
          value={value.name ?? ''}
          onChange={(event) => patch({ name: event.target.value })}
          placeholder="np. Peeling kawitacyjny"
        />
      </label>

      <div className="adm-pricing__pair">
        <label className="adm-field">
          <span className="adm-field__label">Kategoria</span>
          <input
            className="adm-input"
            list={listId}
            value={value.category ?? ''}
            onChange={(event) => patch({ category: event.target.value })}
            placeholder="np. Pedicure"
            title="Ta sama nazwa kategorii grupuje pozycje na stronie"
          />
          <datalist id={listId}>
            {categories.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
        </label>

        <label className="adm-field">
          <span className="adm-field__label">Cena</span>
          <span className="adm-pricing__price-input">
            <input
              className="adm-input"
              inputMode="decimal"
              value={value.price ?? ''}
              onChange={(event) => patch({ price: event.target.value })}
              placeholder="np. 250"
              title="Wpisz samą kwotę – „zł” dopisze się automatycznie"
            />
            <span className="adm-pricing__price-unit" aria-hidden="true">
              zł
            </span>
          </span>
        </label>
      </div>

      <div className="adm-pricing__section">
        <p className="adm-pricing__section-title">Okno „Dowiedz się więcej”</p>
      </div>

      <InfoField
        label="Czas zabiegu"
        value={info.duration}
        onChange={(duration) => patchInfo({ duration })}
        placeholder="np. ok. 60 min"
      />
      <InfoField
        label="Opis zabiegu"
        area
        value={info.what}
        onChange={(what) => patchInfo({ what })}
        placeholder="Co to jest i jak działa – 1–2 zdania."
      />
      <InfoField
        label="Dla kogo"
        area
        value={info.forWhom}
        onChange={(forWhom) => patchInfo({ forWhom })}
        placeholder="np. Dla osób z bliznami i rozszerzonymi porami."
      />
      <InfoField
        label="Efekty"
        area
        value={info.effects}
        onChange={(effects) => patchInfo({ effects })}
        placeholder="np. Gładsza, bardziej jędrna skóra. Seria 3–5 zabiegów."
      />
      <InfoField
        label="Przeciwwskazania"
        area
        value={info.avoid}
        onChange={(avoid) => patchInfo({ avoid })}
        placeholder="np. Ciąża, aktywny trądzik, opryszczka."
      />
      <InfoField
        label="Ważne"
        area
        value={info.note}
        onChange={(note) => patchInfo({ note })}
        placeholder="Krótka uwaga na dole okna, nad ceną (opcjonalnie)."
      />
      <InfoImageField value={info.image} onChange={(image) => patchInfo({ image, position: '' })} />
    </>
  )
}

function PricingPanel() {
  const { sections, refresh } = useContent()
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState(null)
  const [modal, setModal] = useState(null)
  const [modalError, setModalError] = useState(null)
  const [flashRow, setFlashRow] = useState(null)
  const flashRef = useRef(null)

  // Po dodaniu pozycji przewijamy do niej i na chwilę ją podświetlamy – widać, że się dodała.
  useEffect(() => {
    if (flashRow === null) return undefined
    flashRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const timer = window.setTimeout(() => setFlashRow(null), 2600)
    return () => window.clearTimeout(timer)
  }, [flashRow])

  const saved = { ...(sectionDefaults[sectionKey] ?? {}), ...(sections?.[sectionKey] ?? {}) }
  const pricing = draft?.key === sectionKey ? draft.value : saved
  const rows = flattenPricingRows(pricing.groups)

  const categories = useMemo(() => {
    const labels = new Set((pricing.groups ?? []).map((group) => group.label).filter(Boolean))
    for (const row of rows) {
      if (row.category?.trim()) labels.add(row.category.trim())
    }
    return [...labels].sort((a, b) => a.localeCompare(b, 'pl'))
  }, [pricing.groups, rows])

  const setRows = (nextRows) => {
    setDraft({
      key: sectionKey,
      value: { ...pricing, groups: groupPricingRows(nextRows) },
    })
  }

  const save = async () => {
    setStatus({ kind: 'busy', text: 'Zapisuję…' })

    const { error } = await supabase
      .from('sections')
      .upsert({ key: sectionKey, content: pricing }, { onConflict: 'key' })

    if (error) {
      setStatus({ kind: 'error', text: error.message })
      return
    }

    await refresh()
    setDraft(null)
    setStatus({ kind: 'ok', text: 'Zapisane. Odśwież stronę główną, żeby zobaczyć zmiany.' })
  }

  const closeModal = () => {
    setModal(null)
    setModalError(null)
  }

  const openAdd = () =>
    setModal({
      mode: 'add',
      value: blankLike({
        id: '',
        name: '',
        category: categories[0] ?? '',
        price: '',
        groupId: '',
        info: seedInfo({ id: '', info: null }),
      }),
    })

  const commitModal = () => {
    if (!modal) return
    const name = String(modal.value.name ?? '').trim()
    const category = String(modal.value.category ?? '').trim()
    const price = withCurrency(modal.value.price)

    if (!name) {
      setModalError('Wpisz nazwę zabiegu.')
      return
    }
    if (!category) {
      setModalError('Wpisz kategorię.')
      return
    }
    if (!price) {
      setModalError('Wpisz cenę.')
      return
    }

    const cleaned = { ...modal.value, name, category, price }

    // Opis okna: czyścimy odstępy. Zabieg ze znanym opisem zachowuje wpis nawet z pustymi polami
    // (puste pole = usunięty blok); nowy zabieg bez żadnej treści nie dostaje okna.
    const info = Object.fromEntries(
      INFO_TEXT_FIELDS.map((field) => [field, String(modal.value.info?.[field] ?? '').trim()]),
    )
    const image = String(modal.value.info?.image ?? '').trim()
    const hasContent = INFO_TEXT_FIELDS.some((field) => info[field])
    const hasDefaults = Boolean(treatmentGuide[rowKey(cleaned)])
    if (hasContent || hasDefaults) {
      cleaned.info = { ...info, ...(image ? { image } : {}) }
    } else {
      delete cleaned.info
    }

    const unsaved = 'Kliknij „Zapisz na stronie”, żeby zmiany pojawiły się na stronie.'

    if (modal.mode === 'add') {
      const nextRows = [...rows, cleaned]
      setRows(nextRows)
      // wiersze w tabeli są pogrupowane według kategorii – szukamy, gdzie ostatecznie wylądował nowy
      setFlashRow(
        flattenPricingRows(groupPricingRows(nextRows)).findIndex(
          (row) => row.name === name && row.price === price && row.category === category,
        ),
      )
      setStatus({ kind: 'ok', text: `Dodano zabieg „${name}” do listy. ${unsaved}` })
    } else {
      setRows(rows.map((row, index) => (index === modal.rowIndex ? cleaned : row)))
      setStatus({ kind: 'ok', text: `Zmieniono „${name}”. ${unsaved}` })
    }

    closeModal()
  }

  const removeRow = (rowIndex) => {
    if (!window.confirm('Usunąć tę pozycję z cennika?')) return
    const removed = rows[rowIndex]
    setRows(rows.filter((_, index) => index !== rowIndex))
    setStatus({
      kind: 'ok',
      text: `Usunięto „${removed?.name ?? 'pozycję'}” z listy. Kliknij „Zapisz na stronie”, żeby zmiana pojawiła się na stronie.`,
    })
    closeModal()
  }

  return (
    <div className="adm-panel adm-panel--home adm-pricing">
      <section className="adm-pricing__stage" aria-label="Cennik zabiegów">
        {rows.length === 0 ? (
          <p className="adm-pricing__empty">Cennik jest pusty — dodaj pierwszą pozycję plusem w rogu.</p>
        ) : (
          <div className="adm-pricing__table-wrap">
            <table className="adm-pricing__table">
              <thead>
                <tr>
                  <th scope="col">Nazwa</th>
                  <th scope="col">Kategoria</th>
                  <th scope="col">Cena</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={row.id ?? rowIndex}
                    ref={rowIndex === flashRow ? flashRef : null}
                    className={rowIndex === flashRow ? 'adm-pricing__row--flash' : undefined}
                  >
                    <td>
                      <button
                        type="button"
                        className="adm-pricing__row-hit"
                        onClick={() =>
                          setModal({
                            mode: 'edit',
                            rowIndex,
                            value: { ...row, price: stripCurrency(row.price), info: seedInfo(row) },
                          })
                        }
                      >
                        <span className="adm-pricing__name">{row.name}</span>
                        <span className="adm-pricing__hint">Kliknij, aby edytować</span>
                      </button>
                    </td>
                    <td>{row.category}</td>
                    <td className="adm-pricing__price">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <button type="button" className="adm-panel-fab" aria-label="Dodaj pozycję cennika" onClick={openAdd}>
        <AdminIcon name="plus" className="adm-panel-fab__icon" />
      </button>

      {modal ? (
        <PricingModal
          title={modal.mode === 'add' ? 'Nowa pozycja' : 'Zmień pozycję'}
          onClose={closeModal}
          footer={
            <>
              <button type="button" className="adm-btn adm-btn--primary" onClick={commitModal}>
                {modal.mode === 'add' ? 'Dodaj' : 'Zapisz'}
              </button>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={closeModal}>
                Anuluj
              </button>
              {modal.mode === 'edit' ? (
                <button
                  type="button"
                  className="adm-btn adm-btn--quiet adm-pricing__delete"
                  onClick={() => removeRow(modal.rowIndex)}
                >
                  Usuń
                </button>
              ) : null}
              {modalError ? (
                <span className="adm-status adm-status--error adm-pricing__modal-error" role="alert">
                  {modalError}
                </span>
              ) : null}
            </>
          }
        >
          <div className="adm-pricing__editor">
            <div className="adm-pricing__form">
              <PriceRowForm
                value={modal.value}
                onChange={(value) => {
                  setModal({ ...modal, value })
                  setModalError(null)
                }}
                categories={categories}
              />
            </div>
            <TreatmentPreview value={modal.value} />
          </div>
        </PricingModal>
      ) : null}

      <div className="adm-actions adm-actions--sticky adm-pricing__save">
        <button type="button" className="adm-btn adm-btn--primary adm-pricing__save-btn" onClick={save}>
          Zapisz na stronie
        </button>
        <span className="adm-pricing__status" aria-live="polite">
          {status ? <span className={`adm-status adm-status--${status.kind}`}>{status.text}</span> : null}
        </span>
      </div>
    </div>
  )
}

export default PricingPanel
