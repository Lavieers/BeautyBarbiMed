# Beauty Barbi Med

Strona internetowa gabinetu kosmetologii i stylizacji w Lublinie wraz z panelem
administracyjnym do zarządzania treścią. Projekt jednostronicowy (SPA) zbudowany w React,
z danymi przechowywanymi w Supabase.

## Funkcje

**Strona publiczna**

- sekcje: powitalna, o gabinecie, pakiety zabiegowe, dobór pielęgnacji, standard wizyty,
  cennik, galeria, opinie, FAQ i kontakt z mapą,
- okna z opisem zabiegu i pakietu (opis, dla kogo, efekty, przeciwwskazania, cena),
- okno rezerwacji i pasek komunikatów (np. urlop, zmiana godzin),
- treści domyślne wbudowane w kod – strona działa także bez połączenia z bazą.

**Panel administracyjny** (`/admin`)

- edycja pakietów, cennika, danych firmy, portfolio, opinii i komunikatów,
- edytor opisów zabiegów z podglądem okna na żywo,
- logowanie kontem z uprawnieniami administratora.

## Technologie

| Obszar | Narzędzia |
| --- | --- |
| Interfejs | React 19, React Router, motion (animacje) |
| Style | SCSS |
| Budowanie | Vite |
| Dane, logowanie, pliki | Supabase (PostgreSQL, Auth, Storage) |
| Jakość kodu | ESLint |

## Wymagania

