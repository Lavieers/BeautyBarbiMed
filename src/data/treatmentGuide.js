// Opisy zabiegów pokazywane w oknie „Dowiedz się więcej” – w cenniku i w „Dobierz pielęgnację”.
// Klucz to id wiersza z cennika (pricing.groups[].rows[].id). Nazwa i cena zabiegu zawsze
// pochodzą z cennika, więc zmiana ceny w panelu od razu widać też w oknie.
// Wiersz bez wpisu tutaj (np. dodany później w panelu) po prostu nie ma okna.

import consultImage from '../assets/guide-mezo.webp'
import careImage from '../assets/uroda-4-tygodnie.webp'
import bodyImage from '../assets/liposukcja.webp'
import fallbackImage from '../assets/hero.webp'
import { mediaUrl } from '../lib/supabaseConfig'
import maskImage from '../assets/guide-maska.webp'
import suchoscImage from '../assets/guide-suchosc.webp'
import diamentImage from '../assets/guide-diament.webp'
import rfImage from '../assets/guide-rf.webp'
import rzesyImage from '../assets/guide-rzesy.webp'
import mezoMikroImage from '../assets/mezo-mikro.webp'
import mezoIglaImage from '../assets/mezo-igla.webp'
import mezoBezIglaImage from '../assets/mezo-bezigla.webp'
import lashesNaturalImage from '../assets/rzesy-naturalne.webp'
import lashesWetImage from '../assets/rzesy-mokry-efekt.webp'
import lashesCrystalImage from '../assets/rzesy-krysztalki.webp'

// Każda sekcja: etykieta + tekst. Sekcji, których zabieg nie ma, po prostu nie wpisujemy.
const co = (text) => ({ label: 'Co to jest', text })
const dlaKogo = (text) => ({ label: 'Dla kogo', text })
const przebieg = (text) => ({ label: 'Przebieg i czas', text })
const efekty = (text) => ({ label: 'Efekty', text })
const przeciw = (text) => ({ label: 'Przeciwwskazania', text })
const wazne = (text) => ({ label: 'Ważne', text })

