import { useContactInfo, useSection } from '../content/context'
import { usePortfolioImages } from '../data/galleryFallback'
import logo from '../assets/logo.webp'
import Icon from './Icon'
import { navLinks } from './navLinks'
import './Footer.scss'

const GITHUB_URL = 'https://github.com/Lavieers'

function Footer() {
  const year = new Date().getFullYear()
  const content = useSection('footer')
  const contactData = useContactInfo()
  const hours = Array.isArray(contactData.hours) ? contactData.hours.filter(Boolean) : []
  const hasGallery = usePortfolioImages().length > 0

  // Te same sekcje co w pasku górnym (portfolio znika, gdy nie ma zdjęć).
  const links = hasGallery ? navLinks : navLinks.filter((link) => link.href !== '#galeria')

  const socials = [
    contactData.facebook && { key: 'facebook', href: contactData.facebook, label: 'Facebook' },
    contactData.instagram && { key: 'instagram', href: contactData.instagram, label: 'Instagram' },
  ].filter(Boolean)

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <a href="#home" className="footer__logo-link" aria-label="Beauty Barbi Med - początek strony">
            <img src={logo} alt="" width="256" height="256" loading="lazy" decoding="async" className="footer__logo" />
            <span className="footer__name">Beauty Barbi Med</span>
          </a>
          <p className="footer__tagline">{content.tagline}</p>
          <p className="footer__city">
            Gabinet kosmetyczny i mezoterapia igłowa - {contactData.city}
          </p>
        </div>

        <nav className="footer__column" aria-label="Nawigacja w stopce">
          <p className="footer__column-title">Strona</p>
          <ul>
            {links.map(({ label, href }) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__column">
          <p className="footer__column-title">Kontakt</p>
          <ul>
            <li>{contactData.address}</li>
            {hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li>
              <a href={contactData.phoneHref}>{contactData.phone}</a>
            </li>
          </ul>

          {socials.length > 0 && (
            <div className="footer__socials">
              {socials.map(({ key, href, label }) => (
                <a
                  key={key}
                  href={href}
                  className="footer__social"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                >
                  <Icon name={key} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="footer__bar">
        <p>© {year} Beauty Barbi Med. Wszelkie prawa zastrzeżone.</p>
        <p className="footer__credit">
          <span>Created by Lavieers</span>
          <a
            href={GITHUB_URL}
            className="footer__github"
            target="_blank"
            rel="noreferrer"
            aria-label="Created by Lavieers – profil na GitHubie"
            title="GitHub – Lavieers"
          >
            <Icon name="github" />
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
