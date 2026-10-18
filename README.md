# Beauty Barbi Med

Strona gabinetu kosmetologii i stylizacji w Lublinie, razem z **panelem administracyjnym**,
w którym właścicielka sama zmienia treści (cennik, pakiety, zdjęcia, opinie, dane kontaktowe,
komunikaty) – bez ruszania kodu.

**Technologie:** React 19, Vite, SCSS, Supabase (baza danych, logowanie, zdjęcia).

---

## Spis treści

1. [Szybki start](#1-szybki-start)
2. [Jak działa strona](#2-jak-działa-strona)
3. [Panel administracyjny – instrukcja](#3-panel-administracyjny--instrukcja)
4. [Konfiguracja Supabase od zera](#4-konfiguracja-supabase-od-zera)
5. [Zdjęcia i grafiki](#5-zdjęcia-i-grafiki)
6. [Publikacja strony](#6-publikacja-strony)
7. [Bezpieczeństwo](#7-bezpieczeństwo)
8. [Struktura projektu](#8-struktura-projektu)

---

## 1. Szybki start

Potrzebujesz [Node.js](https://nodejs.org) (wersja LTS).

```bash
npm install          # pobiera potrzebne biblioteki (tylko za pierwszym razem)
npm run dev          # uruchamia stronę lokalnie
```

- Strona: <http://localhost:5173>
- Panel: <http://localhost:5173/admin>

Bez pliku `.env` strona też działa – pokazuje wtedy treści domyślne, a panel prosi o
połączenie z bazą (zob. [punkt 4](#4-konfiguracja-supabase-od-zera)).

| Komenda | Do czego służy |
| --- | --- |
| `npm run dev` | praca lokalna z podglądem na żywo |
| `npm run build` | tworzy gotową stronę w katalogu `dist` |
| `npm run preview` | uruchamia lokalnie wersję z `dist` (test przed publikacją) |
| `npm run lint` | sprawdza kod pod kątem błędów |

---

## 2. Jak działa strona

```
 klientka ──► strona (React) ──► pobiera treści z Supabase
                                  │
                                  └─ brak treści w bazie? → pokazuje domyślne z src/data/defaults.js

 właścicielka ──► /admin (logowanie) ──► zmienia treści ──► „Zapisz na stronie” ──► baza
```

- **Treści domyślne** (teksty, ceny, pakiety) są w `src/data/defaults.js`. Dzięki nim strona
  zawsze coś pokazuje, nawet gdy baza nie odpowiada.
- **Zmiany z panelu** nadpisują domyślne treści i działają od razu po odświeżeniu strony.
- Opisy zabiegów w oknie „Dowiedz się więcej” mają swoje domyślne teksty w
  `src/data/treatmentGuide.js`; w panelu można je zmienić.

---

## 3. Panel administracyjny – instrukcja

Wejdź na `/admin` i zaloguj się. Menu po lewej ma siedem zakładek:

| Zakładka | Co tu zmieniasz |
| --- | --- |
| **Przegląd** | Podsumowanie strony. Kliknij kafel, żeby przejść do edycji. |
| **Pakiety** | Zestawy zabiegów i ich ceny. |
| **Cennik** | Pojedyncze zabiegi, ceny i opisy okien „Dowiedz się więcej”. |
| **Dane firmy** | Adres, telefon, godziny otwarcia (pokazują się w sekcji Kontakt, z mapą). |
| **Portfolio** | Zdjęcia efektów pracy (galeria na stronie). |
| **Opinie** | Recenzje klientek (gwiazdki i krótki tekst). |
| **Komunikaty** | Pasek ogłoszeń u góry strony (urlop, zmiana godzin, zamknięcie). |

### Złota zasada: „Zapisz na stronie”

Zmiany w **Pakietach**, **Cenniku** i **Danych firmy** zapisują się w bazie dopiero po
kliknięciu **Zapisz na stronie** (przycisk na dole). Samo „Dodaj” czy „Zapisz” w okienku
tylko aktualizuje listę w panelu. Pasek pod listą przypomina o tym po każdej zmianie.
Portfolio, Opinie i Komunikaty zapisują się od razu po kliknięciu „Zapisz” w okienku.

### Cennik krok po kroku

1. **Zmiana zabiegu:** kliknij wiersz w tabeli.
2. **Nowy zabieg:** kliknij **plus** w rogu.
3. W polu **Cena** wpisz samą kwotę (np. `250`) – „zł” dopisze się automatycznie.
4. W sekcji **Okno „Dowiedz się więcej”** uzupełnij czas, opis, „dla kogo”, efekty,
   przeciwwskazania i ewentualną uwagę „Ważne”.
5. **Podgląd po prawej** pokazuje gotowe okno tak, jak zobaczy je klientka, i zmienia się
   razem z wpisywanym tekstem.
6. Puste pola znikają z okna. Zabieg bez żadnego opisu nie ma okna (i znaku „+” w cenniku).
7. Na końcu kliknij **Zapisz na stronie**.

### Zdjęcia w panelu

- Zdjęcie do okna zabiegu: **tylko PNG**. Dobrze wygląda i jest lekkie. Najlepiej pionowe.
- Portfolio i pozostałe zdjęcia: wgrywasz przyciskiem w odpowiednim okienku.

---

## 4. Konfiguracja Supabase od zera

Robisz to **raz**, przy pierwszym uruchomieniu (albo gdy zakładasz nową bazę).

1. Załóż darmowy projekt na [supabase.com](https://supabase.com) (region: Frankfurt).
2. W **Project Settings → API** skopiuj `Project URL` i klucz **`anon public`**.
3. W katalogu projektu skopiuj plik `.env.example` jako `.env` i wklej tam oba te dane:
   ```
   VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
   VITE_SUPABASE_ANON_KEY=twoj-klucz-anon
   ```
4. W Supabase otwórz **SQL Editor → New query**, wklej całą zawartość
   `supabase/schema.sql` i kliknij **Run**. To tworzy tabele, reguły dostępu i bucket
   `media` na zdjęcia.
5. *(Opcjonalnie)* Wklej `supabase/seed-pricing.sql`, żeby wgrać startowy cennik.
6. W **Authentication → Users → Add user** dodaj swoje konto (e-mail + hasło).
   W **Authentication → Providers → Email** wyłącz rejestrację („Allow new users to sign up”),
   żeby nikt obcy nie założył konta.
7. Uruchom stronę, wejdź na `/admin` i zaloguj się. Panel pokaże gotowe zapytanie SQL
   nadające Twojemu kontu uprawnienia – wklej je w SQL Editor i odśwież stronę.

Po tych krokach panel jest gotowy do pracy.

---

## 5. Zdjęcia i grafiki

Zdjęcia wbudowane w stronę leżą w `src/assets/` i są w formacie **WebP** (świetna jakość
przy małym rozmiarze). Zasady:

- Nowe zdjęcia do kodu zapisuj jako **WebP**, szerokość maks. ok. 1200 px
  (tło strony głównej: ok. 2400 px).
- Nie dodawaj dużych plików PNG/JPG – spowalniają stronę.
- Zdjęcia wgrywane przez panel trafiają do Supabase (bucket `media`), nie do repozytorium.

---

## 6. Publikacja strony

1. `npm run build` – tworzy katalog `dist`.
2. Wgraj stronę na hosting (np. Vercel lub Netlify – wybierz preset **Vite**).
3. W ustawieniach hostingu dodaj zmienne `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`
   (plik `.env` nie jest wysyłany do repozytorium, więc hosting musi je dostać osobno).
4. Strona jest aplikacją jednostronicową, więc hosting musi przekierowywać nieznane adresy
   na `index.html` – inaczej `/admin` zwróci błąd 404. Vercel i Netlify robią to
   automatycznie przy presecie „Vite”.

---

## 7. Bezpieczeństwo

- **Plik `.env` nigdy nie trafia do gita** (jest w `.gitignore`). Nie wysyłaj go nikomu
  i nie wklejaj do czatów ani maili.
- Klucz **`anon`** jest z założenia publiczny (trafia do przeglądarki każdego
  odwiedzającego). Chronią dane reguły dostępu (RLS) w bazie.
- Klucza **`service_role`** nie wolno umieszczać w kodzie ani w `.env` – daje pełny
  dostęp do bazy.
- Reguły RLS pozwalają publicznie **czytać** tylko opublikowane treści, a **zapisywać**
  wyłącznie kontom wpisanym do tabeli `admins`.
- W bazie nie przechowujemy danych klientek. Opinie wpisuje właścicielka ręcznie i powinny
  zawierać najwyżej imię, za zgodą autorki.

---

## 8. Struktura projektu

```
BeautyBarbiMed/
├─ index.html               punkt wejścia, czcionki
├─ .env.example             wzór pliku .env (bez prawdziwych kluczy)
├─ supabase/
│  ├─ schema.sql            schemat bazy, reguły RLS, bucket na zdjęcia
│  └─ seed-pricing.sql      startowy cennik
├─ public/                  pliki publiczne (ikona strony)
└─ src/
   ├─ components/           sekcje strony publicznej i okna (rezerwacja, pakiet, zabieg)
   ├─ admin/                panel administracyjny (/admin)
   │  └─ panels/            po jednym pliku na zakładkę (Cennik, Pakiety, Portfolio…)
   ├─ content/              pobieranie treści z bazy, motywy kolorystyczne
   ├─ data/                 treści domyślne (defaults, opisy zabiegów, pakiety)
   ├─ lib/                  konfiguracja Supabase, pomocnicze funkcje
   ├─ assets/               zdjęcia (WebP)
   ├─ styles/               wspólne style SCSS
   └─ index.css             zmienne CSS (kolory, czcionki, odstępy)
```

### Gdzie zmienić…

| Co | Gdzie |
| --- | --- |
| Kolory i czcionki | `src/index.css` (zmienne na górze pliku) |
| Teksty domyślne strony | `src/data/defaults.js` |
| Domyślne opisy zabiegów | `src/data/treatmentGuide.js` |
| Opisy pakietów w oknie | `src/data/packageStories.js` |
| Menu panelu admina | `src/admin/adminNav.js` |
