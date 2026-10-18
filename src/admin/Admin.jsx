import { useState } from 'react'

import { Link } from 'react-router-dom'

import { isSupabaseConfigured } from '../lib/supabase'

import { signOut, useAdminSession } from './auth'

import { adminNavItems } from './adminNav'
import { useAdminHomeMeta } from './useAdminDashboard'

import AdminIcon from './AdminIcon'

import Login from './Login'

import AdminHome from './AdminHome'

import AdminPageHeader from './AdminPageHeader'
import { formatAdminDate } from './formatAdminDate'

import './Admin.scss'
import './AdminDashboard.scss'



function Admin() {

  const { loading, session, isAdmin } = useAdminSession()

  const [activeId, setActiveId] = useState('home')

  const { pendingReviewCount } = useAdminHomeMeta()



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

    <div className="adm">

      <aside className="adm__sidebar">

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

              onClick={() => setActiveId(item.id)}

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

          <p className="adm__mobile-title">{active.label}</p>

          <Link to="/" className="adm-btn adm-btn--quiet">

            Strona

          </Link>

        </header>



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

            <AdminHome onSelect={(id) => setActiveId(id)} />

          )}

        </main>

      </div>

    </div>

  )

}



export default Admin


