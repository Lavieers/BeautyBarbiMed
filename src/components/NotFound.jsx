import { useEffect } from 'react'
import heroImage from '../assets/hero-bg.webp'
import Button from './Button'
import Navbar from './Navbar'
import NoticeBanner from './NoticeBanner'
import { useSection } from '../content/context'
import { mediaUrl } from '../lib/supabaseConfig'
import './Hero.scss'

const PAGE_TITLE = 'Nie znaleziono strony | Beauty Barbi Med'

function NotFound() {
  const content = useSection('hero')
  const background = mediaUrl(content.backgroundImage) || heroImage

  useEffect(() => {
    const previous = document.title
    document.title = PAGE_TITLE
    window.scrollTo(0, 0)
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <div className="app">
      <NoticeBanner />
      <Navbar />
      <main>
        <section className="hero hero--photo" aria-labelledby="not-found-title">
          <div className="hero__frame">
            <img className="hero__background" src={background} alt="" />
          </div>
          <div className="hero__veil" aria-hidden="true" />

          <div className="hero__content">
            <p className="hero__eyebrow">Błąd 404</p>
            <h1 className="hero__title" id="not-found-title">
              <span className="hero__title-line">Nie znaleziono</span>
              <span className="hero__title-line hero__title-line--accent">tej strony</span>
            </h1>
            <p className="hero__description">
              Podany adres jest nieprawidłowy albo strona została przeniesiona.
            </p>
            <div className="hero__actions">
              <Button variant="cta-primary" href="/">
                Strona główna
              </Button>
              <Button variant="cta-secondary" href="/#cennik">
                Zabiegi i cennik
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default NotFound
