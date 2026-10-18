// Treści domyślne — używane, dopóki dana sekcja nie zostanie zapisana w bazie
// (tabela `sections`) oraz jako awaryjny zapas, gdy Supabase jest niedostępny.
// Kształt każdego obiektu musi zgadzać się z tym, co zapisuje panel admina.

export const contactDefaults = {
  city: 'Lublin',
  address: 'ul. Eugeniusza Romera 30, 20-487 Lublin',
  hours: ['pon.–pt. 09:00–19:00', 'sob. 09:00–15:00'],
  phone: '+48 501 280 578',
  phoneHref: 'tel:+48501280578',
  facebook: 'https://www.facebook.com/profile.php?id=61579249767619',
  instagram: 'https://www.instagram.com/beautybarbimed',
  booksy: 'https://booksy.com/pl-pl/310504_beauty-barbi-med_salon-kosmetyczny_6832_lublin?do=invite',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2310.7801490513057!2d22.539603176364665!3d51.20897797174693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4722579777dcff97%3A0xd5dd5d5647feea71!2sBeauty%20Barbi-Med%20-Paznokcie%2C%20Rz%C4%99sy%20i%20Kosmetologia!5e0!3m2!1spl!2spl!4v1791565871919!5m2!1spl!2spl',
  mapLink: 'https://maps.google.com/?q=Eugeniusza+Romera+30,+20-487+Lublin',
  // Link „Google Reviews” w sekcji opinie (wizytówka firmy w Google Maps).
  reviewsLink: 'https://maps.app.goo.gl/X9YLZd4hAfLo7LHV8',
  parking: '',
  entranceImage: '',
  entranceImageAlt: '',
}

