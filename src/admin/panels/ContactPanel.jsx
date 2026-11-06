import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { contactDefaults } from '../../data/defaults'
import { useContent } from '../../content/context'
import { parseHoursLine } from '../../lib/hours'
import { defaultMapEmbedSrc, mapEmbedSrc } from '../../lib/mapEmbed'
import AdminIcon from '../AdminIcon'
import './ContactPanel.scss'

const DAYS = [
  ['pon', 'Poniedziałek'],
  ['wt', 'Wtorek'],
  ['sr', 'Środa'],
  ['czw', 'Czwartek'],
  ['pt', 'Piątek'],
  ['sob', 'Sobota'],
  ['nd', 'Niedziela'],
]

const DAY_INDEX = Object.fromEntries(DAYS.map(([id], index) => [id, index]))

const DAY_ID = {
  pon: 'pon',
  poniedziałek: 'pon',
  poniedzialek: 'pon',
  wt: 'wt',
  wtorek: 'wt',
  śr: 'sr',
  sr: 'sr',
  środa: 'sr',
  sroda: 'sr',
  czw: 'czw',
  czwartek: 'czw',
  pt: 'pt',
  piątek: 'pt',
  piatek: 'pt',
  sob: 'sob',
  sobota: 'sob',
  niedz: 'nd',
  ndz: 'nd',
  nd: 'nd',
  niedziela: 'nd',
}

const TIME_PAIR = /^(\d{2}:\d{2})\s*[–—-]\s*(\d{2}:\d{2})$/

const TIME_OPTIONS = Array.from({ length: 33 }, (_, index) => {
  const minutes = 6 * 60 + index * 30
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})

function dayId(value) {
  return DAY_ID[String(value ?? '').trim().toLowerCase().replace(/\./g, '')] || ''
}

function dayName(id, lower = false) {
  const found = DAYS.find(([key]) => key === id)
  if (!found) return ''
  return lower ? found[1].toLowerCase() : found[1]
}

function timeChoices(value) {
  if (value && /^\d{2}:\d{2}$/.test(value) && !TIME_OPTIONS.includes(value)) {
    return [...TIME_OPTIONS, value].sort()
  }
  return TIME_OPTIONS
}

function parseDayRange(days) {
  const ids = String(days ?? '')
    .split(/\s*[–—-]\s*/)
    .map((part) => dayId(part))
    .filter(Boolean)

  if (ids.length === 1) return { start: ids[0], end: '' }
  if (ids.length >= 2) return { start: ids[0], end: ids[1] }
  return { start: '', end: '' }
}

function daysLabel(row) {
  if (!row.start) return ''
  if (row.end && row.end !== row.start) return `${dayName(row.start)} – ${dayName(row.end, true)}`
  return dayName(row.start)
}

function toHourRow(line) {
  const parsed = parseHoursLine(line)
  const days = parseDayRange(parsed.days)
  if (parsed.closed) return { ...days, from: '', to: '', closed: true }

  const match = String(parsed.time).match(TIME_PAIR)
  if (match) return { ...days, from: match[1], to: match[2], closed: false }

  return { ...days, from: '', to: '', closed: false }
}

function fromHourRow(row) {
  const days = daysLabel(row)
  if (row.closed) return days ? `${days}: nieczynne` : ''
  if (!days && !row.from && !row.to) return ''

  const time = row.from && row.to ? `${row.from} – ${row.to}` : ''
  if (!days) return time
  if (!time) return days
  return `${days}: ${time}`
}

function isBlankHour(row) {
  return !row.start && !row.end && !row.from && !row.to && !row.closed
}

function hoursProblem(lines) {
  const rows = (Array.isArray(lines) ? lines : []).map((line) => toHourRow(String(line ?? '')))

  for (const row of rows) {
    if (isBlankHour(row)) continue
    if (!row.start) return 'Wybierz dzień otwarcia.'
    if (row.end && DAY_INDEX[row.end] < DAY_INDEX[row.start]) {
      return 'Koniec zakresu musi być późniejszy niż początek.'
    }
    if (row.closed) continue
    if (!row.from || !row.to) return 'Podaj godzinę otwarcia i zamknięcia.'
    if (row.from >= row.to) return 'Zamknięcie musi być późniejsze niż otwarcie.'
  }

  return null
}

