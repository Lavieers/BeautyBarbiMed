import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { useContent } from '../../content/context'
import { useAdminTable } from '../useAdminTable'
import AdminIcon from '../AdminIcon'
import './NoticesPanel.scss'

const kinds = [
  {
    value: 'info',
    label: 'Informacja',
    suggestion:
      '„Szukasz chwili dla siebie w tym tygodniu? Sprawdź ostatnie wolne terminy w naszym kalendarzu online!',
  },
  {
    value: 'warning',
    label: 'Zmiana godzin',
    suggestion: 'Informujemy, że w dniu [Data] wyjątkowo pracujemy w godzinach [np. 08:00 – 14:00].',
  },
  {
    value: 'closure',
    label: 'Gabinet zamknięty',
    suggestion:
      'W dniu [Data] drzwi gabinetu będą zamknięte – przepraszamy za utrudnienia i z niecierpliwością czekamy na Was od [Data]!',
  },
]

const suggestions = Object.fromEntries(kinds.map((item) => [item.value, item.suggestion]))
const suggestionTexts = new Set(kinds.map((item) => item.suggestion))

const kindLabel = Object.fromEntries(kinds.map((item) => [item.value, item.label]))

const emptyNotice = {
  message: suggestions.info,
  kind: 'info',
  starts_at: null,
  ends_at: null,
  is_active: true,
}

function pad(value) {
  return String(value).padStart(2, '0')
}

// Ten sam zakres co godziny otwarcia w danych firmy, co 10 minut.
const TIME_OPTIONS = Array.from({ length: ((22 - 6) * 60) / 10 + 1 }, (_, index) => {
  const minutes = 6 * 60 + index * 10
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
})

function timeChoices(value) {
  if (value && /^\d{2}:\d{2}$/.test(value) && !TIME_OPTIONS.includes(value)) {
    return [...TIME_OPTIONS, value].sort()
  }
  return TIME_OPTIONS
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

function formatParts(iso) {
  if (!iso) return null

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

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

  return `${day} ${time}`
}

function noticeStatus(notice, now = Date.now()) {
  const starts = notice.starts_at ? new Date(notice.starts_at).getTime() : NaN
  const ends = notice.ends_at ? new Date(notice.ends_at).getTime() : NaN

  if (starts > now) return { key: 'scheduled', label: 'Zaplanowany' }
  if (ends < now) return { key: 'ended', label: 'Zakończony' }
  return { key: 'live', label: 'Na stronie' }
}

function saveErrorText(error) {
  if (/row-level security/i.test(error?.message ?? '')) {
    return 'Zapis odrzucony, bo to urządzenie nie jest zalogowane do panelu. Zaloguj się i spróbuj ponownie.'
  }
  return error?.message ?? 'Nie udało się zapisać.'
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

const MONTHS = [
  'styczeń',
  'luty',
  'marzec',
  'kwiecień',
  'maj',
  'czerwiec',
  'lipiec',
  'sierpień',
  'wrzesień',
  'październik',
  'listopad',
  'grudzień',
]
const WEEKDAYS = ['pon', 'wt', 'śr', 'czw', 'pią', 'sob', 'nie']

function formatDateLabel(value) {
  const [year, month, day] = String(value || '').split('-')
  if (!year || !month || !day) return ''
  return `${day}.${month}.${year}`
}

function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function monthCells(year, month) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  return [...Array(lead).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)]
}

