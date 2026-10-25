// Opisy pakietów – okno „Dowiedz się więcej”.
//
// Każdy pakiet ma podpis pod nagłówkiem (`lead`) oraz trzy punkty (`steps`): nazwa i krótki opis.
// Klucz = id pakietu (patrz `offer` w defaults.js). Pakiet bez wpisu tutaj dostaje w oknie
// zwykłą listę zabiegów z krótkimi opisami (treatmentInfo.js).
//
// Teksty warto przejrzeć z właścicielką: to ona wie najlepiej, jak zabiegi wyglądają w praktyce.

export const packageStories = {
  // ── Pakiety na twarz ───────────────────────────────────────────────────────
  'odswiezenie-blask': {
    lead: 'Dla skóry zmęczonej, pozbawionej energii i naturalnego blasku',
    steps: [
      {
        title: 'Peeling kawitacyjny',
        text: 'Skutecznie usuwa martwy naskórek, przygotowując skórę na przyjęcie składników aktywnych w głąb tkanek.',
      },
      {
        title: 'Mezoterapia bezigłowa',
        text: 'Bezbolesne wprowadzenie koktajlu witaminowego, które intensywnie nawilża i rozświetla cerę od wewnątrz.',
      },
      {
        title: 'Maska na twarz',
        text: 'Wycisza skórę po zabiegu i domyka proces regeneracji, pomagając zatrzymać efekt świeżości na dłużej.',
      },
    ],
  },

  'odmlodzenie-premium': {
    lead: 'Ekskluzywna terapia regeneracyjna przywracająca blask, gęstość i młodzieńczy kontur twarzy.',
    steps: [
      {
        title: 'Mezoterapia mikroigłowa',
        text: 'Frakcyjna stymulacja kolagenu i kontrolowana odnowa naskórka dla widocznie gładszej cery.',
      },
      {
        title: 'Stymulacja i ujędrnianie',
        text: 'Intensywna terapia ujędrniająca tkankę podskórną i poprawiająca napięcie skóry twarzy.',
      },
      {
        title: 'Maska regeneracyjna',
        text: 'Głębokie wyciszenie po zabiegach i utrwalenie efektów w komfortowej pielęgnacji końcowej.',
      },
    ],
  },

  'lifting-ujedrnienie': {
    lead: 'Dla cery wymagającej przywrócenia gęstości, napięcia i poprawy owalu twarzy',
    steps: [
      {
        title: 'Mezoterapia igłowa',
        text: 'Precyzyjne podanie kwasu hialuronowego i witamin – to fundament głębokiej odbudowy i ujędrnienia.',
      },
      {
        title: 'Radiofrekwencja (RF)',
        text: 'Energia fal radiowych stymuluje włókna kolagenowe, dając efekt „termoliftingu” i uniesienia owalu twarzy.',
      },
      {
        title: 'Maska na twarz',
        text: 'Intensywne ukojenie i nawilżenie, które wspiera naturalne procesy regeneracyjne wywołane przez ciepło RF.',
      },
    ],
  },

  // ── Mezoterapia ────────────────────────────────────────────────────────────
  'mezo-mikro-3': {
    lead: 'Dla skóry wymagającej intensywnej przebudowy',
    steps: [
      {
        title: 'Frakcyjne nakłuwanie',
        text: 'Mikrouszkodzenia pobudzają skórę do produkcji kolagenu i elastyny już od pierwszej wizyty.',
      },
      {
        title: 'Głębokie odżywienie',
        text: 'Koktajl substancji aktywnych regeneruje strukturę skóry i wspiera jej naturalną odbudowę.',
      },
      {
        title: 'Seria zabiegowa',
        text: 'Trzy wizyty w serii gwarantują trwałą poprawę gęstości i widoczne wygładzenie cery.',
      },
    ],
  },

  'mezo-beziglowa-3': {
    lead: 'Głębokie nawilżenie bez użycia igieł',
    steps: [
      {
        title: 'Elektroporacja',
        text: 'Impulsy elektryczne wprowadzają składniki nawilżające w głąb skóry bez nakłuwania.',
      },
      {
        title: 'Aktywne rozświetlenie',
        text: 'Skoncentrowane ampułki likwidują oznaki zmęczenia i przesuszenia, przywracając świeży wygląd.',
      },
      {
        title: 'Kumulacja efektu',
        text: 'Każdy zabieg wzmacnia barierę skóry, dając trwałą gładkość, miękkość i naturalny blask.',
      },
    ],
  },

  'mezo-iglowa-3': {
    lead: 'Witaminy i kwas hialuronowy dla wyraźnego odmłodzenia',
    steps: [
      {
        title: 'Iniekcja śródskórna',
        text: 'Preparat trafia dokładnie tam, gdzie skóra potrzebuje wsparcia i odżywienia w głębszych warstwach.',
      },
      {
        title: 'Ujędrnienie i regeneracja',
        text: 'Lepsza elastyczność, gęstość skóry i wyraźne spłycenie drobnych linii mimicznych.',
      },
      {
        title: 'Długofalowy rezultat',
        text: 'Efekt budowany przez trzy zabiegi utrzymuje się miesiącami i stopniowo się wzmacnia.',
      },
    ],
  },
  // ── Rzęsy i brwi ───────────────────────────────────────────────────────────
  'piekne-spojrzenie': {
    lead: 'Kompletna stylizacja oczu, która podkreśla głębię Twojego spojrzenia',
    steps: [
      {
        title: 'Przedłużanie rzęs 1:1',
        text: 'Naturalne wydłużenie i zagęszczenie, które eliminuje konieczność codziennego używania tuszu.',
      },
      {
        title: 'Stylizacja brwi',
        text: 'Indywidualnie dobrana regulacja i kolorystyka, która nadaje twarzy świeżości i charakteru.',
      },
      {
        title: 'Pielęgnacja oprawy',
        text: 'Instruktaż dbania o rzęsy i brwi, aby cieszyć się perfekcyjnym efektem jak najdłużej.',
      },
    ],
  },

  'perfekcyjne-brwi': {
    lead: 'Nowoczesna geometria i pielęgnacja dla wymagającej oprawy oczu',
    steps: [
      {
        title: 'Laminacja brwi',
        text: 'Ujarzmienie i nadanie kierunku włoskom, co optycznie zagęszcza brwi i nadaje im modny wygląd.',
      },
      {
        title: 'Stylizacja (regulacja + kolor)',
        text: 'Precyzyjne doprecyzowanie kształtu i nasycenie kolorem dopasowanym do Twojej urody.',
      },
      {
        title: 'Wykończenie',
        text: 'Utrwalenie efektu profesjonalnym preparatem, który chroni brwi i utrzymuje ich kształt.',
      },
    ],
  },

  'full-look': {
    lead: 'Maksymalne podkreślenie oprawy oczu dla kobiet lubiących wyrazisty efekt',
    steps: [
      {
        title: 'Przedłużanie rzęs 2/3D',
        text: 'Wyraźna objętość i lekkość rzęs, które nadają spojrzeniu magnetyzującej głębi i wdzięku.',
      },
      {
        title: 'Laminacja brwi',
        text: 'Idealne ułożenie włosków, które dopełnia całą stylizację i modeluje górną część twarzy.',
      },
      {
        title: 'Harmonia stylu',
        text: 'Kompleksowy zabieg, po którym Twoje oczy stają się głównym i najpiękniejszym atutem twarzy.',
      },
    ],
  },

  // ── Pakiety na stopy ───────────────────────────────────────────────────────
  'klasyczny-relaks': {
    lead: 'Chwila wytchnienia dla Twoich stóp połączona z nieskazitelną elegancją.',
    steps: [
      {
        title: 'Pedicure hybrydowy',
        text: 'Precyzyjne opracowanie płytki paznokcia zwieńczone trwałym kolorem o głębokim, lustrzanym połysku.',
      },
      {
        title: 'Relaksujący masaż',
        text: 'Kojące zakończenie zabiegu, które niweluje napięcia, przynosząc natychmiastową lekkość i odprężenie.',
      },
      {
        title: 'Harmonia i estetyka',
        text: 'Efekt idealnie zadbanych stóp, który dodaje pewności siebie i zapewnia pełen komfort w każdym kroku.',
      },
    ],
  },

  'spa-nawilzenie': {
    lead: 'Głęboko regenerujący rytuał dla stóp spragnionych aksamitnej miękkości.',
    steps: [
      {
        title: 'Pedicure SPA',
        text: 'Wieloetapowa pielęgnacja: od aromatycznej kąpieli i wygładzającego peelingu, aż po intensywne odżywienie skóry.',
      },
      {
        title: 'Kojący masaż stóp',
        text: 'Dotyk, który uwalnia od trudów dnia, stymulując zmysły i przywracając energię całemu ciału.',
      },
      {
        title: 'Jedwabista gładkość',
        text: 'Profesjonalna terapia nawilżająca, która przywraca skórze elastyczność oraz zdrowy, promienny wygląd.',
      },
    ],
  },

  'luksusowe-spa': {
    lead: 'Najwyższy wymiar pielęgnacji – absolutne odrodzenie i perfekcyjny wygląd.',
    steps: [
      {
        title: 'Pedicure SPA + hybryda',
        text: 'Ekskluzywne połączenie rytuału głębokiej pielęgnacji z nieskazitelną trwałością i blaskiem koloru.',
      },
      {
        title: 'Maska okluzyjna z masażem',
        text: 'Intensywna kuracja pod okluzją, która sprawia, że skóra staje się niewiarygodnie miękka, jedwabista i odżywiona.',
      },
      {
        title: 'Królewski rytuał',
        text: 'Kompleksowy bankiet dla stóp, łączący najwyższą estetykę z najgłębszym poziomem regeneracji i relaksu.',
      },
    ],
  },
  // ── Pakiety łączone ────────────────────────────────────────────────────────
  'perfect-day': {
    lead: 'Gdy potrzebujesz natychmiastowego efektu „wow” i perfekcyjnej oprawy oczu',
    steps: [
      {
        title: 'Peeling kawitacyjny i maska',
        text: 'Ekspresowe oczyszczenie i nawilżenie – idealna baza, dzięki której cera wygląda świeżo pod makijażem.',
      },
      {
        title: 'Stylizacja brwi',
        text: 'Precyzyjna regulacja i nadanie kształtu, który staje się naturalną i estetyczną ramą dla Twojej twarzy.',
      },
      {
        title: 'Przedłużanie rzęs 1:1',
        text: 'Subtelne zagęszczenie rzęs, które otwiera oko i nadaje całej stylizacji spójności i lekkości.',
      },
    ],
  },

  'panny-mlodej': {
    lead: 'Dla przyszłych panien młodych, które pragną nieskazitelnego wyglądu i spokoju',
    steps: [
      {
        title: 'Mezoterapia mikroigłowa',
        text: 'BioPen perfekcyjnie wygładza teksturę skóry, przygotowując ją pod idealny i trwały makijaż ślubny.',
      },
      {
        title: 'Rzęsy 2/3D i laminacja brwi',
        text: 'Spektakularne spojrzenie i symetria brwi – pewność siebie bez konieczności codziennego malowania.',
      },
      {
        title: 'Masaż twarzy',
        text: 'Moment rytualnego spokoju, który rozładowuje napięcie i nadaje twarzy wypoczęty, promienny wygląd.',
      },
    ],
  },

  'miesieczna-pielegnacja': {
    lead: 'Dla kobiet dbających o siebie regularnie, ceniących kompleksowy efekt i relaks',
    steps: [
      {
        title: 'Dwa zabiegi na twarz',
        text: 'Indywidualna terapia dobrana do aktualnych potrzeb Twojej skóry – bo każda wizyta to inna historia.',
      },
      {
        title: 'Pedicure SPA',
        text: 'Chwila wytchnienia dla stóp i umysłu – profesjonalna pielęgnacja połączona z głębokim odprężeniem.',
      },
      {
        title: 'Rzęsy 1:1 lub laminacja brwi',
        text: 'Podkreślenie naturalnej oprawy oczu, dzięki któremu oszczędzasz czas podczas porannego makijażu.',
      },
    ],
  },
}

// W nazwach pakietów „&” zastępujemy spójnikiem „i” (także gdy stara nazwa jest zapisana w bazie).
export function cleanPackageName(name) {
  return String(name ?? '').replace(/\s&\s/g, ' i ')
}
// Nagłówek okna: „MEZOTERAPIA IGŁOWA – 3 ZABIEGI” → dwie linijki (typ + liczba zabiegów), bez myślnika.
// Pozostałe nazwy zostają w jednej linii (zawijają się same).
export function packageTitleLines(name) {
  const clean = cleanPackageName(name)
  const match = clean.match(/^(mezoterapia)\s+(.+?)\s+[–-]\s+(.+)$/i)
  if (match) return [`${match[1]} ${match[2]}`, match[3]]
  return [clean.replace(/\s+[–-]\s+/g, ' ')]
}