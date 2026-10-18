import ContactPanel from './panels/ContactPanel'

import NoticesPanel from './panels/NoticesPanel'

import GalleryPanel from './panels/GalleryPanel'

import ReviewsPanel from './panels/ReviewsPanel'

import OfferPanel from './panels/OfferPanel'

import PricingPanel from './panels/PricingPanel'



export const adminNavItems = [

  {

    id: 'home',

    label: 'Przegląd',

    hint: 'Szybki wybór sekcji',

    icon: 'overview',

    pageDescription:

      'Podsumowanie tego, co jest ustawione na stronie. Kliknij kafel, żeby przejść do edycji.',

    Panel: null,

  },

  {

    id: 'pakiety',

    label: 'Pakiety',

    hint: 'Zestawy zabiegów i ceny',

    icon: 'packages',

    pageDescription:

      'Tak będą wyglądać pakiety na stronie. Po skończeniu, naciśnij **Zapisz na stronie**.',

    Panel: OfferPanel,

  },

  {

    id: 'cennik',

    label: 'Cennik',

    hint: 'Pojedyncze usługi i stawki',

    icon: 'pricing',

    pageDescription:

      'Lista zabiegów jak na stronie. Kliknij wiersz, aby edytować lub plus, aby dodać zabieg, na końcu naciśnij **Zapisz na stronie**.',

    Panel: PricingPanel,

  },

  {

    id: 'firma',

    label: 'Dane firmy',

    hint: 'Adres, telefon, godziny',

    icon: 'company',

    pageDescription:

      'Dane wyświetlane w zakładce Kontakt na stronie wraz z mapą. Po zmianach kliknij **Zapisz na stronie**.',

    Panel: ContactPanel,

  },

  {

    id: 'portfolio',

    label: 'Portfolio',

    hint: 'Zdjęcia efektów pracy',

    icon: 'portfolio',

    pageDescription:

      'Zdjęcia w portfolio — tak jak w galerii na stronie.\n**Plus w rogu** dodaje zdjęcia. Kliknij kafelek, wpisz podpis i **Zapisz**. Kolejność: strzałki ↑↓ (1 = na początku).',

    Panel: GalleryPanel,

  },

  {

    id: 'opinie',

    label: 'Opinie',

    hint: 'Recenzje klientek',

    icon: 'reviews',

    pageDescription:

      'Opinie klientek — tak jak w sekcji na stronie (gwiazdki i krótki tekst).\n**Plus w rogu** dodaje opinię. Kliknij wiersz, uzupełnij i **Zapisz**. Kolejność: strzałki ↑↓. Publikuj tylko za zgodą autora.',

    Panel: ReviewsPanel,

  },

  {

    id: 'komunikaty',

    label: 'Komunikaty',

    hint: 'Pasek u góry strony',

    icon: 'notices',

    pageDescription:

      'Krótkie ogłoszenia w **pasku u góry strony** (urlop, zmiana godzin, zamknięcie).\nKliknij wiersz, wpisz treść i ustaw daty — puste „od” i „do” = od razu i bez końca. Nowy komunikat: **plus w rogu**.',

    Panel: NoticesPanel,

  },

]