function DateField({ label, value, onChange }) {
  const selected = value || ''
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(null)
  const [cursor, setCursor] = useState(() => {
    const parsed = selected ? new Date(`${selected}T12:00:00`) : new Date()
    return { year: parsed.getFullYear(), month: parsed.getMonth() }
  })
  const rootRef = useRef(null)
  const popRef = useRef(null)

  const place = () => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = 264
    let left = rect.left
    if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - 8 - width)
    const height = 320
    const roomBelow = window.innerHeight - rect.bottom - 12
    const roomAbove = rect.top - 12
    const openUp = roomBelow < height && roomAbove > roomBelow
    const next = {
      left,
      width,
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
    }
    setMenu((current) => {
      if (current && current.left === next.left && current.top === next.top && current.bottom === next.bottom) return current
      return next
    })
  }

  useEffect(() => {
    if (!open) return undefined
    place()
    const onPlace = () => place()
    window.addEventListener('resize', onPlace)
    window.addEventListener('scroll', onPlace, true)
    return () => {
      window.removeEventListener('resize', onPlace)
      window.removeEventListener('scroll', onPlace, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (rootRef.current?.contains(event.target) || popRef.current?.contains(event.target)) return
      setOpen(false)
    }
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      rootRef.current?.querySelector('button')?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  const show = (next) => {
    const parsed = next ? new Date(`${next}T12:00:00`) : new Date()
    setCursor({ year: parsed.getFullYear(), month: parsed.getMonth() })
    setOpen(true)
  }

  const choose = (next) => {
    onChange(next)
    setOpen(false)
  }

  const shiftMonth = (step) => {
    setCursor((current) => {
      const date = new Date(current.year, current.month + step, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
  }

  const cells = monthCells(cursor.year, cursor.month)
  const today = todayIso()

  return (
    <div className="adm-notices__date" ref={rootRef}>
      <button
        type="button"
        className={`adm-notices__date-trigger${selected ? '' : ' is-empty'}`}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show(selected))}
      >
        <span>{formatDateLabel(selected) || 'dd.mm.rrrr'}</span>
        <svg className="adm-notices__date-icon" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2.2" y="3.2" width="11.6" height="10.4" rx="1.4" />
          <path d="M2.2 6.4h11.6M5.2 1.8v2.6M10.8 1.8v2.6" />
        </svg>
      </button>
      {open && menu
        ? createPortal(
            <div
              ref={popRef}
              className="adm-notices__date-pop"
              role="dialog"
              aria-label={label}
              style={{ left: menu.left, width: menu.width, top: menu.top, bottom: menu.bottom }}
            >
              <div className="adm-notices__date-head">
                <button type="button" aria-label="Poprzedni miesiąc" onClick={() => shiftMonth(-1)}>
                  ‹
                </button>
                <strong>
                  {MONTHS[cursor.month]} {cursor.year}
                </strong>
                <button type="button" aria-label="Następny miesiąc" onClick={() => shiftMonth(1)}>
                  ›
                </button>
              </div>
              <div className="adm-notices__date-week">
                {WEEKDAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="adm-notices__date-grid">
                {cells.map((day, index) => {
                  if (!day) return <span key={`empty-${index}`} />
                  const iso = `${cursor.year}-${pad(cursor.month + 1)}-${pad(day)}`
                  const className = `adm-notices__date-day${iso === selected ? ' is-selected' : ''}${iso === today ? ' is-today' : ''}`
                  return (
                    <button key={iso} type="button" className={className} onClick={() => choose(iso)}>
                      {day}
                    </button>
                  )
                })}
              </div>
              <div className="adm-notices__date-foot">
                <button type="button" onClick={() => choose('')}>
                  Wyczyść
                </button>
                <button type="button" onClick={() => choose(today)}>
                  Dzisiaj
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function TimeSelect({ label, date, time, onChange }) {
  const listed = time && time !== '00:00' ? time : ''
  const options = useMemo(() => ['', ...timeChoices(listed)], [listed])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(listed)
  const [menu, setMenu] = useState(null)
  const rootRef = useRef(null)
  const listRef = useRef(null)

  const place = () => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.max(rect.width, 132)
    let left = rect.left
    if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - 8 - width)
    const roomBelow = window.innerHeight - rect.bottom - 12
    const roomAbove = rect.top - 12
    const openUp = roomBelow < 140 && roomAbove > roomBelow
    const next = {
      left,
      width,
      maxHeight: Math.max(120, Math.min(216, openUp ? roomAbove : roomBelow)),
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
    }
    setMenu((current) => {
      if (
        current &&
        current.left === next.left &&
        current.width === next.width &&
        current.maxHeight === next.maxHeight &&
        current.top === next.top &&
        current.bottom === next.bottom
      ) {
        return current
      }
      return next
    })
  }

  useEffect(() => {
    if (!open) return undefined
    place()
    const onPlace = () => place()
    window.addEventListener('resize', onPlace)
    window.addEventListener('scroll', onPlace, true)
    return () => {
      window.removeEventListener('resize', onPlace)
      window.removeEventListener('scroll', onPlace, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    let frame = 0
    const focus = () => {
      if (!listRef.current) {
        frame = window.requestAnimationFrame(focus)
        return
      }
      listRef.current.focus()
      listRef.current.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'center' })
    }
    frame = window.requestAnimationFrame(focus)
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (rootRef.current?.contains(event.target) || listRef.current?.contains(event.target)) return
      setOpen(false)
    }
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      close()
    }
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    rootRef.current?.querySelector('button')?.focus()
  }

  const choose = (value) => {
    onChange(date, value)
    close()
  }

  const move = (step) => {
    const index = Math.max(0, options.indexOf(active))
    const next = options[Math.min(options.length - 1, Math.max(0, index + step))]
    setActive(next)
    const node = listRef.current?.querySelector(`[data-value="${next}"]`)
    node?.scrollIntoView({ block: 'nearest' })
  }

  return (
    <div className="adm-notices__time" ref={rootRef}>
      <button
        type="button"
        className="adm-notices__time-trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={!date}
        onClick={() => {
          if (!date) return
          setActive(listed)
          setOpen((value) => !value)
        }}
        onKeyDown={(event) => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            setActive(listed)
            setOpen(true)
          }
        }}
      >
        {listed || '—'}
      </button>
      {open && menu
        ? createPortal(
            <ul
              ref={listRef}
              className="adm-notices__time-menu"
              role="listbox"
              tabIndex={-1}
              aria-label={label}
              style={{
                left: menu.left,
                width: menu.width,
                maxHeight: menu.maxHeight,
                top: menu.top,
                bottom: menu.bottom,
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  move(1)
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  move(-1)
                } else if (event.key === 'Enter') {
                  event.preventDefault()
                  choose(active)
                }
              }}
            >
              {options.map((option) => {
                const selected = option !== '' && option === listed
                const current = option === active
                return (
                  <li key={option || 'empty'} role="presentation">
                    <button
                      type="button"
                      role="option"
                      data-value={option}
                      className={`adm-notices__time-option${selected ? ' is-selected' : ''}${current ? ' is-active' : ''}`}
                      aria-selected={selected}
                      onMouseEnter={() => setActive(option)}
                      onClick={() => choose(option)}
                    >
                      {option || '—'}
                    </button>
                  </li>
                )
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}

function NoticeForm({ value, onChange }) {
  const patch = (next) => onChange({ ...value, ...next })
  const start = splitLocal(value.starts_at)
  const end = splitLocal(value.ends_at)
  const kind = value.kind ?? 'info'

  const setStart = (date, time) => patch({ starts_at: combineLocal(date, time) })
  const setEnd = (date, time) => patch({ ends_at: combineLocal(date, time) })

  const chooseKind = (nextKind) => {
    const current = String(value.message ?? '')
    const next = { kind: nextKind }
    if (!current.trim() || suggestionTexts.has(current)) next.message = suggestions[nextKind]
    patch(next)
  }

  return (
    <div className="adm-notices__form">
      <div className="adm-notices__kinds" role="group" aria-label="Rodzaj komunikatu">
        {kinds.map((item) => (
          <button
            key={item.value}
            type="button"
            className={kind === item.value ? 'is-on' : ''}
            aria-pressed={kind === item.value}
            onClick={() => chooseKind(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="adm-notices__message-field">
        <span className="adm-notices__span-label">Treść komunikatu</span>
        <textarea
          rows={4}
          value={value.message ?? ''}
          onChange={(event) => patch({ message: event.target.value })}
          placeholder={suggestions[kind] ?? suggestions.info}
        />
      </label>

      <div className="adm-notices__schedule">
          <div className="adm-notices__span">
            <span className="adm-notices__span-label">Pokazuj od</span>
            <div className="adm-notices__span-inputs">
              <DateField
                label="Data rozpoczęcia"
                value={start.date}
                onChange={(next) => setStart(next, start.time)}
              />
              <TimeSelect label="Godzina rozpoczęcia" date={start.date} time={start.time} onChange={setStart} />
            </div>
          </div>
          <div className="adm-notices__span">
            <span className="adm-notices__span-label">Ukryj po</span>
            <div className="adm-notices__span-inputs">
              <DateField
                label="Data zakończenia"
                value={end.date}
                onChange={(next) => setEnd(next, end.time)}
              />
              <TimeSelect label="Godzina zakończenia" date={end.date} time={end.time} onChange={setEnd} />
            </div>
          </div>
          <p className="adm-notices__hint">Domyślnie komunikat wyświetli się od razu i pozostanie widoczny na stałe.</p>
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
  const [filter, setFilter] = useState('all')
  const [now, setNow] = useState(() => Date.now())

  const ordered = useMemo(() => [...rows], [rows])

  const visible = useMemo(() => {
    if (filter === 'all') return ordered
    return ordered.filter((row) => {
      const key = noticeStatus(row, now).key
      if (filter === 'current') return key === 'live' || key === 'scheduled'
      if (filter === 'past') return key === 'ended'
      return true
    })
  }, [ordered, filter, now])

  const afterChange = async (text) => {
    await reload()
    await refresh()
    setStatus({ kind: 'ok', text })
  }

  const openAdd = () => {
    setStatus(null)
    setModal({ mode: 'add', value: { ...emptyNotice } })
  }

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
      is_active: true,
    }

    if (modal.mode === 'add') {
      const { error } = await supabase.from('notices').insert(payload)
      if (error) {
        setStatus({ kind: 'error', text: saveErrorText(error) })
        setBusy(false)
        return
      }
      setModal(null)
      await afterChange('Komunikat dodany.')
    } else {
      const { error } = await supabase.from('notices').update(payload).eq('id', value.id)
      if (error) {
        setStatus({ kind: 'error', text: saveErrorText(error) })
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

  useEffect(() => {
    const current = Date.now()
    let next = null

    for (const row of rows) {
      for (const iso of [row.starts_at, row.ends_at]) {
        const time = iso ? new Date(iso).getTime() : NaN
        if (time > current && (next == null || time < next)) next = time
      }
    }

    if (next == null) return undefined

    const id = window.setTimeout(() => setNow(Date.now()), next - current + 200)
    return () => window.clearTimeout(id)
  }, [rows, now])

  return (
    <div className="adm-panel adm-panel--home adm-notices">
      <div className="adm-notices__toolbar">
        <div className="adm-notices__filters" role="group" aria-label="Filtr komunikatów">
          {[
            ['all', 'Wszystkie komunikaty'],
            ['current', 'Nadchodzące i aktualne'],
            ['past', 'Zakończone'],
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
      </div>

      <section className="adm-notices__stage" aria-label="Lista komunikatów">
        {loading ? (
          <p className="adm-notices__empty">Wczytuję…</p>
        ) : ordered.length === 0 ? (
          <p className="adm-notices__empty">Brak komunikatów.</p>
        ) : visible.length === 0 ? (
          <p className="adm-notices__empty">Brak komunikatów w tym filtrze.</p>
        ) : (
          <ul className="adm-notices__list">
            {visible.map((row) => {
              const statusMeta = noticeStatus(row, now)

              return (
                <li
                  key={row.id}
                  className="adm-notices__item"
                  onClick={() => {
                    if (busy) return
                    setStatus(null)
                    setModal({ mode: 'edit', value: { ...row } })
                  }}
                >
                  <div className="adm-notices__when">
                    <span className="adm-notices__date">{formatParts(row.starts_at) ?? 'Od razu'}</span>
                    <span className="adm-notices__until">{formatParts(row.ends_at) ?? 'Bez końca'}</span>
                  </div>

                  <div className="adm-notices__meta">
                    <span className="adm-notices__kind">{kindLabel[row.kind] ?? row.kind}</span>
                    <span className="adm-notices__state">{statusMeta.label}</span>
                  </div>

                  <div className="adm-notices__message">
                    <p>{excerpt(row.message)}</p>
                  </div>

                  <div
                    className="adm-notices__actions"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="adm-notices__trash"
                      aria-label="Usuń komunikat"
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
        aria-label="Dodaj komunikat"
        disabled={busy}
        onClick={openAdd}
      >
        <AdminIcon name="plus" className="adm-panel-fab__icon" />
      </button>

      {modal ? (
        <NoticesModal
          title={modal.mode === 'add' ? 'Nowy komunikat' : 'Komunikat'}
          onClose={() => setModal(null)}
        >
          <NoticeForm value={modal.value} onChange={(value) => setModal({ ...modal, value })} />
          <div className="adm-modal__foot adm-notices__foot">
            {status?.kind === 'error' ? (
              <p className="adm-notices__form-error" role="alert">
                {status.text}
              </p>
            ) : null}
            <button type="button" className="adm-notices__save" disabled={busy} onClick={saveModal}>
              {modal.mode === 'add' ? 'Dodaj' : 'Zapisz'}
            </button>
            <button type="button" className="adm-notices__cancel" onClick={() => setModal(null)}>
              Anuluj
            </button>
            {modal.mode === 'edit' ? (
              <button
                type="button"
                className="adm-notices__delete"
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