const rawGuide = {
  // ── Zabiegi na twarz i ciało ───────────────────────────────────────────────
  konsultacja: {
    image: consultImage,
    position: '45% 40%',
    sections: [
      co('Profesjonalna analiza stanu skóry, wywiad medyczny oraz ułożenie indywidualnego planu pielęgnacji domowej i gabinetowej.'),
      dlaKogo('Dla osób, które nie wiedzą, jak pielęgnować swoją skórę lub szukają skutecznego rozwiązania konkretnych problemów (trądzik, przebarwienia, zmarszczki).'),
      przebieg('Rozmowa, demakijaż, oględziny skóry pod lampą. Czas: 30–45 min.'),
      efekty('Pełna wiedza o potrzebach swojej cery i dopasowany plan zabiegowy.'),
      wazne('Cena 80 zł jest odejmowana od kosztu zabiegu, jeśli zostanie on wykonany w dniu konsultacji lub umówiony na inny termin.'),
    ],
  },
  peeling: {
    image: maskImage,
    position: '50% 55%',
    sections: [
      co('Oczyszczanie skóry za pomocą fali ultradźwiękowej, która w kontakcie z wilgocią usuwa martwe komórki naskórka i nadmiar sebum.'),
      dlaKogo('Dla każdego, nawet przy skórze naczynkowej i wrażliwej. Idealny jako baza pod każdy inny zabieg.'),
      przebieg('Nawilżenie skóry i przesuwanie po niej szpatułką ultradźwiękową. Czas: 30–40 min.'),
      efekty('Natychmiastowe wygładzenie, rozjaśnienie i odświeżenie cery. Można powtarzać co miesiąc.'),
      przeciw('Ciąża, metalowe implanty, rozrusznik serca, nowotwory.'),
    ],
  },
  'mezo-beziglowa': {
    image: mezoBezIglaImage,
    position: '55% 40%',
    sections: [
      co('Bezinwazyjna metoda wprowadzania substancji aktywnych w głąb skóry za pomocą zjawiska elektroporacji (impulsów elektrycznych).'),
      dlaKogo('Dla osób bojących się igieł, potrzebujących nawilżenia, napięcia i odżywienia skóry bez okresu rekonwalescencji.'),
      przebieg('Masaż głowicą emitującą impulsy z użyciem koktajlu witaminowego. Czas: ok. 45 min.'),
      efekty('Nawilżona, napięta i pełna blasku skóra. Najlepiej w serii 3–6 zabiegów co 2 tygodnie.'),
      przeciw('Ciąża, metalowe implanty, padaczka, stany zapalne skóry.'),
    ],
  },
  'mezo-mikroiglowa': {
    image: mezoMikroImage,
    position: '62% 50%',
    sections: [
      co('Kontrolowane mikronakłuwanie skóry, które wyzwala naturalne procesy naprawcze i stymuluje produkcję kolagenu.'),
      dlaKogo('Dla osób z bliznami, zmarszczkami, rozszerzonymi porami i wiotką skórą.'),
      przebieg('Nakłuwanie skóry urządzeniem z jednorazowym kartridżem i ampułką. Czas: ok. 60 min.'),
      efekty('Grubsza, bardziej jędrna skóra, redukcja niedoskonałości. Seria 3–5 zabiegów co miesiąc.'),
      przeciw('Ciąża, aktywny trądzik, opryszczka, zaburzenia krzepnięcia.'),
    ],
  },
  'mezo-iglowa': {
    image: mezoIglaImage,
    position: '58% 30%',
    sections: [
      co('Manualne podanie (igłą) kwasu hialuronowego i witamin bezpośrednio do skóry właściwej.'),
      dlaKogo('Dla cery dojrzałej, bardzo suchej, wymagającej silnej regeneracji i „zastrzyku” energii.'),
      przebieg('Seria drobnych nakłuć depozytowych na twarzy, szyi lub dekolcie. Czas: ok. 60 min.'),
      efekty('Głębokie nawilżenie, spłycenie zmarszczek, poprawa gęstości. Seria 3–4 zabiegów co 2–4 tygodnie.'),
      przeciw('Ciąża, lęk przed igłami (wtedy polecamy bezigłową), leki rozrzedzające krew.'),
    ],
  },
  stymulacja: {
    image: suchoscImage,
    position: '40% 40%',
    sections: [
      co('Zabieg łączący techniki manualne lub aparaturowe, mające na celu pobudzenie mięśni twarzy i napięcie włókien kolagenowych.'),
      dlaKogo('Dla osób z pierwszymi oznakami wiotczenia skóry i opadającym owalem twarzy.'),
      przebieg('Intensywny masaż stymulujący połączony z maską liftingującą. Czas: 45 min.'),
      efekty('Poprawa napięcia, uniesienie policzków, lepszy koloryt. Polecany raz na 2 tygodnie.'),
      przeciw('Stany zapalne skóry, świeże ekstrakcje zębów, gorączka.'),
    ],
  },
  indywidualny: {
    image: careImage,
    position: '50% 45%',
    sections: [
      co('Autorski zabieg kosmetologiczny, w którym preparaty i techniki są dobierane „na miejscu” po analizie potrzeb skóry w danym dniu.'),
      dlaKogo('Dla osób, które chcą oddać się w ręce profesjonalisty bez wybierania konkretnej pozycji z cennika.'),
      przebieg('Etapy dobierane indywidualnie (oczyszczanie, złuszczanie, ampułka, masaż, maska). Czas: ok. 60–75 min.'),
      efekty('Celowane rozwiązanie aktualnego problemu skóry (np. ukojenie, nawilżenie lub oczyszczenie).'),
      przeciw('Zależne od dobranych technik (ustalane podczas wywiadu).'),
    ],
  },
  mikrodermabrazja: {
    image: diamentImage,
    position: '50% 40%',
    sections: [
      co('Mechaniczne złuszczanie naskórka warstwa po warstwie za pomocą diamentowych głowic i podciśnienia.'),
      dlaKogo('Dla cery zanieczyszczonej, zrogowaciałej, z zaskórnikami i przebarwieniami.'),
      przebieg('Przesuwanie głowicy po skórze, „odkurzanie” martwego naskórka. Czas: 40 min.'),
      efekty('Idealnie gładka, miękka skóra, odblokowane pory. Powtarzać raz w miesiącu.'),
      przeciw('Trądzik różowaty, kruche naczynka, aktywne stany zapalne.'),
    ],
  },
  rf: {
    image: rfImage,
    position: '72% 50%',
    sections: [
      co('Bezinwazyjny lifting falami radiowymi, które podgrzewają skórę właściwą, stymulując kolagen do obkurczenia.'),
      dlaKogo('Dla osób z utratą jędrności, zmarszczkami i problemem „drugiego podbródka”.'),
      przebieg('Masaż głowicą emitującą ciepło (zabieg jest bardzo przyjemny). Czas: ok. 45 min.'),
      efekty('Natychmiastowe uniesienie owalu i napięcie skóry. Seria 4–8 zabiegów co 14 dni.'),
      przeciw('Ciąża, nowotwory, metalowe implanty w miejscu zabiegu.'),
    ],
  },
  bankietowy: {
    image: maskImage,
    position: '50% 55%',
    sections: [
      co('Ekspresowy zabieg upiększający, który daje efekt „wow” bezpośrednio przed ważnym wydarzeniem.'),
      dlaKogo('Dla osób potrzebujących natychmiastowego blasku, wypoczętej twarzy i idealnej bazy pod makijaż.'),
      przebieg('Delikatne złuszczanie, ampułka rozświetlająca i luksusowa maska (np. algowa lub płat). Czas: 45 min.'),
      efekty('Nawilżona, napięta i promienna cera – efekt widoczny od razu.'),
      przeciw('Alergia na składniki preparatów.'),
    ],
  },
  kobido: {
    image: suchoscImage,
    position: '40% 40%',
    sections: [
      co('Japońska technika masażu, która poprzez głęboką pracę na mięśniach daje efekt naturalnego liftingu.'),
      dlaKogo('Dla osób szukających alternatywy dla botoksu, zestresowanych, z napięciami w obszarze twarzy i szyi.'),
      przebieg('Szybkie, rytmiczne ruchy liftingujące i drenujące. Czas: ok. 60 min.'),
      efekty('Uniesienie owalu, redukcja zmarszczek mimicznych, głęboki relaks. Seria 5–10 zabiegów.'),
      przeciw('Stany zapalne, świeże nici PDO lub wypełniacze.'),
    ],
  },
  liposukcja: {
    image: bodyImage,
    position: '50% 50%',
    sections: [
      co('Redukcja tkanki tłuszczowej za pomocą ultradźwięków, wzmocniona promieniowaniem podczerwonym dla lepszego metabolizmu.'),
      dlaKogo('Dla osób walczących z oporną tkanką tłuszczową i cellulitem na udach, brzuchu czy pośladkach.'),
      przebieg('Masaż głowicą na wybranej partii ciała. Czas: 45 min.'),
      efekty('Zmniejszenie obwodów ciała i wygładzenie „pomarańczowej skórki”. Seria 6–10 zabiegów co tydzień.'),
      przeciw('Ciąża, niewydolność wątroby/nerek, metalowe implanty.'),
    ],
  },

  // ── Stylizacja rzęs ────────────────────────────────────────────────────────
  'uzup-1-1': {
    image: lashesNaturalImage,
    position: '55% 50%',
    sections: [
      co('Odświeżenie klasycznej aplikacji rzęs: doklejenie brakujących rzęs sztucznych do nowo wyrośniętych naturalnych.'),
      dlaKogo('Dla osób, które mają założoną aplikację 1:1 i chcą utrzymać naturalny efekt.'),
      przebieg('Usunięcie odrostów i aplikacja rzęs. Czas: ok. 60–90 min.'),
      wazne('Wykonywane do 3 tygodni od poprzedniej wizyty.'),
    ],
  },
  'uzup-2-3d': {
    image: rzesyImage,
    position: '40% 50%',
    sections: [
      co('Uzupełnienie lekkich objętości (pęczków 2–3 rzęs), aby przywrócić spojrzeniu puszystość.'),
      dlaKogo('Dla stałych klientek ceniących wyraźniejsze, ale wciąż lekkie zagęszczenie.'),
      przebieg('Precyzyjne dopełnienie linii rzęs pęczkami. Czas: ok. 90 min.'),
    ],
  },
  'przed-2-3d': {
    image: rzesyImage,
    position: '40% 50%',
    sections: [
      co('Założenie nowej aplikacji metodą lekkich objętości: do każdej naturalnej rzęsy doklejamy pęczek 2 lub 3 cienkich rzęs.'),
      dlaKogo('Dla osób chcących ukryć luki w rzęsach naturalnych lub pragnących bardziej „malowanego” oka.'),
      przebieg('Pełna stylizacja od podstaw. Czas: ok. 2 h.'),
      efekty('Puszysta, czarna linia rzęs, która pięknie otwiera oko.'),
    ],
  },
  'przed-3-4d': {
    image: lashesCrystalImage,
    position: '46% 50%',
    sections: [
      co('Metoda mocniejszego zagęszczenia (pęczki 3–4 rzęs) dla uzyskania wyraźnej czerni i gęstości.'),
      dlaKogo('Dla fanek mocnego makijażu i efektu „rzęs z reklamy”.'),
      przebieg('Aplikacja gęstych, puszystych pęczków. Czas: ok. 2 h 15 min.'),
      efekty('Bardzo wyraziste, ciemne rzęsy, maksymalne zagęszczenie.'),
    ],
  },
  'mokry-efekt': {
    image: lashesWetImage,
    position: '52% 50%',
    sections: [
      co('Unikalna stylizacja, w której pęczki nie są rozpostarte, co daje efekt rzęs jak po wyjściu z wody.'),
      dlaKogo('Dla osób szukających najmodniejszego efektu w tym sezonie – teksturalnego i innego niż klasyczne objętości.'),
      przebieg('Pełna stylizacja od podstaw. Czas: ok. 2 h.'),
      efekty('Wyraziste „pazurki”, optyczne zagęszczenie i bardzo nowoczesny wygląd.'),
    ],
  },
}

