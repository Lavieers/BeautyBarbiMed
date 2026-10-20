import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import useSectionScroll from './lib/useSectionScroll'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Offer from './components/Offer'
import SkinGuide from './components/SkinGuide'
import Process from './components/Process'
import Pricing from './components/Pricing'
import Gallery from './components/Gallery'
import Reviews from './components/Reviews'
import Faq from './components/Faq'
import Contact from './components/Contact'
import Footer from './components/Footer'
import NoticeBanner from './components/NoticeBanner'
import { useSection } from './content/context'
import './App.scss'

// Okna dialogowe pobierają się dopiero przy pierwszym otwarciu – nie opóźniają startu strony.
const loadBookingModal = () => import('./components/BookingModal')
const loadPackageModal = () => import('./components/PackageModal')
const loadTreatmentModal = () => import('./components/TreatmentModal')
const BookingModal = lazy(loadBookingModal)
const PackageModal = lazy(loadPackageModal)
const TreatmentModal = lazy(loadTreatmentModal)

function App() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingUsed, setBookingUsed] = useState(false)
  const skinGuide = useSection('skinGuide')

  const openBooking = useCallback(() => {
    setBookingUsed(true)
    setBookingOpen(true)
  }, [])
  const closeBooking = useCallback(() => setBookingOpen(false), [])

  // „Dowiedz się więcej” przy pakiecie – pakiet zostaje w stanie po zamknięciu,
  // żeby okno mogło się płynnie wygasić z tą samą treścią.
  const [packageInfo, setPackageInfo] = useState({ open: false, pkg: null, category: null })
  const openPackage = useCallback(
    (pkg, category) => setPackageInfo({ open: true, pkg, category }),
    [],
  )
  const closePackage = useCallback(() => setPackageInfo((prev) => ({ ...prev, open: false })), [])

  // „Dowiedz się więcej” przy zabiegu (cennik, „Dobierz pielęgnację”): `ids` to zabiegi,
  // po których można przechodzić strzałkami, `id` – aktualnie pokazywany.
  const [treatmentInfo, setTreatmentInfo] = useState({ open: false, ids: [], id: null })
  const openTreatment = useCallback(
    (id, ids) => setTreatmentInfo((prev) => ({ open: true, ids: ids ?? prev.ids, id })),
    [],
  )
  const selectTreatment = useCallback((id) => openTreatment(id), [openTreatment])
  const closeTreatment = useCallback(() => setTreatmentInfo((prev) => ({ ...prev, open: false })), [])
  const bookFromTreatment = useCallback(() => {
    closeTreatment()
    openBooking()
  }, [closeTreatment, openBooking])

  // Gdy przeglądarka złapie oddech, dociągamy okna w tle – pierwsze kliknięcie otwiera je bez czekania.
  useEffect(() => {
    const preload = () => {
      loadBookingModal()
      loadPackageModal()
      loadTreatmentModal()
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preload, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(preload, 2500)
    return () => window.clearTimeout(id)
  }, [])

  // Kółko myszy przenosi od sekcji do sekcji (komputery, tylko strona publiczna).
  useSectionScroll()

  return (
    <div className="app">
      <NoticeBanner />
      <Navbar onBook={openBooking} />
      <main>
        <Hero onBook={openBooking} />
        <About />
        <Offer onPackageInfo={openPackage} />
        <SkinGuide onBook={openBooking} onTreatmentInfo={openTreatment} />

        {(skinGuide.quote || skinGuide.quoteSignature) && (
          <div className="between-quote">
            {skinGuide.quote && (
              <blockquote className="between-quote__text">{skinGuide.quote}</blockquote>
            )}
            {skinGuide.quoteSignature && (
              <p className="between-quote__sign">{skinGuide.quoteSignature}</p>
            )}
          </div>
        )}

        <Process onBook={openBooking} />
        <Pricing onTreatmentInfo={openTreatment} />
        <Gallery />
        <Reviews />
        <Faq />
        <Contact onBook={openBooking} />
      </main>
      <Footer />
      <Suspense fallback={null}>
        {bookingUsed && <BookingModal open={bookingOpen} onClose={closeBooking} />}
        {packageInfo.pkg && (
          <PackageModal
            open={packageInfo.open}
            pkg={packageInfo.pkg}
            category={packageInfo.category}
            onSelect={openPackage}
            onClose={closePackage}
          />
        )}
        {treatmentInfo.id && (
          <TreatmentModal
            open={treatmentInfo.open}
            ids={treatmentInfo.ids}
            currentId={treatmentInfo.id}
            onSelect={selectTreatment}
            onBook={bookFromTreatment}
            onClose={closeTreatment}
          />
        )}
      </Suspense>
    </div>
  )
}

export default App
