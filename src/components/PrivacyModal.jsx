import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import useModalBehavior from '../lib/useModalBehavior'
import './PrivacyModal.scss'

function PrivacyModal({ open, onClose, contact }) {
  const reduced = useReducedMotion()
  const panelRef = useModalBehavior(open, onClose)
  const duration = reduced ? 0 : 0.28
  const address = String(contact?.address || 'ul. Eugeniusza Romera 30, 20-487 Lublin').trim()
  const phone = String(contact?.phone || '+48 501 280 578').trim()
  const phoneHref = contact?.phoneHref || 'tel:+48501280578'

  return (
    <AnimatePresence>
      {open && (
        <div className="privacy" role="presentation">
          <motion.div
            className="privacy__backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          />

          <motion.div
            ref={panelRef}
            className="privacy__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 10 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <button type="button" className="privacy__close" onClick={onClose} aria-label="Zamknij">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>

            <div className="privacy__scroll">
              <p className="privacy__kicker">Beauty Barbi Med</p>
              <h2 id="privacy-title">Polityka prywatności</h2>
              <p className="privacy__updated">Obowiązuje od 6 listopada 2026 r.</p>

              <section>
                <h3>Kto odpowiada za dane</h3>
                <p>
                  Administratorem danych związanych z tą stroną jest gabinet Beauty Barbi Med, {address}.
                  W sprawie danych zadzwoń:{' '}
                  <a href={phoneHref}>{phone}</a>.
                </p>
              </section>

              <section>
                <h3>Czego strona nie zbiera</h3>
                <p>
                  Nie ma tu formularza, konta, newslettera ani płatności. Nie prosimy o imię, e-mail ani
                  informacje o zdrowiu. Wizytę umawiasz w Booksy, poza tą stroną. Dokumentacja z wizyty
                  w gabinecie jest prowadzona osobno i nie powstaje przez tę stronę.
                </p>
              </section>

              <section>
                <h3>Co powstaje przy zwykłym wejściu</h3>
                <p>
                  Żeby strona się wyświetliła, przeglądarka łączy się z serwerem. Dostawca hostingu może
                  zapisać techniczny log: adres IP, datę, rodzaj przeglądarki i adres strony. Służy to
                  działaniu i bezpieczeństwu serwisu. Nie prowadzimy własnej statystyki odwiedzin i nie
                  podłączamy reklam.
                </p>
                <p>
                  Treści, które widać na stronie (cennik, opinie, zdjęcia, ogłoszenia), są pobierane
                  z usługi Supabase. Przy tym połączeniu do dostawcy trafia adres IP. Nie wysyłamy tam
                  danych wpisanych przez odwiedzających, bo strona takich danych nie przyjmuje.
                </p>
              </section>

              <section>
                <h3>Mapa i czcionki Google</h3>
                <p>
                  Mapa dojazdu jest osadzoną mapą Google i ładuje się razem ze stroną. Czcionki również
                  pochodzą od Google. W obu przypadkach Google otrzymuje adres IP i może zapisać własne
                  ciasteczka. Nie używamy tych danych do reklamy ani do śledzenia osób między stronami.
                </p>
              </section>

              <section>
                <h3>Linki poza stronę</h3>
                <p>
                  Booksy, Facebook, Instagram i opinie Google otwierają się dopiero po kliknięciu.
                  Od tego momentu obowiązują zasady tamtego serwisu. Samo wyświetlenie tej strony ich
                  nie uruchamia.
                </p>
              </section>

              <section>
                <h3>Zapis w tej przeglądarce</h3>
                <p>
                  Jeśli zamkniesz pasek z ogłoszeniem, przeglądarka zapamięta to lokalnie, żeby komunikat
                  nie wracał po odświeżeniu. To nie jest wysyłane na serwer. Osoba prowadząca gabinet ma
                  osobny panel; sesja jej logowania zostaje tylko w jej przeglądarce. Odwiedzający nie
                  zakładają kont.
                </p>
              </section>

              <section>
                <h3>Po co i na jakiej podstawie</h3>
                <p>
                  Techniczne dane połączenia przetwarzamy, żeby strona działała, była bezpieczna i pokazywała
                  mapę oraz właściwy krój pisma. Podstawą jest prawnie uzasadniony interes administratora
                  (art. 6 ust. 1 lit. f RODO). Nie sprzedajemy danych i nie profilujemy odwiedzających
                  pod reklamy.
                </p>
              </section>

              <section>
                <h3>Jak długo</h3>
                <p>
                  Logi hostingu zostają przez czas określony przez dostawcę hostingu, na potrzeby
                  bezpieczeństwa. Zapis zamkniętego ogłoszenia zostaje w tej przeglądarce, dopóki nie
                  wyczyścisz danych strony. Mapa i czcionki podlegają zasadom Google.
                </p>
              </section>

              <section>
                <h3>Twoje prawa</h3>
                <p>
                  Możesz poprosić o dostęp do danych, ich sprostowanie, usunięcie, ograniczenie
                  przetwarzania albo o sprzeciw wobec przetwarzania opartego na uzasadnionym interesie.
                  Przysługuje też skarga do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2,
                  00-193 Warszawa,{' '}
                  <a href="https://uodo.gov.pl" target="_blank" rel="noreferrer">
                    uodo.gov.pl
                  </a>
                  .
                </p>
                <p>
                  Przy danych technicznych, takich jak adres IP w logu serwera, część żądań da się
                  spełnić tylko wtedy, gdy da się je powiązać z konkretną osobą.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PrivacyModal