// Okno pokazuje: czas (pod nagłówkiem), szeroki opis, kafelki „dla kogo” i „efekty”
// oraz kafelek z przeciwwskazaniami (albo uwagą „Ważne”). Tekst „Przebieg” zostaje w danych,
// ale w oknie go nie pokazujemy – z niego wyciągamy tylko czas zabiegu.
function normalize({ sections, ...rest }) {
  const text = (label) => sections.find((section) => section.label === label)?.text ?? ''
  const process = text('Przebieg i czas')
  const duration = process.match(/Czas:\s*(.+?)\.?\s*$/)?.[1] ?? ''
  return {
    ...rest,
    duration,
    process,
    what: text('Co to jest'),
    forWhom: text('Dla kogo'),
    effects: text('Efekty'),
    avoid: text('Przeciwwskazania'),
    note: text('Ważne'),
  }
}

export const treatmentGuide = Object.fromEntries(
  Object.entries(rawGuide).map(([id, entry]) => [id, normalize(entry)]),
)

// Karty „Dobierz pielęgnację” → zabiegi z cennika, które otwiera ich przycisk „Dowiedz się więcej”.
// Karta dodana później w panelu nie ma tu wpisu, więc jej przycisk dalej prowadzi do cennika.
export const guideTreatmentIds = {
  zmarszczki: ['mezo-mikroiglowa'],
  suchosc: ['mezo-iglowa'],
  owal: ['rf', 'kobido'],
  bankiet: ['bankietowy'],
  spojrzenie: ['mokry-efekt', 'przed-2-3d'],
  pory: ['mikrodermabrazja'],
  przebarwienia: ['mezo-beziglowa'],
}

