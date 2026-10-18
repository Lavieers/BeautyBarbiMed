import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import ContentProvider from './content/ContentProvider.jsx'

// Panel ładowany osobno — klientki strony nie pobierają jego kodu.
const Admin = lazy(() => import('./admin/Admin.jsx'))

function Root() {
  return (
    <BrowserRouter>
      <ContentProvider>
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
