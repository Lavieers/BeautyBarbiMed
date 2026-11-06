import { Suspense, lazy, useLayoutEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import ContentProvider from './content/ContentProvider.jsx'
import LocalBusiness from './seo/LocalBusiness.jsx'
import RobotsMeta from './seo/RobotsMeta.jsx'

// Panel ładowany osobno — klientki strony nie pobierają jego kodu.
const Admin = lazy(() => import('./admin/Admin.jsx'))

function Root() {
  // Po przeniesieniu zdjęcia do hero zostaje sama zasłona. W panelu nie ma hero, więc znika całość.
  useLayoutEffect(() => {
    document.getElementById('lcp-hero')?.remove()
  }, [])

  return (
    <BrowserRouter>
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
        <filter id="pkg-grade" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k1="0" k2="1.4" k3="-0.4" k4="0" />
        </filter>
      </svg>
      <RobotsMeta />
      <ContentProvider>
        <LocalBusiness />
        <Routes>
          <Route path="/" element={<App />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={null}>
                <Admin />
              </Suspense>
            }
          />
        </Routes>
      </ContentProvider>
    </BrowserRouter>
  )
}

export default Root
