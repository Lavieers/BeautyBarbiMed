import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useContent } from '../../content/context'
import { useAdminTable } from '../useAdminTable'
import AdminIcon from '../AdminIcon'
import './ReviewsPanel.scss'

const emptyReview = {
  author: '',
  body: '',
  rating: 5,
  treatment: '',
  is_published: true,
  is_featured: false,
  sort_order: 0,
}

function sortedRows(rows) {
  return [...rows].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.created_at).localeCompare(String(b.created_at)),
  )
}

function excerpt(text, max = 120) {
  const clean = String(text ?? '').trim().replace(/\s+/g, ' ')
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trim()}…`
}

function ReviewStars({ rating, className }) {
  const value = Number(rating)
  const filled = Number.isFinite(value) && value >= 1 && value <= 5 ? Math.round(value) : 0

  return (
    <span
      className={className ?? 'adm-reviews__stars'}
      aria-label={filled ? `Ocena ${filled} na 5` : 'Bez oceny'}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <AdminIcon
          key={index}
          name={index < filled ? 'starFilled' : 'star'}
          className="adm-reviews__star-icon"
        />
      ))}
    </span>
  )
}

function StarRatingInput({ value, onChange }) {
  const filled = Number(value) >= 1 && Number(value) <= 5 ? Math.round(Number(value)) : 0

  return (
    <div className="adm-field adm-reviews__rating-field">
      <span className="adm-field__label">Ocena</span>
      <div className="adm-reviews__star-picker" role="radiogroup" aria-label="Wybierz ocenę">
        {[1, 2, 3, 4, 5].map((stars) => (
          <button
            key={stars}
            type="button"
            className={`adm-reviews__star-btn${stars <= filled ? ' is-active' : ''}`}
            aria-label={`${stars} ${stars === 1 ? 'gwiazdka' : 'gwiazdki'}`}
            aria-checked={stars === filled}
            onClick={() => onChange(stars)}
          >
            <AdminIcon name={stars <= filled ? 'starFilled' : 'star'} className="adm-reviews__star-icon" />
          </button>
        ))}
        {filled ? (
          <button type="button" className="adm-reviews__rating-clear" onClick={() => onChange(null)}>
            Bez oceny
          </button>
        ) : null}
      </div>
    </div>
  )
}

function ReviewsModal({ title, children, onClose }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="adm-modal" role="presentation">
      <button type="button" className="adm-modal__backdrop" aria-label="Zamknij" onClick={onClose} />
      <div
        className="adm-modal__panel adm-modal__panel--reviews"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-reviews-modal-title"
      >
        <header className="adm-modal__head">
          <h2 id="adm-reviews-modal-title" className="adm-modal__title">
            {title}
          </h2>
          <button type="button" className="adm-modal__close" aria-label="Zamknij" onClick={onClose}>
            <span />
            <span />
          </button>
        </header>
        <div className="adm-modal__body">{children}</div>
      </div>
    </div>
  )
}

function ReviewForm({ value, onChange }) {
  const patch = (next) => onChange({ ...value, ...next })

  return (
    <>
      <label className="adm-field">
        <span className="adm-field__label">Imię klientki</span>
        <input
          className="adm-input"
          value={value.author ?? ''}
          onChange={(event) => patch({ author: event.target.value })}
          placeholder="np. Anna K."
        />
      </label>

      <StarRatingInput value={value.rating} onChange={(rating) => patch({ rating })} />

      <label className="adm-field">
        <span className="adm-field__label">Treść opinii</span>
        <textarea
          className="adm-input adm-input--area"
          rows={4}
          value={value.body ?? ''}
          onChange={(event) => patch({ body: event.target.value })}
          placeholder="Krótka, autentyczna recenzja…"
        />
      </label>

      <label className="adm-field">
        <span className="adm-field__label">Zabieg (opcjonalnie)</span>
        <input
          className="adm-input"
          value={value.treatment ?? ''}
          onChange={(event) => patch({ treatment: event.target.value })}
          placeholder="np. Mezoterapia twarzy"
        />
      </label>

      <div className="adm-row adm-reviews__checks">
        <label className="adm-field adm-field--check">
          <input
            type="checkbox"
            checked={Boolean(value.is_published)}
            onChange={(event) => patch({ is_published: event.target.checked })}
          />
          <span>Widoczna na stronie</span>
        </label>

        <label className="adm-field adm-field--check">
          <input
            type="checkbox"
            checked={Boolean(value.is_featured)}
            onChange={(event) => patch({ is_featured: event.target.checked })}
          />
          <span>Wyróżniona</span>
        </label>
      </div>

      <p className="adm-field__hint adm-reviews__modal-hint">
        Kolejność na liście zmieniasz strzałkami ↑↓ — niższy numer = wyżej w karuzeli na stronie.
      </p>
    </>
  )
}

function ReviewsPanel() {
  const { refresh } = useContent()
  const { rows, loading, reload } = useAdminTable('reviews', 'sort_order.asc,created_at.desc')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [modal, setModal] = useState(null)

  const ordered = useMemo(() => sortedRows(rows), [rows])

  const afterChange = async (text) => {
    await reload()
    await refresh()
    setStatus({ kind: 'ok', text })
  }

  const openAdd = () => {
    const nextOrder = ordered.reduce((max, row) => Math.max(max, row.sort_order ?? 0), 0) + 1
    setModal({ mode: 'add', value: { ...emptyReview, sort_order: nextOrder } })
  }

  const saveModal = async () => {
    if (!modal) return
    const value = modal.value
    const author = String(value.author ?? '').trim()
    const body = String(value.body ?? '').trim()

    if (!author || !body) {
      setStatus({ kind: 'error', text: 'Imię i treść opinii są wymagane.' })
      return
    }

    setBusy(true)

    const payload = {
      author,
      body,
      rating: value.rating == null || value.rating === '' ? null : Number(value.rating),
      treatment: String(value.treatment ?? '').trim() || null,
      is_published: Boolean(value.is_published),
      is_featured: Boolean(value.is_featured),
      sort_order: Number(value.sort_order) || 0,
    }

    if (modal.mode === 'add') {
      const { error } = await supabase.from('reviews').insert(payload)
      if (error) {
        setStatus({ kind: 'error', text: error.message })
        setBusy(false)
        return
      }
      setModal(null)
      await afterChange('Opinia dodana.')
    } else {
      const { error } = await supabase.from('reviews').update(payload).eq('id', value.id)
      if (error) {
        setStatus({ kind: 'error', text: error.message })
        setBusy(false)
        return
      }
      setModal(null)
      await afterChange('Zapisane.')
    }

    setBusy(false)
  }

  const remove = async (row) => {
    if (!window.confirm('Usunąć tę opinię?')) return

    const { error } = await supabase.from('reviews').delete().eq('id', row.id)

    if (error) {
      setStatus({ kind: 'error', text: error.message })
      return
    }

    setModal(null)
    await afterChange('Opinia usunięta.')
  }

  const move = async (id, direction) => {
    const list = sortedRows(rows)
    const index = list.findIndex((row) => row.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= list.length) return

    const next = [...list]
    ;[next[index], next[target]] = [next[target], next[index]]

    setStatus({ kind: 'busy', text: 'Zmieniam kolejność…' })

    const updates = next.map((row, position) =>
      supabase.from('reviews').update({ sort_order: position + 1 }).eq('id', row.id),
    )

    const results = await Promise.all(updates)
    const failed = results.find((result) => result.error)
    if (failed?.error) {
      setStatus({ kind: 'error', text: failed.error.message })
      return
    }

    await afterChange('Kolejność zapisana.')
  }

  return (
    <div className="adm-panel adm-panel--home adm-reviews">
      <section className="adm-reviews__stage" aria-label="Opinie klientek">
        {loading ? (
          <p className="adm-reviews__empty">Wczytuję…</p>
        ) : ordered.length === 0 ? (
          <p className="adm-reviews__empty">
            Brak opinii — dodaj pierwszą plusem w rogu. Publikuj tylko za zgodą autorki.
          </p>
        ) : (
          <ul className="adm-reviews__list">
            {ordered.map((row, index) => (
              <li key={row.id} className="adm-reviews__item">
                <span className="adm-reviews__order">{index + 1}</span>

                <button
                  type="button"
                  className="adm-reviews__hit"
                  disabled={busy}
                  onClick={() => setModal({ mode: 'edit', value: { ...row } })}
                >
                  <div className="adm-reviews__line">
                    <ReviewStars rating={row.rating} />
                    <span className="adm-reviews__author">{row.author}</span>
                    {row.treatment ? (
                      <span className="adm-reviews__treatment">{row.treatment}</span>
                    ) : null}
                    <span className="adm-reviews__edit-hint">Edytuj</span>
                  </div>
                  <p className="adm-reviews__excerpt">{excerpt(row.body)}</p>
                </button>

                <div className="adm-reviews__flags">
                  {!row.is_published ? <span className="adm-reviews__flag">Ukryta</span> : null}
                  {row.is_featured ? <span className="adm-reviews__flag adm-reviews__flag--feat">Wyróżniona</span> : null}
                </div>

                <div className="adm-reviews__reorder">
                  <button
                    type="button"
                    className="adm-reviews__arrow"
                    aria-label="Przesuń wyżej na liście"
                    disabled={index === 0 || busy}
                    onClick={() => move(row.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="adm-reviews__arrow"
                    aria-label="Przesuń niżej na liście"
                    disabled={index === ordered.length - 1 || busy}
                    onClick={() => move(row.id, 1)}
                  >
                    ↓
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        className="adm-panel-fab"
        aria-label="Dodaj opinię"
        disabled={busy}
        onClick={openAdd}
      >
        <AdminIcon name="plus" className="adm-panel-fab__icon" />
      </button>

      {modal ? (
        <ReviewsModal
          title={modal.mode === 'add' ? 'Nowa opinia' : 'Opinia klientki'}
          onClose={() => setModal(null)}
        >
          <ReviewForm value={modal.value} onChange={(value) => setModal({ ...modal, value })} />
          <div className="adm-modal__foot">
            <button type="button" className="adm-btn adm-btn--primary" disabled={busy} onClick={saveModal}>
              {modal.mode === 'add' ? 'Dodaj' : 'Zapisz'}
            </button>
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setModal(null)}>
              Anuluj
            </button>
            {modal.mode === 'edit' ? (
              <button
                type="button"
                className="adm-btn adm-btn--quiet adm-reviews__delete"
                disabled={busy}
                onClick={() => remove(modal.value)}
              >
                Usuń
              </button>
            ) : null}
          </div>
        </ReviewsModal>
      ) : null}

      <div className="adm-reviews__status-bar" aria-live="polite">
        {status ? <span className={`adm-status adm-status--${status.kind}`}>{status.text}</span> : null}
      </div>
    </div>
  )
}

export default ReviewsPanel
