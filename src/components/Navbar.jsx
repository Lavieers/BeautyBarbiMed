import { useEffect, useMemo, useState } from 'react'
import logo from '../assets/logo.webp'
import Button from './Button'
import { useContactInfo } from '../content/context'
import { usePortfolioImages } from '../data/galleryFallback'
import { navLinks } from './navLinks'
import './Navbar.scss'

function Navbar({ onBook }) {
  const contact = useContactInfo()
  const hasGallery = usePortfolioImages().length > 0
  const links = useMemo(
    () => (hasGallery ? navLinks : navLinks.filter((link) => link.href !== '#galeria')),
    [hasGallery],
  )
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sectionIds = ['home', ...links.map(({ href }) => href.slice(1))]
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (!sections.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const id = entry.target.id
          setActiveId(id === 'home' ? '' : id)
        })
      },
      { rootMargin: '-40% 0px -40% 0px' },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [links])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const onHashClick = (event) => {
      const link = event.target.closest('a[href^="#"]')
      if (!link) return
      const id = link.hash.slice(1)
      if (id && id !== 'home') setScrolled(true)
    }

    document.addEventListener('click', onHashClick)
    return () => document.removeEventListener('click', onHashClick)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const onSectionClick = () => {
    setScrolled(true)
    closeMenu()
  }

  return (
    <header
      className={`navbar${scrolled || menuOpen ? ' navbar--solid' : ''}${
        scrolled ? ' navbar--compact' : ''
      }`}
    >
      <div className="navbar__top" inert={scrolled || undefined}>
        <p className="navbar__top-label">
          <span>Lublin, ul. Romera 30</span> · <span>Kameralny gabinet medycyny estetycznej i stylizacji</span>
        </p>
        <div className="navbar__top-right">
          <a href="#kontakt" className="navbar__top-link" onClick={onSectionClick}>
            Dojazd & Godziny
          </a>
        </div>
      </div>

      <div className="navbar__inner">
        <a href="#home" className="navbar__brand" aria-label="Beauty Barbi Med - strona główna">
          <img src={logo} alt="" width="256" height="256" className="navbar__logo" />
          <span className="navbar__brand-text">
            <span className="navbar__name">Beauty Barbi Med</span>
            <span className="navbar__tagline">Kosmetologia & Stylizacja</span>
          </span>
        </a>

        <ul className="navbar__links">
          {links.map(({ label, href }) => {
            const active = href.slice(1) === activeId

            return (
              <li key={href}>
                <a
                  href={href}
                  className={active ? 'navbar__link navbar__link--active' : 'navbar__link'}
                  aria-current={active ? 'true' : undefined}
                  onClick={onSectionClick}
                >
                  {label}
                </a>
              </li>
            )
          })}
        </ul>

        <div className="navbar__actions">
          <a
            href={contact.phoneHref || 'tel:+48501280578'}
            className="navbar__phone"
          >
            {contact.phone || '+48 501 280 578'}
          </a>
          <Button variant="cta-primary" size="compact" onClick={onBook}>
            Umów wizytę
          </Button>

          <button
            type="button"
            className={`navbar__toggle${menuOpen ? ' navbar__toggle--open' : ''}`}
            aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`navbar__drawer${menuOpen ? ' navbar__drawer--open' : ''}`}>
        <ul>
          {links.map(({ label, href }) => {
            const active = href.slice(1) === activeId

            return (
              <li key={href}>
                <a
                  href={href}
                  className={active ? 'navbar__drawer-link--active' : undefined}
                  aria-current={active ? 'true' : undefined}
                  onClick={onSectionClick}
                >
                  {label}
                </a>
              </li>
            )
          })}
        </ul>

        <div className="navbar__drawer-actions">
          <Button
            variant="cta-primary"
            block
            onClick={() => {
              closeMenu()
              onBook()
            }}
          >
            Umów wizytę
          </Button>

          <a
            href={contact.phoneHref || 'tel:+48501280578'}
            className="navbar__drawer-phone"
            onClick={closeMenu}
          >
            {contact.phone || '+48 501 280 578'}
          </a>
        </div>
      </div>
    </header>
  )
}

export default Navbar
