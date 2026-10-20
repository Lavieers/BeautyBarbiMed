import { useEffect, useState } from 'react'

import { Link, useLocation, useNavigate } from 'react-router-dom'

import { isSupabaseConfigured } from '../lib/supabase'

import { signOut, useAdminSession } from './auth'

import { adminNavItems } from './adminNav'
import { pathForSection, sectionFromPathname } from './adminRoutes'
import { useAdminHomeMeta } from './useAdminDashboard'

import AdminIcon from './AdminIcon'

import Login from './Login'

import AdminHome from './AdminHome'

import AdminPageHeader from './AdminPageHeader'
import { formatAdminDate } from './formatAdminDate'
import { pageDescriptionParts } from './formatPageDescription'

import './Admin.scss'
import './AdminDashboard.scss'



function Admin() {

  const { loading, session, isAdmin } = useAdminSession()

  const location = useLocation()
  const navigate = useNavigate()
  const section = sectionFromPathname(location.pathname)
  const activeId = section ?? 'home'

  const { pendingReviewCount } = useAdminHomeMeta()

  // Na telefonie menu boczne rozwija się z góry jako „hamburger”.
  const [menuOpen, setMenuOpen] = useState(false)

  const goToSection = (id) => {
    navigate(pathForSection(id))
    setMenuOpen(false)
  }

  // Nieznany segment w URL (np. literówka) → wracamy na Przegląd.
  useEffect(() => {
    if (section !== null) return
    if (!location.pathname.startsWith('/admin')) return
    navigate('/admin', { replace: true })
  }, [section, location.pathname, navigate])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth > 820) setMenuOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen])



  if (!isSupabaseConfigured) {

    return (

      <div className="adm-login">

        <div className="adm-login__box">

          <h1 className="adm-login__title">Brak konfiguracji</h1>

          <p className="adm-note">

            Skontaktuj się z osobą, która prowadzi stronę — panel wymaga połączenia z bazą

            danych.

          </p>

        </div>

      </div>

    )

  }



  if (loading) return <div className="adm-login">Wczytuję…</div>

  if (!session) return <Login />



  if (!isAdmin) {

    return (

      <div className="adm-login">

        <div className="adm-login__box">

          <h1 className="adm-login__title">Brak uprawnień</h1>

          <p className="adm-note">

            Jesteś zalogowana, ale to konto nie może jeszcze edytować treści. Poproś

            administratora o dodanie uprawnień w Supabase.

          </p>

          <button type="button" className="adm-btn adm-btn--ghost" onClick={signOut}>

            Wyloguj

          </button>

        </div>

      </div>

    )

  }



  const active = adminNavItems.find((item) => item.id === activeId) ?? adminNavItems[0]

  const ActivePanel = active.Panel



  return (

    <div className={`adm${menuOpen ? ' adm--menu-open' : ''}`}>

      <button
        type="button"
        className="adm__backdrop"
        aria-label="Zamknij menu"
        tabIndex={-1}
        onClick={() => setMenuOpen(false)}
      />

      <aside className="adm__sidebar" id="adm-sidebar">

        <div className="adm__brand">

          <p className="adm__brand-kicker">Panel administracyjny</p>

          <p className="adm__brand-name">Beauty Barbi Med</p>

        </div>



        <nav className="adm-nav" aria-label="Menu panelu">

          {adminNavItems.map((item) => (

            <button

              key={item.id}

              type="button"

              className={`adm-nav__link${item.id === activeId ? ' adm-nav__link--active' : ''}`}

              onClick={() => goToSection(item.id)}

            >

              <AdminIcon name={item.icon} className="adm-nav__icon" />

              <span className="adm-nav__text">{item.label}</span>

              {item.id === 'opinie' && pendingReviewCount > 0 && (
                <span className="adm-nav__badge" aria-label={`${pendingReviewCount} opinii do publikacji`}>
                  {pendingReviewCount}
                </span>
              )}

            </button>

          ))}

        </nav>



        <div className="adm__sidebar-foot">

          <button type="button" className="adm-btn adm-btn--sidebar-quiet" onClick={signOut}>

            <AdminIcon name="logout" className="adm-btn__icon" />

            Wyloguj się

          </button>

        </div>

      </aside>



      <div
        className={`adm__main${activeId === 'pakiety' ? ' adm__main--offer' : ''}${activeId === 'firma' ? ' adm__main--contact' : ''}`}
      >

        <header className="adm__mobile-bar">

          <button
            type="button"
            className="adm__burger"
            aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
            aria-expanded={menuOpen}
            aria-controls="adm-sidebar"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <p className="adm__mobile-title">{active.label}</p>

          <Link to="/" className="adm-btn adm-btn--quiet">

            Strona

          </Link>

        </header>

        {active.pageDescription ? (
          <div className="adm__mobile-desc">
            {String(active.pageDescription)
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, lineIndex) => (
                <p key={lineIndex}>
                  {pageDescriptionParts(line).map((part, index) =>
                    part.type === 'strong' ? (
                      <strong key={index}>{part.text}</strong>
                    ) : (
                      <span key={index}>{part.text}</span>
                    ),
                  )}
                </p>
              ))}
          </div>
        ) : null}

        <AdminPageHeader
          kicker={activeId === 'home' ? formatAdminDate() : undefined}
          title={active.label}
          description={active.pageDescription}
          descriptionFull={
            activeId === 'pakiety' ||
            activeId === 'cennik' ||
            activeId === 'firma' ||
            activeId === 'portfolio' ||
            activeId === 'opinie' ||
            activeId === 'komunikaty'
          }
          actions={
            ActivePanel ? (
              <Link
                to="/"
                className="adm-btn adm-btn--quiet adm-btn--page-preview"
                target="_blank"
                rel="noreferrer"
              >
                <AdminIcon name="preview" className="adm-btn__icon" />
                Podgląd strony
              </Link>
            ) : null
          }
        />

        <main
          className={`adm__body${ActivePanel ? '' : ' adm__body--home'}${activeId === 'pakiety' ? ' adm__body--offer' : ''}${activeId === 'firma' ? ' adm__body--contact' : ''}`}
        >

          {ActivePanel ? (

            <ActivePanel />

          ) : (

            <AdminHome onSelect={goToSection} />

          )}

        </main>

      </div>

    </div>

  )

}



export default Admin