// Id wierszy w bazie (seed-pricing.sql) bywają inne niż w domyślnych danych – mapujemy je
// na klucze opisów, żeby okno działało w obu przypadkach.
const rowIdAliases = {
  'mezo-mikro': 'mezo-mikroiglowa',
  mikroderm: 'mikrodermabrazja',
}

// Klucz opisu dla wiersza cennika albo null, gdy zabieg nie ma opisu.
function guideKey(rowId) {
  const key = rowIdAliases[rowId] ?? rowId
  return treatmentGuide[key] ? key : null
}

// Klucz opisu dla wiersza cennika: znany zabieg (po id lub aliasie) albo po prostu jego id –
// dzięki temu okno mają też zabiegi dodane w panelu.
export function rowKey(row) {
  return guideKey(row?.id) ?? row?.id ?? ''
}

const GUIDE_TEXT_FIELDS = ['duration', 'what', 'forWhom', 'effects', 'avoid', 'note']

// Opis zabiegu do okna: to, co wpisano w panelu (`row.info`), a tam gdzie nic nie wpisano –
// domyślny tekst z tego pliku. Puste pole wpisane w panelu zostaje puste (można usunąć blok).
export function buildGuide(row) {
  const base = treatmentGuide[rowKey(row)]
  const info = row?.info ?? {}
  const guide = {}
  for (const field of GUIDE_TEXT_FIELDS) {
    guide[field] = typeof info[field] === 'string' ? info[field] : (base?.[field] ?? '')
  }
  const custom = info.image ? mediaUrl(info.image) : ''
  guide.image = custom || base?.image || fallbackImage
  guide.position = custom ? info.position || '50% 50%' : base?.position || '50% 50%'
  return guide
}

function hasGuideContent(guide) {
  return Boolean(guide.what || guide.forWhom || guide.effects || guide.avoid || guide.note)
}

// Opis do okna albo null, gdy zabieg nie ma żadnej treści (wtedy w cenniku nie ma „+”).
export function guideFor(row) {
  const guide = buildGuide(row)
  return hasGuideContent(guide) ? guide : null
}

// Nagłówek okna: bez dopisków w nawiasach (np. „(darmowa przy zabiegu)”) – ważne rzeczy są w opisie.
function treatmentTitle(name) {
  return String(name ?? '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
}

// Nagłówek zawsze w dwóch linijkach: dzielimy nazwę w miejscu, które daje najbardziej wyrównane
// linie (np. „Mezoterapia / mikroigłowa”, „Liposukcja kawitacyjna / z Infraterapią IR”).
export function treatmentTitleLines(name) {
  const words = treatmentTitle(name)
    .replace(/\s+[–-]\s+/g, ' ') // myślnik w środku nazwy (np. „Radiofrekwencja – zabieg RF”) pomijamy
    .split(/\s+/)
    .filter(Boolean)
  if (words.length < 2) return words

  let best = 1
  let bestDiff = Infinity
  for (let i = 1; i < words.length; i += 1) {
    const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}