- [Node.js](https://nodejs.org) w wersji LTS,
- konto w [Supabase](https://supabase.com) (wystarczy plan darmowy).

## Uruchomienie lokalne

```bash
git clone https://github.com/Lavieers/BeautyBarbiMed.git
cd BeautyBarbiMed
npm install
cp .env.example .env     # następnie uzupełnij wartości (zob. „Konfiguracja Supabase”)
npm run dev
```

Po uruchomieniu:

- strona: <http://localhost:5173>
- panel: <http://localhost:5173/admin>

Bez pliku `.env` strona działa na treściach domyślnych, a panel informuje o braku konfiguracji.

### Dostępne komendy

| Komenda | Opis |
| --- | --- |
| `npm run dev` | serwer deweloperski z odświeżaniem na żywo |
| `npm run build` | wersja produkcyjna w katalogu `dist` |
| `npm run preview` | lokalny podgląd wersji z `dist` |
| `npm run lint` | analiza kodu (ESLint) |

## Konfiguracja Supabase

1. Utwórz projekt w Supabase.
2. W **Project Settings → API** skopiuj `Project URL` oraz klucz **`anon public`**.
3. Wpisz je do pliku `.env`:

   ```env
   VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
   VITE_SUPABASE_ANON_KEY=twoj-klucz-anon
   ```

4. W **SQL Editor** uruchom zawartość `supabase/schema.sql`. Skrypt tworzy tabele, reguły
   dostępu (RLS) i bucket `media` na zdjęcia. Można go uruchomić ponownie bez utraty danych.
5. *(opcjonalnie)* Uruchom `supabase/seed-pricing.sql`, aby wgrać przykładowy cennik.
   Skrypt zastępuje sekcję cennika w bazie, więc nie należy uruchamiać go na bazie
   z własnym cennikiem.
6. W **Authentication → Users** dodaj konto administratora. W **Authentication → Providers →
   Email** wyłącz opcję „Allow new users to sign up”.
7. Zaloguj się w `/admin`. Panel wyświetli zapytanie SQL, które nadaje temu kontu
   uprawnienia administratora – uruchom je w SQL Editor i odśwież stronę.

## Jak działa aplikacja

```
odwiedzający ──► strona (React) ──► treści z Supabase
                                     └─ brak wpisu w bazie → wartości z src/data/defaults.js

administrator ──► /admin (logowanie) ──► edycja ──► „Zapisz na stronie” ──► baza
```

- Strona pobiera treści z Supabase po załadowaniu. Biblioteka klienta Supabase jest ładowana
  dopiero wtedy, dzięki czemu pierwsze wyświetlenie jest szybsze.
- Treści zapisane w panelu nadpisują wartości domyślne z `src/data/defaults.js`.
- Opisy zabiegów mają wartości domyślne w `src/data/treatmentGuide.js`; panel pozwala je zmienić.

### Panel administracyjny

| Zakładka | Zakres |
| --- | --- |
| Przegląd | podsumowanie i skróty do edycji |
| Pakiety | zestawy zabiegów i ich ceny |
| Cennik | zabiegi, ceny i opisy okien „Dowiedz się więcej” (z podglądem na żywo) |
| Dane firmy | adres, telefon, godziny otwarcia |
| Portfolio | zdjęcia efektów pracy |
| Opinie | recenzje klientów |
| Komunikaty | pasek ogłoszeń u góry strony |

Zmiany w zakładkach **Pakiety**, **Cennik** i **Dane firmy** zapisują się w bazie dopiero po
kliknięciu **Zapisz na stronie**. Pozostałe zakładki zapisują zmiany od razu po zatwierdzeniu
w oknie edycji.

W cenniku w polu ceny wpisuje się samą kwotę – oznaczenie „zł” jest dodawane automatycznie.
Zdjęcia do okien zabiegów należy wgrywać w formacie PNG.

## Struktura projektu

```
├─ index.html              punkt wejścia, wczytywanie czcionek
├─ .env.example            wzór konfiguracji (bez prawdziwych kluczy)
├─ supabase/
│  ├─ schema.sql           schemat bazy, reguły RLS, bucket na zdjęcia
│  └─ seed-pricing.sql     przykładowy cennik
├─ public/                 pliki publiczne (ikona strony)
└─ src/
   ├─ components/          sekcje strony i okna dialogowe
   ├─ admin/               panel administracyjny (/admin)
   │  └─ panels/           po jednym pliku na zakładkę
   ├─ content/             pobieranie treści z bazy, motywy kolorystyczne
   ├─ data/                treści domyślne, opisy zabiegów i pakietów
   ├─ lib/                 konfiguracja Supabase, funkcje pomocnicze
   ├─ assets/              zdjęcia (WebP) i zestawienie źródeł (CREDITS.md)
   ├─ styles/              wspólne style SCSS
   └─ index.css            zmienne CSS (kolory, czcionki, odstępy)
```

| Zmiana | Miejsce w kodzie |
| --- | --- |
| Kolory i czcionki | `src/index.css` |
| Teksty domyślne strony | `src/data/defaults.js` |
| Domyślne opisy zabiegów | `src/data/treatmentGuide.js` |
| Opisy pakietów | `src/data/packageStories.js` |
| Menu panelu | `src/admin/adminNav.js` |

## Zdjęcia

- Zdjęcia wbudowane w stronę znajdują się w `src/assets/` w formacie WebP. Nowe pliki warto
  zapisywać w tym formacie (szerokość do ok. 1200 px, tło strony głównej do ok. 2400 px).
- Zdjęcia dodawane przez panel trafiają do Supabase Storage (bucket `media`), a nie do
  repozytorium.
- Źródła zdjęć pochodzących z zewnętrznych serwisów opisuje `src/assets/CREDITS.md`.

## Wdrożenie

1. Zbuduj aplikację: `npm run build`.
2. Wdróż katalog `dist` na hostingu statycznym (np. Vercel, Netlify – preset „Vite”).
3. Ustaw zmienne środowiskowe `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` w panelu
   hostingu (plik `.env` nie jest częścią repozytorium).
4. Skonfiguruj przekierowanie wszystkich nieznanych adresów na `index.html`. Bez tego
   bezpośrednie wejście na `/admin` zwróci błąd 404. Presety Vercel i Netlify robią to
   automatycznie.

## Bezpieczeństwo

- Plik `.env` jest wyłączony z repozytorium (`.gitignore`).
- Klucz `anon` jest publiczny z założenia – trafia do przeglądarki. Dostępu do danych strzegą
  reguły RLS w bazie.
- Klucza `service_role` nie wolno umieszczać w kodzie ani w `.env` aplikacji frontendowej.
- Reguły RLS pozwalają publicznie **odczytywać** tylko opublikowane treści (opublikowane
  opinie i zdjęcia, aktywne komunikaty), a **zapisywać** wyłącznie kontom z tabeli `admins`.
- Baza nie przechowuje danych klientów. Opinie są dodawane ręcznie z panelu i powinny
  zawierać najwyżej imię, za zgodą autora.
