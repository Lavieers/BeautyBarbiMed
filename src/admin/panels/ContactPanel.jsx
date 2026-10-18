import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { contactDefaults } from '../../data/defaults'
import { useContent } from '../../content/context'
import { defaultMapEmbedSrc, mapEmbedSrc } from '../../lib/mapEmbed'
import AdminIcon from '../AdminIcon'
import './ContactPanel.scss'

function phoneToHref(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return contactDefaults.phoneHref

  const normalized = digits.startsWith('48') ? digits : `48${digits}`
  return `tel:+${normalized}`
}

function HoursEditor({ value, onChange }) {
  const list = Array.isArray(value) ? value : []

  return (
    <div className="adm-field adm-contact__hours adm-contact__block adm-contact__block--hours">
      <span className="adm-field__label">Godziny otwarcia</span>
      <ul className="adm-list">
        {list.map((item, index) => (
          <li key={index} className="adm-list__row">
            <input
              className="adm-input"
              value={item ?? ''}
              onChange={(event) =>
                onChange(list.map((row, position) => (position === index ? event.target.value : row)))
              }
              placeholder="np. pon.–pt. 09:00–19:00"
            />
            <button
              type="button"
              className="adm-btn adm-btn--quiet"
              onClick={() => onChange(list.filter((_, position) => position !== index))}
            >
              Usuń
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="adm-btn adm-btn--ghost adm-contact__add-line"
        onClick={() => onChange([...list, ''])}
      >
        + Dodaj linię
      </button>
    </div>
  )
}

function SocialField({ icon, label, value, onChange, placeholder }) {
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
    </div>
  )
}

function ContactPanel() {
  const { contact, refresh } = useContent()
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState(null)

  const saved = { ...contactDefaults, ...contact }
  const data = draft ?? saved
  const mapSrc = mapEmbedSrc(data.mapEmbedUrl) || defaultMapEmbedSrc

  const patch = (next) => setDraft({ ...data, ...next })

  const save = async () => {
    setStatus({ kind: 'busy', text: 'Zapisuję…' })

    const payload = {
      ...saved,
      ...data,
      phoneHref: phoneToHref(data.phone),
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
    setStatus({ kind: 'ok', text: 'Zapisane. Odśwież stronę główną, żeby zobaczyć zmiany.' })
  }

  return (
    <div className="adm-panel adm-panel--home adm-contact">
      <div className="adm-contact__grid">
        <section className="adm-contact__stage" aria-labelledby="adm-contact-info-title">
          <header className="adm-contact__head">
            <span className="adm-dash__icon-wrap" aria-hidden="true">
              <AdminIcon name="company" className="adm-dash__icon" />
            </span>
            <h2 id="adm-contact-info-title" className="adm-contact__title">
              Dane kontaktowe
            </h2>
          </header>

          <div className="adm-contact__body">
            <div className="adm-contact__row adm-contact__block">
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
                  value={data.phone ?? ''}
                  onChange={(event) => patch({ phone: event.target.value })}
                  placeholder="+48 501 280 578"
                />
              </label>
            </div>

            <HoursEditor
              value={data.hours ?? []}
              onChange={(hoursValue) => patch({ hours: hoursValue })}
            />

            <div className="adm-contact__social adm-contact__block adm-contact__block--social">
              <p className="adm-contact__social-title">Media i rezerwacje</p>
              <SocialField
                icon="facebook"
                label="Facebook"
                value={data.facebook}
                onChange={(facebook) => patch({ facebook })}
                placeholder="https://facebook.com/…"
              />
              <SocialField
                icon="instagram"
                label="Instagram"
                value={data.instagram}
                onChange={(instagram) => patch({ instagram })}
                placeholder="https://instagram.com/…"
              />
              <SocialField
                icon="booksy"
                label="Booksy"
                value={data.booksy}
                onChange={(booksy) => patch({ booksy })}
                placeholder="https://booksy.com/…"
              />
            </div>
          </div>
        </section>

        <section className="adm-contact__stage adm-contact__stage--map" aria-labelledby="adm-contact-map-title">
          <header className="adm-contact__head">
            <span className="adm-dash__icon-wrap" aria-hidden="true">
              <AdminIcon name="pin" className="adm-dash__icon" />
            </span>
            <h2 id="adm-contact-map-title" className="adm-contact__title">
              Mapa gabinetu
            </h2>
          </header>

          <div className="adm-contact__map-wrap">
            <iframe
              className="adm-contact__map"
              title="Mapa dojazdu — Beauty Barbi Med"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>
      </div>

      <div className="adm-actions adm-actions--sticky adm-contact__save">
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
