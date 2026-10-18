import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { isNoticeVisible, useContent } from '../../content/context'
import { useAdminTable } from '../useAdminTable'
import AdminIcon from '../AdminIcon'
import './NoticesPanel.scss'

const kinds = [
  { value: 'info', label: 'Informacja' },
  { value: 'warning', label: 'Zmiana godzin' },
  { value: 'closure', label: 'Gabinet zamknięty' },
]

const kindLabel = Object.fromEntries(kinds.map((item) => [item.value, item.label]))

const emptyNotice = {
  message: '',
  kind: 'info',
  starts_at: null,
  ends_at: null,
  is_active: true,
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function splitLocal(iso) {
  if (!iso) return { date: '', time: '' }

  const date = new Date(iso)
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

function combineLocal(date, time) {
  if (!date) return null
  const clock = time || '00:00'
  return new Date(`${date}T${clock}`).toISOString()
}

function formatWhen(iso) {
  if (!iso) return null

  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function scheduleSummary(notice) {
  const from = formatWhen(notice.starts_at)
  const to = formatWhen(notice.ends_at)

  if (!from && !to) return 'Od razu · bez końca'
  if (from && !to) return `Od ${from}`
  if (!from && to) return `Do ${to}`
  return `${from} → ${to}`
}

function noticeStatus(notice) {
  if (!notice.is_active) return { key: 'off', label: 'Wyłączony' }

  const now = Date.now()
  const starts = notice.starts_at ? new Date(notice.starts_at).getTime() : null
  const ends = notice.ends_at ? new Date(notice.ends_at).getTime() : null

  if (starts && starts > now) return { key: 'scheduled', label: 'Zaplanowany' }
  if (ends && ends < now) return { key: 'ended', label: 'Zakończony' }
  if (isNoticeVisible(notice, now)) return { key: 'live', label: 'Na stronie' }
  return { key: 'off', label: 'Niewidoczny' }
}

function excerpt(text, max = 140) {
  const clean = String(text ?? '').trim().replace(/\s+/g, ' ')
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trim()}…`
}

function NoticesModal({ title, children, onClose }) {
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
        className="adm-modal__panel adm-modal__panel--notices"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-notices-modal-title"
      >
        <header className="adm-modal__head">
          <h2 id="adm-notices-modal-title" className="adm-modal__title">
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

function NoticeForm({ value, onChange }) {
  const patch = (next) => onChange({ ...value, ...next })
  const start = splitLocal(value.starts_at)
  const end = splitLocal(value.ends_at)

  const setStart = (date, time) => patch({ starts_at: combineLocal(date, time) })
  const setEnd = (date, time) => patch({ ends_at: combineLocal(date, time) })

  return (
    <div className="adm-notices__modal-layout">
      <div className="adm-notices__modal-main">
        <label className="adm-field">
          <span className="adm-field__label">Treść komunikatu</span>
          <textarea
            className="adm-input adm-input--area adm-notices__modal-message"
            rows={2}
            value={value.message ?? ''}
            onChange={(event) => patch({ message: event.target.value })}
            placeholder="np. W piątek 12.09 gabinet zamykamy o 15:00."
          />
        </label>

        <label className="adm-field">
          <span className="adm-field__label">Rodzaj</span>
          <select
            className="adm-input adm-notices__kind"
            value={value.kind ?? 'info'}
            onChange={(event) => patch({ kind: event.target.value })}
          >
            {kinds.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-field adm-field--check adm-notices__active">
          <input
            type="checkbox"
            checked={Boolean(value.is_active)}
            onChange={(event) => patch({ is_active: event.target.checked })}
          />
          <span>Włączony (może pojawić się na stronie)</span>
        </label>
      </div>

      <div className="adm-notices__modal-schedule">
        <div className="adm-notices__date-tile">
          <span className="adm-notices__date-label">Pokazuj od</span>
          <div className="adm-notices__date-inputs adm-notices__date-inputs--row">
            <input
              type="date"
              className="adm-input adm-notices__date"
              value={start.date}
              onChange={(event) => setStart(event.target.value, start.time)}
            />
            <input
              type="time"
              className="adm-input adm-notices__time"
              value={start.time}
              onChange={(event) => setStart(start.date, event.target.value)}
              disabled={!start.date}
            />
          </div>
          <span className="adm-notices__date-hint">Puste = od razu</span>
        </div>

        <div className="adm-notices__date-tile">
          <span className="adm-notices__date-label">Ukryj po</span>
          <div className="adm-notices__date-inputs adm-notices__date-inputs--row">
            <input
              type="date"
              className="adm-input adm-notices__date"
              value={end.date}
              onChange={(event) => setEnd(event.target.value, end.time)}
            />
            <input
              type="time"
              className="adm-input adm-notices__time"
              value={end.time}
              onChange={(event) => setEnd(end.date, event.target.value)}
              disabled={!end.date}
            />
          </div>
          <span className="adm-notices__date-hint">Puste = bez końca</span>
        </div>
      </div>
    </div>
  )
}

function NoticesPanel() {
  const { refresh } = useContent()
  const { rows, loading, reload } = useAdminTable('notices', 'created_at.desc')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [modal, setModal] = useState(null)

  const ordered = useMemo(() => [...rows], [rows])

  const afterChange = async (text) => {
    await reload()
    await refresh()
    setStatus({ kind: 'ok', text })
  }

  const openAdd = () => setModal({ mode: 'add', value: { ...emptyNotice } })

  const saveModal = async () => {
    if (!modal) return
    const value = modal.value
    const message = String(value.message ?? '').trim()

    if (!message) {
      setStatus({ kind: 'error', text: 'Treść komunikatu nie może być pusta.' })
      return
    }

    setBusy(true)

    const payload = {
      message,
      kind: value.kind ?? 'info',
      starts_at: value.starts_at || null,
      ends_at: value.ends_at || null,
      is_active: Boolean(value.is_active),
    }

    if (modal.mode === 'add') {
      const { error } = await supabase.from('notices').insert(payload)
      if (error) {
        setStatus({ kind: 'error', text: error.message })
        setBusy(false)
        return
      }
      setModal(null)
      await afterChange('Komunikat dodany.')
    } else {
      const { error } = await supabase.from('notices').update(payload).eq('id', value.id)
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
    if (!window.confirm('Usunąć ten komunikat?')) return

    const { error } = await supabase.from('notices').delete().eq('id', row.id)

    if (error) {
      setStatus({ kind: 'error', text: error.message })
      return
    }

    setModal(null)
    await afterChange('Komunikat usunięty.')
  }

  return (
    <div className="adm-panel adm-panel--home adm-notices">
      <section className="adm-notices__stage" aria-label="Lista komunikatów">
        {loading ? (
          <p className="adm-notices__empty">Wczytuję…</p>
        ) : ordered.length === 0 ? (
          <p className="adm-notices__empty">
            Brak komunikatów — dodaj pierwszy plusem w rogu (np. urlop lub zmiana godzin).
          </p>
        ) : (
          <ul className="adm-notices__list">
            {ordered.map((row) => {
              const statusMeta = noticeStatus(row)

              return (
                <li key={row.id} className={`adm-notices__item adm-notices__item--${row.kind}`}>
                  <button
                    type="button"
                    className="adm-notices__hit"
                    disabled={busy}
                    onClick={() => setModal({ mode: 'edit', value: { ...row } })}
                  >
                    <div className="adm-notices__line">
                      <span className={`adm-notices__kind adm-notices__kind--${row.kind}`}>
                        {kindLabel[row.kind] ?? row.kind}
                      </span>
                      <span className={`adm-notices__status adm-notices__status--${statusMeta.key}`}>
                        {statusMeta.label}
                      </span>
                      <span className="adm-notices__edit-hint">Edytuj</span>
                    </div>
                    <p className="adm-notices__message">{excerpt(row.message)}</p>
                    <p className="adm-notices__when">{scheduleSummary(row)}</p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <button
        type="button"
        className="adm-panel-fab"
        aria-label="Dodaj komunikat"
        disabled={busy}
        onClick={openAdd}
      >
        <AdminIcon name="plus" className="adm-panel-fab__icon" />
      </button>

      {modal ? (
        <NoticesModal
          title={modal.mode === 'add' ? 'Nowy komunikat' : 'Edytuj komunikat'}
          onClose={() => setModal(null)}
        >
          <NoticeForm value={modal.value} onChange={(value) => setModal({ ...modal, value })} />
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
                className="adm-btn adm-btn--quiet adm-notices__delete"
                disabled={busy}
                onClick={() => remove(modal.value)}
              >
                Usuń
              </button>
            ) : null}
          </div>
        </NoticesModal>
      ) : null}

      <div className="adm-notices__status-bar" aria-live="polite">
        {status ? <span className={`adm-status adm-status--${status.kind}`}>{status.text}</span> : null}
      </div>
    </div>
  )
}

export default NoticesPanel