export const sectionDefaults = {
  hero: {
    eyebrow: 'Kosmetologia Medyczna & Oprawa Spojrzenia · Lublin',
    titleLead: 'Piękno oparte na',
    titleAccent: 'wiedzy medycznej',
    description:
      'Zaawansowane zabiegi rewitalizacji cery i mezoterapii wykonywane pewną ręką dyplomowanej pielęgniarki oraz mistrzowska stylizacja rzęs i dłoni w kameralnym gabinecie przy ul. Romera 30.',
    primaryCta: 'Umów wizytę',
    secondaryCta: 'Zabiegi i cennik',
    trustHighlights: [
      { id: 'nurse', primary: 'Pielęgniarka', secondary: 'kwalifikacje medyczne' },
      { id: 'biopen', primary: 'BioPen', secondary: 'Tropokolagen' },
      { id: 'sterile', primary: 'Standard medyczny', secondary: 'sterylność procedur' },
      { id: 'location', primary: 'Lublin', secondary: 'ul. Romera 30,' },
    ],
    backgroundImage: '',
  },

  about: {
    kicker: 'Duet Ekspertek',
    titleLead: 'Nowy gabinet,',
    titleAccent: 'sprawdzone ręce',
    lead:
      'Beauty Barbi Med to nasza kameralna przestrzeń, w której pasję do świadomej pielęgnacji łączymy z twardymi kompetencjami. Tworzymy zgrany, dwuosobowy zespół specjalistek, dzięki czemu możesz liczyć na w pełni indywidualne podejście – zawsze wiesz, kto się Tobą zajmie.',
    paragraph:
      'Naszym absolutnym fundamentem jest bezpieczeństwo medyczne. Lata doświadczenia w ochronie zdrowia pozwalają nam gwarantować bezkompromisową sterylność i precyzję. Specjalizujemy się w zaawansowanej mezoterapii igłowej oraz profesjonalnej stylizacji oprawy oka, dbając o Ciebie wyłącznie przy użyciu certyfikowanych preparatów.',
    teamLabel: 'Dwuosobowy zespół',
    team: [
      {
        id: 'barbara',
        name: 'Barbara',
        role: 'Pielęgniarka · Mezoterapia igłowa',
        desc: 'Wieloletnie doświadczenie przy pacjencie, pewna ręka przy iniekcjach, sterylność i indywidualna kwalifikacja skóry.',
      },
      {
        id: 'klaudia',
        name: 'Klaudia',
        role: 'Stylistka brwi i rzęs',
        desc: 'Specjalistka efektu mokrego (wet look), aplikacji objętościowych, zdobień okolicznościowych i luksusowego Pedicure SPA.',
      },
    ],
    signature: 'Barbara & Klaudia',
    image: '',
    imageAlt: 'Wnętrze gabinetu Beauty Barbi Med w Lublinie',
    pillars: [
      {
        id: 'doswiadczenie',
        title: 'Praktyka medyczna',
        text: 'Lata pracy z pacjentem i igłą - bezpieczeństwo, sterylność i rzetelny wywiad.',
        icon: 'shield',
      },
      {
        id: 'aparatura',
        title: 'Technologia BioPen',
        text: 'Certyfikowana mezoterapia mikroigłowa i oryginalny Tropokolagen z rejestracją.',
        icon: 'plan',
      },
      {
        id: 'preparaty',
        title: 'Pakiety jednorazowe',
        text: 'Każdy pakiet otwierany przy klientce. Czystość i higiena na poziomie szpitalnym.',
        icon: 'seal',
      },
      {
        id: 'kameralnie',
        title: 'Prywatność 1 na 1',
        text: 'Brak tłumu i pośpiechu. Cała uwaga i czas są poświęcone wyłącznie Tobie.',
        icon: 'leaf',
      },
    ],
  },

  offer: {
    kicker: 'Pakiety zabiegowe',
    titleLead: 'Wyselekcjonowane rytuały',
    titleAccent: 'piękna',
    intro:
      'Starannie dobrane terapie łączone w odstępach 2–4 tygodni — wyraźnie lepsze rezultaty i korzystniejsza cena w pakiecie.',
    categories: [
      {
        id: 'twarz',
        icon: 'droplet',
        tabLabel: 'NA TWARZ',
        title: 'PAKIETY NA TWARZ',
        subtitle: 'Kompleksowa pielęgnacja.',
        footnote: 'Zabiegi wykonywane w odstępach 2–4 tygodni.',
        packages: [
          {
            id: 'odswiezenie-blask',
            name: 'ODŚWIEŻENIE I BLASK',
            items: ['Peeling kawitacyjny', 'Mezoterapia bezigłowa', 'Maska na twarz'],
            price: 249,
            was: 330,
            save: 81,
          },
          {
            id: 'odmlodzenie-premium',
            name: 'ODMŁODZENIE PREMIUM',
            items: ['Mezoterapia mikroigłowa', 'Stymulacja i ujędrnianie skóry', 'Maska na twarz'],
            price: 499,
            was: 620,
            save: 121,
          },
          {
            id: 'lifting-ujedrnienie',
            name: 'LIFTING I UJĘDRNIENIE',
            items: ['Mezoterapia igłowa', 'Radiofrekwencja – zabieg RF', 'Maska na twarz'],
            price: 699,
            was: 840,
            save: 141,
          },
        ],
      },
      {
        id: 'mezoterapia',
        icon: 'sparkle',
        tabLabel: 'MEZOTERAPIA',
        title: 'PAKIETY MEZOTERAPII',
        subtitle: 'Skuteczna regeneracja i odżywienie.',
        footnote: 'Zabiegi wykonywane w odstępach 2–4 tygodni.',
        packages: [
          {
            id: 'mezo-mikro-3',
            name: 'MEZOTERAPIA MIKROIGŁOWA – 3 ZABIEGI',
            description:
              'Głębokie odżywienie, regeneracja i poprawa struktury skóry.',
            price: 750,
            was: 810,
            save: 60,
          },
          {
            id: 'mezo-beziglowa-3',
            name: 'MEZOTERAPIA BEZIGŁOWA – 3 ZABIEGI',
            description: 'Nawilżenie, rozświetlenie i poprawa elastyczności skóry.',
            price: 650,
            was: 750,
            save: 100,
          },
          {
            id: 'mezo-iglowa-3',
            name: 'MEZOTERAPIA IGŁOWA – 3 ZABIEGI',
            description: 'Intensywna regeneracja, ujędrnienie i odmłodzenie skóry.',
            price: 1050,
            was: 1200,
            save: 150,
          },
        ],
      },
      {
        id: 'rzesy-brwi',
        icon: 'nail',
        tabLabel: 'RZĘSY & BRWI',
        title: 'PAKIETY RZĘSY & BRWI',
        subtitle: 'Podkreśl spojrzenie i zaoszczędź.',
        footnote: 'Zyskaj czas i idealny look każdego dnia!',
        packages: [
          {
            id: 'piekne-spojrzenie',
            name: 'PIĘKNE SPOJRZENIE',
            items: [
              'Przedłużanie rzęs 1:1',
              'Stylizacja brwi (regulacja + farbka/henna)',
            ],
            price: 189,
            was: 220,
            save: 31,
          },
          {
            id: 'perfekcyjne-brwi',
            name: 'PERFEKCYJNE BRWI',
            items: ['Laminacja brwi', 'Stylizacja brwi (regulacja + farbka/henna)'],
            price: 159,
            was: 200,
            save: 41,
          },
          {
            id: 'full-look',
            name: 'FULL LOOK',
            items: ['Przedłużanie rzęs 2/3D', 'Laminacja brwi'],
            price: 289,
            was: 330,
            save: 41,
          },
        ],
      },
      {
        id: 'pedicure-spa',
        icon: 'leaf',
        tabLabel: 'PEDICURE SPA',
        title: 'PAKIETY PEDICURE SPA',
        subtitle: 'Zadbane stopy, pełen relaks.',
        packages: [
          {
            id: 'klasyczny-relaks',
            name: 'KLASYCZNY RELAKS',
            items: ['Pedicure hybrydowy', 'Masaż stóp'],
            price: 169,
            was: 180,
            save: 11,
          },
          {
            id: 'spa-nawilzenie',
            name: 'SPA NAWILŻENIE',
            items: ['Pedicure SPA', 'Masaż stóp'],
            price: 199,
            was: 220,
            save: 21,
          },
          {
            id: 'luksusowe-spa',
            name: 'LUKSUSOWE SPA',
            items: ['Pedicure SPA + hybryda', 'Maska + masaż stóp'],
            price: 249,
            was: 300,
            save: 51,
          },
        ],
      },
      {
        id: 'okazja',
        icon: 'star',
        tabLabel: 'NA SPECJALNĄ OKAZJĘ',
        title: 'PAKIETY NA SPECJALNĄ OKAZJĘ',
        subtitle: 'Bądź piękna w ważnym dniu.',
        packages: [
          {
            id: 'perfect-day',
            name: 'PERFECT DAY',
            items: [
              'Zabieg na twarz (peeling kawitacyjny + maska)',
              'Stylizacja brwi',
              'Przedłużanie rzęs 1:1',
            ],
            price: 339,
            was: 410,
            save: 71,
          },
          {
            id: 'panny-mlodej',
            name: 'PANNY MŁODEJ',
            items: [
              'Zabieg na twarz (mikroigłowa)',
              'Rzęsy 2/3D + laminacja brwi',
              'Masaż twarzy',
            ],
            price: 599,
            was: 730,
            save: 131,
          },
        ],
      },
      {
        id: '4-tygodnie',
        icon: 'plan',
        tabLabel: 'URODA NA 4 TYGODNIE',
        title: 'PAKIET URODA NA 4 TYGODNIE',
        subtitle: 'Twoja regularna pielęgnacja.',
        packages: [
          {
            id: 'miesieczna-pielegnacja',
            name: 'MIESIĘCZNA PIELĘGNACJA DLA CIEBIE',
            items: [
              '2 zabiegi na twarz (dowolne)',
              '1 pedicure SPA (wybrany)',
              '1 stylizacja rzęs 1:1 lub laminacja brwi',
            ],
            price: 899,
            was: 1080,
            save: 181,
          },
        ],
      },
    ],
  },

  skinGuide: {
    kicker: '',
    titleLead: 'Dobierz',
    titleAccent: 'pielęgnację',
    intro:
      'Skupiamy się na realnych efektach. Wybierz obszar, nad którym chcesz popracować, a my zaproponujemy sprawdzone rozwiązanie.',
    expertBadge: 'Rekomendacja eksperta',
    quote:
      'Wierzymy, że najpiękniejsza wersja Ciebie to ta, w której czujesz się pewnie we własnej skórze.',
    quoteSignature: '— Twój zespół Beauty Barbi Med',
    options: [
      {
        id: 'zmarszczki',
        label: 'Głęboka regeneracja & pierwsze zmarszczki',
        tag: 'Dla cery wymagającej odbudowy',
        recommended: 'Mezoterapia mikroigłowa BioPen / Tropokolagen',
        desc: 'Zabieg, który pobudza skórę do naturalnej odnowy. Idealny, gdy czujesz, że cera straciła witalność i gęstość.',
        why: 'Widoczne wygładzenie tekstury i zwężenie porów już po pierwszym zabiegu.',
        duration: 'ok. 50–60 min',
        price: '270 zł',
        serviceId: 'mezoterapia',
      },
      {
        id: 'suchosc',
        label: 'Suchość, brak blasku i poszarzała cera',
        tag: 'Intensywny zastrzyk nawilżenia',
        recommended: 'Mezoterapia igłowa kwasem hialuronowym',
        desc: 'Bezpośrednie podanie witamin i kwasu hialuronowego w skórę właściwą — szybka droga do promiennej, nawilżonej cery.',
        why: 'Efekt „szklanej skóry” i lepsze przyjęcie makijażu już po pierwszej wizycie.',
        duration: 'ok. 50 min',
        price: '400 zł',
        serviceId: 'mezoterapia',
      },
      {
        id: 'owal',
        label: 'Utrata jędrności i opadający owal twarzy',
        tag: 'Bezinwazyjny lifting',
        recommended: 'Radiofrekwencja (RF) + masaż z elementami Kobido',
        desc: 'Połączenie ciepła RF z pracą manualną unosi kontur twarzy i przywraca uczucie napięcia bez igieł.',
        why: 'Wyraźniejszy owal i jędrniejsza skóra w serii zabiegów — bez okresu rekonwalescencji.',
        duration: 'ok. 60 min',
        price: 'RF 270 zł + Kobido 150 zł',
        serviceId: 'mezoterapia',
      },
      {
        id: 'bankiet',
        label: 'Ważne wyjście za 1–2 dni (Efekt WOW)',
        tag: 'Zero rekonwalescencji',
        recommended: 'Zabieg bankietowy z maską odżywczą',
        desc: 'Ekspresowe wygładzenie i nawilżenie cery, która ma zachwycić pod makijażem — bez przestoju.',
        why: 'Natychmiastowy blask i wyrównanie kolorytu tuż przed ważnym wydarzeniem.',
        duration: 'ok. 55 min',
        price: '120 zł',
        serviceId: 'mezoterapia',
      },
      {
        id: 'spojrzenie',
        label: 'Kuszące spojrzenie bez konieczności tuszowania',
        tag: 'Lekkość i wygoda na co dzień',
        recommended: 'Przedłużanie rzęs: Mokry Efekt / 2–3D',
        desc: 'Precyzyjna aplikacja lekkich rzęs podkreśla kolor tęczówki i oszczędza czas w codziennym makijażu.',
        why: 'Naturalny, świeży efekt utrzymujący się tygodniami — bez smug i bez porannej rutyny z tuszem.',
        duration: 'ok. 120 min',
        price: 'od 150 zł',
        serviceId: 'rzesy',
      },
      {
        id: 'pory',
        label: 'Rozszerzone pory i nierówna tekstura',
        tag: 'Wygładzenie i oczyszczenie',
        recommended: 'Mikrodermabrazja diamentowa',
        desc: 'Delikatna eksfoliacja wygładza relief skóry i poprawia wchłanianie preparatów pielęgnacyjnych.',
        why: 'Cera staje się gładsza w dotyku, a pory wizualnie mniej widoczne po serii zabiegów.',
        duration: 'ok. 45 min',
        price: '130 zł',
        serviceId: 'mezoterapia',
      },
      {
        id: 'przebarwienia',
        label: 'Przebarwienia i matowa cera',
        tag: 'Równy koloryt',
        recommended: 'Mezoterapia bezigłowa z witaminami',
        desc: 'Prądy i ultradźwięki wprowadzają składniki aktywne głębiej — bez nakłuć, z efektem rozświetlenia.',
        why: 'Stopniowe wyrównanie kolorytu i jaśniejszy, bardziej wypoczęty wygląd skóry.',
        duration: 'ok. 50 min',
        price: '250 zł',
        serviceId: 'mezoterapia',
      },
    ],
  },

  process: {
    kicker: 'Standard wizyty',
    titleLead: 'Bezpieczeństwo',
    titleAccent: 'krok po kroku',
    stepsLabel: 'Jak wygląda każda wizyta u nas krok po kroku',
    intro:
      'Wierzymy, że każdy zabieg to harmonijne połączenie Twoich potrzeb\ni naszej wiedzy medycznej.',
    quote: 'Twoje zadowolenie jest u nas zawsze na pierwszym miejscu.',
    image: '',
    imageAlt: 'Zabieg kosmetologiczny w gabinecie Beauty Barbi Med',
    steps: [
      {
        id: 'rozmowa',
        title: 'Szczegółowy wywiad',
        text: 'Rozmawiamy o Twoim zdrowiu, przebytych zabiegach i marzeniach o wyglądzie.',
      },
      {
        id: 'kwalifikacja',
        title: 'Kwalifikacja i plan',
        text: 'Dobieramy odpowiedni preparat lub technikę dopasowaną do Twojej skóry.',
      },
      {
        id: 'zabieg',
        title: 'Sterylny zabieg',
        text: 'Pracujemy w pełnym reżimie sanitarnym, dbając o każdy aspekt higieny.',
      },
      {
        id: 'zalecenia',
        title: 'Opieka pozabiegowa',
        text: 'Otrzymujesz jasne wskazówki i nasz stały kontakt po powrocie do domu.',
      },
    ],
    ctaText: '',
    ctaLabel: '',
  },

  pricing: {
    kicker: '',
    titleLead: 'Cennik Zabiegów',
    titleAccent: '',
    groups: [
      {
        id: 'twarz',
        label: 'Zabiegi na Twarz i Ciało',
        rows: [
          { id: 'konsultacja', name: 'Konsultacja kosmetologiczna (darmowa przy zabiegu)', price: '80 zł' },
          { id: 'peeling', name: 'Peeling kawitacyjny', price: '80 zł' },
          { id: 'mezo-beziglowa', name: 'Mezoterapia bezigłowa', price: '250 zł' },
          { id: 'mezo-mikroiglowa', name: 'Mezoterapia mikroigłowa', price: '270 zł' },
          { id: 'mezo-iglowa', name: 'Mezoterapia igłowa', price: '400 zł' },
          { id: 'stymulacja', name: 'Stymulacja i ujędrnianie skóry twarzy', price: '120 zł' },
          { id: 'indywidualny', name: 'Zabieg indywidualnie dobrany (na twarz)', price: '200 zł' },
          { id: 'mikrodermabrazja', name: 'Mikrodermabrazja diamentowa', price: '130 zł' },
          { id: 'rf', name: 'Radiofrekwencja – zabieg RF', price: '270 zł' },
          { id: 'bankietowy', name: 'Zabieg bankietowy na twarz z maską', price: '120 zł' },
          { id: 'kobido', name: 'Masaż twarzy z elementami Kobido', price: '150 zł' },
          { id: 'liposukcja', name: 'Liposukcja kawitacyjna z Infraterapią IR', price: '170 zł' },
        ],
      },
      {
        id: 'rzesy',
        label: 'Stylizacja Rzęs',
        rows: [
          { id: 'uzup-1-1', name: 'Uzupełnienie rzęs 1:1', price: '100 zł' },
          { id: 'uzup-2-3d', name: 'Uzupełnienie rzęs 2/3D', price: '130 zł' },
          { id: 'przed-2-3d', name: 'Przedłużanie rzęs 2/3D', price: '160 zł' },
          { id: 'przed-3-4d', name: 'Przedłużanie rzęs 3/4D', price: '180 zł' },
          { id: 'mokry-efekt', name: 'Przedłużanie rzęs Mokry Efekt', price: '150 zł' },
        ],
      },
      {
        id: 'pedicure',
        label: 'Pedicure',
        rows: [
          { id: 'ped-hybryda', name: 'Pedicure hybrydowy', price: '130 zł' },
          { id: 'ped-spa', name: 'Pedicure SPA', price: '140 zł' },
          { id: 'ped-spa-maska', name: 'Pedicure SPA + hybryda z maską', price: '150 zł' },
          { id: 'ped-spa-maska-masaz', name: 'Pedicure SPA + hybryda z maską i masażem stóp', price: '170 zł' },
        ],
      },
    ],
  },

  faq: {
    titleLead: 'Wszystko, co warto',
    titleAccent: 'wiedzieć',
    items: [
      {
        id: 'bol',
        question: 'Czy mezoterapia igłowa i mikroigłowa boli?',
        answer:
          'Zabiegi mezoterapii igłowej i mikroigłowej nie należą do bolesnych, choć z natury mogą powodować delikatny dyskomfort. Aby całkowicie go zniwelować, przed każdym zabiegiem aplikujemy na skórę wysokiej jakości krem znieczulający z lidokainą. Dzięki temu cała procedura jest maksymalnie relaksująca i praktycznie bezbolesna.',
      },
      {
        id: 'biopen',
        question: 'Czym jest urządzenie BioPen i dlaczego warto je wybrać?',
        answer:
          'BioPen to zaawansowane urządzenie do frakcyjnych mikronakłuć naskórka z jednoczesną infuzją składników aktywnych i fototerapią LED. Pobudza skórę do produkcji nowego kolagenu, spłyca pory i rozświetla cerę bez długiego okresu rekonwalescencji.',
      },
      {
        id: 'pierwsza-wizyta',
        question: 'Jak przygotować się do pierwszej wizyty w gabinecie?',
        answer:
          'Na pierwszą wizytę przyjdź bez makijażu (jeśli to możliwe) i zabierz ze sobą nazwy kosmetyków, których aktualnie używasz. Przed zabiegiem przeprowadzimy szczegółową konsultację, aby dobrać idealną terapię dla Twojej skóry.',
      },
      {
        id: 'przeciwwskazania',
        question: 'Jakie są główne przeciwwskazania do zabiegów z użyciem igieł?',
        answer:
          'Do głównych przeciwwskazań należą: ciąża, okres karmienia piersią, aktywne stany zapalne skóry, opryszczka oraz choroby autoimmunologiczne. O wszystkich szczegółach porozmawiamy podczas obowiązkowej ankiety przedzabiegowej.',
      },
      {
        id: 'booksy',
        question: 'W jaki sposób najłatwiej umówić wizytę?',
        answer:
          'Najwygodniej przez aplikację lub stronę Booksy, gdzie widzisz wszystkie wolne godziny w czasie rzeczywistym. Możesz także zadzwonić bezpośrednio pod numer gabinetu: +48 501 280 578.',
      },
    ],
  },

  gallery: {
    kicker: '',
    titleLead: 'Poznaj nasze portfolio',
    titleAccent: '',
    intro: 'Zobacz efekty pracy tworzonej z troską o każdy detal.',
  },

  reviews: {
    titleLead: 'Co mówią o nas',
    titleAccent: 'klientki',
    intro:
      'Jesteśmy nowym miejscem, dlatego pokazujemy wybrane opinie naszych pierwszych klientek.',
    fallbackReviews: [],
  },

  contact: {
    titleLead: 'Kontakt i',
    titleAccent: 'Lokalizacja',
    bookingLabel: 'Rezerwacja terminu',
    bookingText:
      'Wolne terminy znajdziesz w Booksy 24/7. Masz pytania? Zadzwoń – chętnie doradzimy.',
    panelLabel: 'Rezerwacja',
    panelTitle: 'Umów wizytę w dogodnym terminie',
    panelText:
      'Rezerwuj 24/7 online przez Booksy lub zadzwoń do nas, jeśli masz dodatkowe pytania przed zabiegiem.',
    primaryCta: 'Umów wizytę',
    routeCta: 'Wyznacz trasę',
    facebookLabel: 'Facebook',
    entrancePlaceholder: 'Zdjęcie wejścia',
  },

  booking: {
    kicker: 'Rezerwacja Wizyty',
    title: 'Wybierz dogodny sposób',
    text:
      'Sprawdź wolne terminy online na Booksy lub skontaktuj się z nami bezpośrednio pod numerem telefonu.',
    note: 'Przed zabiegami mezoterapii zawsze przeprowadzamy wywiad medyczny.',
  },

  footer: {
    tagline: 'Gdzie uroda łączy się z medycyną i kobiecym pięknem.',
    services: [
      'Mezoterapia mikroigłowa BioPen',
      'Mezoterapia igłowa Tropokolagen',
      'Radiofrekwencja RF & Masaż Kobido',
      'Stylizacja Rzęs: Mokry Efekt',
      'Pedicure SPA z masażem stóp',
    ],
    legal:
      '© Beauty Barbi Med Lublin. Treści na stronie mają charakter informacyjny i edukacyjny.',
  },
}