function cleanLink(value) {
  const compact = String(value ?? '').replace(/[\s\u00a0]+/g, '')
  if (!compact) return ''

  const hasProtocol = /^[a-z][a-z\d+.-]*:/i.test(compact)

  try {
    const parsed = new URL(hasProtocol ? compact : `https://${compact}`)
    const drop = new Set(['locale', 'fbclid', 'mibextid'])
    for (const key of [...parsed.searchParams.keys()]) {
      const name = key.toLowerCase()
      if (drop.has(name) || name.startsWith('utm_')) parsed.searchParams.delete(key)
    }

    if (!hasProtocol) {
      const query = parsed.searchParams.toString()
      const path = parsed.pathname === '/' ? '' : parsed.pathname
      return `${parsed.host}${path}${query ? `?${query}` : ''}`
    }

    if (parsed.pathname === '/' && !/[/?#]$/.test(compact)) parsed.pathname = ''
    return parsed.href
  } catch {
    return compact
  }
}

function phoneToHref(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return contactDefaults.phoneHref

  const normalized = digits.startsWith('48') ? digits : `48${digits}`
  return `tel:+${normalized}`
}

function HoursEditor({ value, onChange }) {
  const list = (Array.isArray(value) ? value : []).map((line) => String(line ?? ''))
  const sourceKey = JSON.stringify(list)
  const [rows, setRows] = useState(() => list.map(toHourRow))
  const emitted = useRef(sourceKey)

  useEffect(() => {
    if (emitted.current === sourceKey) return
    emitted.current = sourceKey
    setRows(JSON.parse(sourceKey).map(toHourRow))
  }, [sourceKey])

  const commit = (next) => {
    const lines = next.map(fromHourRow)
    emitted.current = JSON.stringify(lines)
    setRows(next)
    onChange(lines)
  }

  return (
    <>
    <div className="adm-contact__hours adm-contact__block adm-contact__block--hours">
      <span className="adm-field__label">Godziny otwarcia</span>
      <ul className="adm-contact__schedule">
        {rows.map((row, index) => {
          const laterDays = DAYS.filter(([id]) => row.start && DAY_INDEX[id] > DAY_INDEX[row.start])

          return (
            <li key={index} className="adm-contact__schedule-row">
              <div className="adm-contact__schedule-days">
                <select
                  className="adm-input"
                  aria-label="Od dnia"
                  value={row.start}
                  onChange={(event) => {
                    const start = event.target.value
                    const end = row.end && start && DAY_INDEX[row.end] > DAY_INDEX[start] ? row.end : ''
                    commit(rows.map((item, position) => (position === index ? { ...item, start, end } : item)))
                  }}
                >
                  <option value="">—</option>
                  {DAYS.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <span className="adm-contact__schedule-dash" aria-hidden="true">
                  –
                </span>
                <select
                  className="adm-input"
                  aria-label="Do dnia"
                  value={row.end}
                  disabled={!row.start || laterDays.length === 0}
                  onChange={(event) =>
                    commit(
                      rows.map((item, position) =>
                        position === index ? { ...item, end: event.target.value } : item,
                      ),
                    )
                  }
                >
                  <option value="">—</option>
                  {laterDays.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="adm-contact__trash"
                aria-label="Usuń godziny"
                onClick={() => {
                  if (!window.confirm('Na pewno usunąć te godziny?')) return
                  commit(rows.filter((_, position) => position !== index))
                }}
              >
                <AdminIcon name="trash" />
              </button>
              <div className={`adm-contact__schedule-times${row.closed ? ' is-closed' : ''}`}>
                <select
                  className="adm-input"
                  aria-label="Otwarcie"
                  value={row.from}
                  disabled={row.closed}
                  onChange={(event) =>
                    commit(
                      rows.map((item, position) =>
                        position === index ? { ...item, from: event.target.value } : item,
                      ),
                    )
                  }
                >
                  <option value="">—</option>
                  {timeChoices(row.from).map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <span className="adm-contact__schedule-dash" aria-hidden="true">
                  –
                </span>
                <select
                  className="adm-input"
                  aria-label="Zamknięcie"
                  value={row.to}
                  disabled={row.closed}
                  onChange={(event) =>
                    commit(
                      rows.map((item, position) =>
                        position === index ? { ...item, to: event.target.value } : item,
                      ),
                    )
                  }
                >
                  <option value="">—</option>
                  {timeChoices(row.to).map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={`adm-contact__closed${row.closed ? ' is-on' : ''}`}
                  aria-pressed={row.closed}
                  onClick={() =>
                    commit(
                      rows.map((item, position) =>
                        position === index ? { ...item, closed: !item.closed } : item,
                      ),
                    )
                  }
                >
                  nieczynne
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
    <button
      type="button"
      className="adm-btn adm-btn--ghost adm-contact__add-line"
      onClick={() => commit([...rows, { start: '', end: '', from: '', to: '', closed: false }])}
    >
      <AdminIcon name="plus" className="adm-contact__add-icon" />
      Dodaj godziny
    </button>
    </>
  )
}

function openableLink(value) {
  const clean = cleanLink(value)
  if (!clean) return ''
  if (/^[a-z][a-z\d+.-]*:/i.test(clean)) return clean

  try {
    return new URL(`https://${clean}`).href
  } catch {
    return ''
  }
}

function SocialField({ icon, label, value, onChange, placeholder }) {
  const href = openableLink(value)

  return (
    <div className="adm-contact__social-field">
      <span className="adm-contact__social-icon-wrap" aria-hidden="true">
        <AdminIcon name={icon} className="adm-contact__social-icon" />
      </span>
      <input
        className="adm-input"
        aria-label={label}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
      />
      <a
        className="adm-contact__check"
        href={href || undefined}
        target="_blank"
        rel="noreferrer"
        aria-label={`Sprawdź ${label}`}
        aria-disabled={href ? undefined : true}
        onClick={(event) => {
          if (!href) event.preventDefault()
        }}
      >
        <AdminIcon name="external" className="adm-contact__check-icon" />
      </a>
    </div>
  )
}

function ContactPanel() {
  const { contact, refresh } = useContent()
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState(null)

  const saved = { ...contactDefaults, ...contact }
  const data = draft ?? saved

  const patch = (next) => {
    setDraft({ ...data, ...next })
    setStatus((current) => (current?.kind === 'busy' ? current : null))
  }

  const save = async () => {
    const problem = hoursProblem(data.hours)
    if (problem) {
      setStatus({ kind: 'error', text: problem })
      return
    }

    setStatus({ kind: 'busy', text: 'Zapisuję…' })

    const payload = {
      ...saved,
      ...data,
      phoneHref: phoneToHref(data.phone),
      facebook: cleanLink(data.facebook),
      instagram: cleanLink(data.instagram),
      booksy: cleanLink(data.booksy),
      hours: (Array.isArray(data.hours) ? data.hours : []).map((line) => String(line ?? '').trim()).filter(Boolean),
      parking: '',
      entranceImage: '',
      entranceImageAlt: '',
      mapEmbedUrl: mapEmbedSrc(data.mapEmbedUrl) || defaultMapEmbedSrc,
    }

    const { error } = await supabase.from('site_settings').update({ contact: payload }).eq('id', 1)

    if (error) {
      setStatus({ kind: 'error', text: error.message })
      return
    }

    await refresh()
    setDraft(null)
    setStatus({ kind: 'ok', text: 'Zapisane.' })
  }

  return (
    <div className="adm-panel adm-panel--home adm-contact">
      <div className="adm-contact__body">
        <section className="adm-contact__window adm-contact__window--details" aria-label="Adres, telefon i rezerwacje">
          <div className="adm-contact__main">
            <label className="adm-field">
              <span className="adm-field__label">Adres</span>
              <input
                className="adm-input"
                value={data.address ?? ''}
                onChange={(event) => patch({ address: event.target.value })}
              />
            </label>
            <label className="adm-field">
              <span className="adm-field__label">Telefon</span>
              <input
                className="adm-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={data.phone ?? ''}
                onChange={(event) => patch({ phone: event.target.value })}
                placeholder="+48 501 280 578"
              />
            </label>
            <div className="adm-contact__social adm-contact__block adm-contact__block--social">
              <span className="adm-field__label">Media i rezerwacje</span>
              <SocialField
                icon="facebook"
                label="Facebook"
                value={cleanLink(data.facebook)}
                onChange={(facebook) => patch({ facebook: cleanLink(facebook) })}
                placeholder="https://facebook.com/…"
              />
              <SocialField
                icon="instagram"
                label="Instagram"
                value={cleanLink(data.instagram)}
                onChange={(instagram) => patch({ instagram: cleanLink(instagram) })}
                placeholder="https://instagram.com/…"
              />
              <SocialField
                icon="booksy"
                label="Booksy"
                value={cleanLink(data.booksy)}
                onChange={(booksy) => patch({ booksy: cleanLink(booksy) })}
                placeholder="https://booksy.com/…"
              />
            </div>
          </div>
        </section>

        <section className="adm-contact__window adm-contact__window--hours" aria-label="Godziny otwarcia">
          <HoursEditor
            value={data.hours ?? []}
            onChange={(hoursValue) => patch({ hours: hoursValue })}
          />
        </section>
      </div>

      <div className="adm-actions adm-contact__save">
        <button type="button" className="adm-btn adm-btn--primary adm-contact__save-btn" onClick={save}>
          Zapisz na stronie
        </button>
        <span className="adm-contact__status" aria-live="polite">
          {status ? <span className={`adm-status adm-status--${status.kind}`}>{status.text}</span> : null}
        </span>
      </div>
    </div>
  )
}

export default ContactPanel
