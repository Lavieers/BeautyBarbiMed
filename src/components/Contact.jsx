import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Button from './Button'
import Icon from './Icon'
import { useContactInfo, useSection } from '../content/context'
import { defaultMapEmbedSrc, mapEmbedSrc } from '../lib/mapEmbed'
import './Contact.scss'

function Contact({ onBook }) {
  const reduced = useReducedMotion()
  const [mapActive, setMapActive] = useState(false)
  const content = useSection('contact')
  const contactData = useContactInfo()
  const hours = Array.isArray(contactData.hours)
    ? contactData.hours.filter(Boolean)
    : contactData.hours
      ? [contactData.hours]
      : []
  const phoneHref = contactData.phoneHref || ''
  const mapSrc = mapEmbedSrc(contactData.mapEmbedUrl) || defaultMapEmbedSrc

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
        }

  const socialLinks = [
    contactData.facebook && {
      key: 'facebook',
      href: contactData.facebook,
      label: content.facebookLabel || 'Facebook',
      icon: 'facebook',
    },
    contactData.instagram && {
      key: 'instagram',
      href: contactData.instagram,
      label: 'Instagram',
      icon: 'instagram',
    },
    contactData.booksy && {
      key: 'booksy',
      href: contactData.booksy,
      label: 'Booksy',
      icon: 'booksy',
    },
  ].filter(Boolean)

  return (
    <section className="contact" id="kontakt" aria-labelledby="contact-title">
      <div className="contact__header">
        <motion.h2 id="contact-title" className="contact__title" {...reveal(0.05)}>
          {/* Stały tytuł — starsza treść zapisana w bazie nie może go nadpisać. */}
          Kontakt i<span>Lokalizacja</span>
        </motion.h2>
        <span className="contact__ornament" aria-hidden="true" />
      </div>

      <motion.div className="contact__layout" id="mapa" {...reveal(0.18)}>
        <div className="contact__map-col">
          {/* Mapa reaguje dopiero po kliknięciu – inaczej iframe „połyka” kółko myszy
              i przewijanie strony zatrzymuje się nad mapą. */}
          <figure
            className={`contact__map${mapActive ? ' contact__map--active' : ''}`}
            onClick={() => setMapActive(true)}
            onMouseLeave={() => setMapActive(false)}
          >
            <iframe
              title="Mapa dojazdu — Beauty Barbi Med, ul. Romera 30, Lublin"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </figure>
        </div>

        <div className="contact__info">
          <ul className="contact__facts">
            {contactData.address && (
              <li className="contact__fact">
                <span className="contact__fact-icon" aria-hidden="true">
                  <Icon name="pin" />
                </span>
                <div className="contact__fact-body">
                  <p className="contact__fact-label">Adres</p>
                  <p className="contact__fact-value">
                    {contactData.address.replace(/(\d)-(\d)/g, '$1\u2011$2')}
                  </p>
                  {contactData.mapLink && (
                    <a
                      className="contact__fact-link"
                      href={contactData.mapLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {content.routeCta || 'Wyznacz trasę'}
                    </a>
                  )}
                </div>
              </li>
            )}

            {hours.length > 0 && (
              <li className="contact__fact">
                <span className="contact__fact-icon" aria-hidden="true">
                  <Icon name="clock" />
                </span>
                <div className="contact__fact-body">
                  <p className="contact__fact-label">Godziny otwarcia</p>
                  <p className="contact__fact-value">
                    {hours.map((line, index) => (
                      <span key={`${line}-${index}`} className="contact__hours-line">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </li>
            )}

            {contactData.phone && phoneHref && (
              <li className="contact__fact">
                <span className="contact__fact-icon" aria-hidden="true">
                  <Icon name="phone" />
                </span>
                <div className="contact__fact-body">
                  <p className="contact__fact-label">Telefon</p>
                  <p className="contact__fact-value">
                    <a href={phoneHref}>{contactData.phone}</a>
                  </p>
                </div>
              </li>
            )}

            {content.bookingText && (
              <li className="contact__fact">
                <span className="contact__fact-icon" aria-hidden="true">
                  <Icon name="calendar" />
                </span>
                <div className="contact__fact-body">
                  <p className="contact__fact-label">{content.bookingLabel || 'Rezerwacja terminu'}</p>
                  <p className="contact__fact-note">{content.bookingText}</p>
                </div>
              </li>
            )}
          </ul>

          <Button variant="cta-primary" block onClick={onBook}>
            {content.primaryCta || 'Umów wizytę'}
          </Button>

          {socialLinks.length > 0 && (
            <ul className="contact__social">
              {socialLinks.map((item) => (
                <li key={item.key}>
                  <a
                    className="contact__social-link"
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name={item.icon} className="contact__social-icon" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </section>
  )
}

export default Contact
