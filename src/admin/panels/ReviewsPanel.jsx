import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useContent, useSection } from '../../content/context'
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

function excerpt(text, max = 160) {
  const clean = String(text ?? '').trim().replace(/\s+/g, ' ')
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trim()}…`
}

function formatWhen(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { day: '—', time: '' }

  const day = new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Warsaw',
  }).format(date)
  const time = new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Warsaw',
  }).format(date)

  return { day, time }
}

function moveId(ids, fromId, toId) {
  const from = ids.findIndex((id) => String(id) === String(fromId))
  const to = ids.findIndex((id) => String(id) === String(toId))
  if (from < 0 || to < 0 || from === to) return ids
  const next = [...ids]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
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
    <div className="adm-reviews__rating-field">
      <div className="adm-reviews__star-picker" role="radiogroup" aria-label="Ocena">
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

function treatmentNames(groups) {
  const seen = new Set()
  const names = []

  for (const group of groups ?? []) {
    for (const row of group.rows ?? []) {
      const name = String(row?.name ?? '').trim()
      const key = name.toLocaleLowerCase('pl')
      if (!name || seen.has(key)) continue
      seen.add(key)
      names.push(name)
    }
  }

  return names
}

function ReviewForm({ value, onChange }) {
  const pricing = useSection('pricing')
  const treatments = useMemo(() => treatmentNames(pricing.groups), [pricing.groups])
  const patch = (next) => onChange({ ...value, ...next })

  const published = value.is_published !== false

  return (
    <div className="adm-reviews__form">
      <div className="adm-reviews__rating-row">
        <StarRatingInput value={value.rating} onChange={(rating) => patch({ rating })} />
        <div className="adm-reviews__publish" role="group" aria-label="Widoczność opinii">
          <button
            type="button"
            className={published ? 'is-on' : ''}
            aria-pressed={published}
            onClick={() => patch({ is_published: true })}
          >
            Publiczna
          </button>
          <button
            type="button"
            className={published ? '' : 'is-on'}
            aria-pressed={!published}
            onClick={() => patch({ is_published: false })}
          >
            Prywatna
          </button>
        </div>
      </div>

      <label className="adm-reviews__quote">
        <span className="visually-hidden">Treść opinii</span>
        <textarea
          rows={5}
          value={value.body ?? ''}
          onChange={(event) => patch({ body: event.target.value })}
          placeholder="Treść opinii"
        />
      </label>

      <div className="adm-reviews__who">
        <label>
          <span className="visually-hidden">Imię</span>
          <input
            value={value.author ?? ''}
            onChange={(event) => patch({ author: event.target.value })}
            placeholder="Imię"
          />
        </label>
        <label>
          <span className="visually-hidden">Zabieg</span>
          <input
            list="adm-review-treatments"
            autoComplete="off"
            value={value.treatment ?? ''}
            onChange={(event) => patch({ treatment: event.target.value })}
            placeholder="Zabieg"
          />
          <datalist id="adm-review-treatments">
            {treatments.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
      </div>
    </div>
  )
}

function ReviewsPanel() {
  const { refresh } = useContent()
  const { rows, loading, reload } = useAdminTable('reviews', 'sort_order.asc,created_at.desc')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [modal, setModal] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [orderIds, setOrderIds] = useState(null)
  const dragRef = useRef(null)
  const ignoreClick = useRef(false)
  const orderRef = useRef([])

  const ordered = useMemo(() => {
    const base = sortedRows(rows)
    if (!orderIds) return base
    const byId = new Map(base.map((row) => [row.id, row]))
    const ranked = orderIds.map((id) => byId.get(id)).filter(Boolean)
    const extra = base.filter((row) => !orderIds.includes(row.id))
    return [...ranked, ...extra]
  }, [rows, orderIds])

  orderRef.current = ordered

  const visible = useMemo(() => {
    const byStatus = ordered.filter((row) => {
      const published = row.is_published !== false
      if (filter === 'public') return published
      if (filter === 'private') return !published
      return true
    })
    const needle = query.trim().toLowerCase()
    if (!needle) return byStatus
    return byStatus.filter((row) =>
      [row.author, row.body, row.treatment].some((value) =>
        String(value ?? '').toLowerCase().includes(needle),
      ),
    )
  }, [ordered, query, filter])

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

  const refreshList = async () => {
    setBusy(true)
    await reload()
    await refresh()
    setBusy(false)
  }

  const setVisibility = async (row, published) => {
    if ((row.is_published !== false) === published) return

    setBusy(true)
    const { error } = await supabase.from('reviews').update({ is_published: published }).eq('id', row.id)
    if (error) {
      setStatus({ kind: 'error', text: error.message })
      setBusy(false)
      return
    }

    await afterChange(published ? 'Opinia jest publiczna.' : 'Opinia jest prywatna.')
    setBusy(false)
  }

  const persistOrder = async (ids) => {
    setBusy(true)
    const results = await Promise.all(
      ids.map((id, position) =>
        supabase.from('reviews').update({ sort_order: position + 1 }).eq('id', id),
      ),
    )
    const failed = results.find((result) => result.error)
    if (failed?.error) {
      setOrderIds(null)
      setStatus({ kind: 'error', text: failed.error.message })
      setBusy(false)
      return
    }

    await reload()
    await refresh()
    setOrderIds(null)
    setBusy(false)
  }

  const openRow = (event, row) => {
    if (ignoreClick.current) {
      ignoreClick.current = false
      return
    }
    if (event.target.closest('.adm-reviews__actions')) return
    setModal({ mode: 'edit', value: { ...row } })
  }

  const clearDragMarks = () => {
    document.querySelectorAll('.adm-reviews__item.is-dragging, .adm-reviews__item.is-over').forEach((item) => {
      item.classList.remove('is-dragging', 'is-over')
    })
  }

  const onDragStart = (event, id) => {
    if (event.target.closest('.adm-reviews__actions')) {
      event.preventDefault()
      return
    }
    ignoreClick.current = true
    dragRef.current = id
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(id))
    const row = event.currentTarget
    requestAnimationFrame(() => row.classList.add('is-dragging'))
  }

  const onDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const row = event.currentTarget
    if (row.classList.contains('is-over')) return
    document.querySelectorAll('.adm-reviews__item.is-over').forEach((item) => item.classList.remove('is-over'))
    row.classList.add('is-over')
  }

  const onDrop = (event, id) => {
    event.preventDefault()
    const fromId = event.dataTransfer.getData('text/plain') || dragRef.current
    clearDragMarks()
    dragRef.current = null
    if (!fromId || String(fromId) === String(id)) return
    const ids = moveId(orderRef.current.map((row) => row.id), fromId, id)
    setOrderIds(ids)
    persistOrder(ids)
  }

  const onDragEnd = () => {
    clearDragMarks()
    dragRef.current = null
  }

  return (
    <div className="adm-panel adm-panel--home adm-reviews">
      <div className="adm-reviews__toolbar">
        <div className="adm-reviews__filters" role="group" aria-label="Filtr opinii">
          {[
            ['all', 'Wszystkie opinie'],
            ['public', 'Publiczne'],
            ['private', 'Prywatne'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={filter === id ? 'is-on' : ''}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="adm-reviews__tools">
          <label className="adm-reviews__search">
            <AdminIcon name="search" className="adm-reviews__search-icon" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj opinii"
              aria-label="Szukaj opinii"
            />
          </label>
          <button type="button" className="adm-reviews__reload" disabled={busy} onClick={refreshList}>
            <AdminIcon name="refresh" className="adm-reviews__reload-icon" />
            Odśwież
          </button>
        </div>
      </div>

      <section className="adm-reviews__stage" aria-label="Opinie klientek">
        {loading ? (
          <p className="adm-reviews__empty">Wczytuję…</p>
        ) : ordered.length === 0 ? (
          <p className="adm-reviews__empty">Brak opinii.</p>
        ) : visible.length === 0 ? (
          <p className="adm-reviews__empty">
            {query.trim() ? 'Nic nie pasuje do wyszukiwania.' : 'Brak opinii w tym filtrze.'}
          </p>
        ) : (
          <ul className="adm-reviews__list">
            {visible.map((row) => {
              const when = formatWhen(row.created_at)
              const published = row.is_published !== false

              return (
                <li
                  key={row.id}
                  data-review-id={row.id}
                  draggable
                  className={`adm-reviews__item${published ? '' : ' is-private'}`}
                  onClick={(event) => openRow(event, row)}
                  onDragStart={(event) => onDragStart(event, row.id)}
                  onDragOver={onDragOver}
                  onDrop={(event) => onDrop(event, row.id)}
                  onDragEnd={onDragEnd}
                >
                  <div className="adm-reviews__when">
                    <span className="adm-reviews__date">{when.day}</span>
                    <span className="adm-reviews__time">{when.time}</span>
                  </div>

                  <div className="adm-reviews__person">
                    <span className="adm-reviews__author">{row.author}</span>
                    {row.treatment ? <span className="adm-reviews__treatment">{row.treatment}</span> : null}
                  </div>

                  <div className="adm-reviews__copy">
                    <ReviewStars rating={row.rating} />
                    <p className="adm-reviews__excerpt">{excerpt(row.body)}</p>
                  </div>

                  <div
                    className="adm-reviews__actions"
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <div className="adm-reviews__visibility" role="group" aria-label="Widoczność opinii">
                      <button
                        type="button"
                        className={published ? 'is-on' : ''}
                        aria-pressed={published}
                        disabled={busy}
                        onClick={() => setVisibility(row, true)}
                      >
                        Publiczna
                      </button>
                      <button
                        type="button"
                        className={published ? '' : 'is-on'}
                        aria-pressed={!published}
                        disabled={busy}
                        onClick={() => setVisibility(row, false)}
                      >
                        Prywatna
                      </button>
                    </div>
                    <button
                      type="button"
                      className="adm-reviews__trash"
                      aria-label="Usuń opinię"
                      disabled={busy}
                      onClick={() => remove(row)}
                    >
                      <AdminIcon name="trash" />
                    </button>
                  </div>
                </li>
              )
            })}
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
          <div className="adm-modal__foot adm-reviews__foot">
            <button type="button" className="adm-reviews__save" disabled={busy} onClick={saveModal}>
              {modal.mode === 'add' ? 'Dodaj' : 'Zapisz'}
            </button>
            <button type="button" className="adm-reviews__cancel" onClick={() => setModal(null)}>
              Anuluj
            </button>
            {modal.mode === 'edit' ? (
              <button
                type="button"
                className="adm-reviews__delete"
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
