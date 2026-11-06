import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import logoMark from '../assets/logotb-mark.png'
import Button from './Button'
import { useContactInfo } from '../content/context'
import { usePortfolioImages } from '../data/galleryFallback'
import { navLinks } from './navLinks'
import './Navbar.scss'

function BooksyMark() {
  return (
    <svg className="navbar__booksy" viewBox="1.8 4.7 26 19.2" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M 14.863281 5.113281 C 14.671875 5.214844 14.660156 5.613281 14.660156 10.832031 L 14.660156 16.421875 L 15.125 16.816406 C 15.375 17.046875 15.863281 17.363281 16.191406 17.53125 C 17.03125 17.976562 17.121094 17.882812 17.175781 16.410156 C 17.234375 15.082031 17.484375 14.4375 18.3125 13.539062 C 19.015625 12.78125 19.84375 12.429688 20.953125 12.429688 C 22.15625 12.417969 22.835938 12.714844 23.664062 13.621094 C 24.527344 14.550781 24.796875 15.277344 24.796875 16.726562 C 24.808594 18.710938 24.1875 19.777344 22.53125 20.605469 C 21.054688 21.332031 19.367188 21.253906 17.414062 20.355469 C 16.359375 19.867188 15.453125 19.277344 13.207031 17.601562 C 12.1875 16.828125 11.097656 16.082031 10.792969 15.933594 C 9.160156 15.105469 6.949219 15.105469 5.167969 15.945312 C 3.953125 16.523438 2.390625 18.316406 2.21875 19.324219 C 2.128906 19.867188 2.390625 19.972656 3.738281 19.9375 L 4.839844 19.902344 L 5.292969 19.222656 C 5.925781 18.304688 6.621094 17.882812 7.617188 17.828125 C 8.910156 17.757812 9.898438 18.28125 13.46875 20.914062 C 15.238281 22.214844 16.824219 23.042969 18.230469 23.375 C 19.082031 23.578125 19.480469 23.601562 20.671875 23.554688 C 22.382812 23.488281 23.378906 23.191406 24.558594 22.386719 C 26.351562 21.160156 27.363281 19.15625 27.363281 16.816406 C 27.363281 14.777344 26.691406 13.066406 25.375 11.726562 C 24.105469 10.433594 22.734375 9.867188 20.898438 9.867188 C 19.761719 9.867188 18.96875 10.070312 17.992188 10.613281 C 17.609375 10.820312 17.269531 10.964844 17.222656 10.921875 C 17.1875 10.886719 17.15625 9.628906 17.15625 8.144531 C 17.15625 4.886719 17.1875 4.988281 15.882812 4.988281 C 15.429688 4.988281 14.964844 5.046875 14.863281 5.113281 Z"
      />
    </svg>
  )
}

function Navbar() {
  const { pathname } = useLocation()
  const sectionHref = (href) => (pathname === '/' ? href : `/${href}`)
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
          <a href={sectionHref('#kontakt')} className="navbar__top-link" onClick={onSectionClick}>
            Dojazd & Godziny
          </a>
        </div>
      </div>

      <div className="navbar__inner">
        <a href={sectionHref('#home')} className="navbar__brand" aria-label="Beauty Barbi Med - strona główna">
          <span className="navbar__logo-frame">
            <img src={logoMark} alt="" width="829" height="890" className="navbar__logo" />
          </span>
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
                  href={sectionHref(href)}
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
          <Button variant="cta-primary" size="compact" href={contact.booksy} external>
            Umów wizytę
            <BooksyMark />
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
                  href={sectionHref(href)}
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
            href={contact.booksy}
            external
            onClick={closeMenu}
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
