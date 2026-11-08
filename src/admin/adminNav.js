import HeroPanel from './panels/HeroPanel'
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
    Panel: null,
  },
  {
    id: 'hero',
    label: 'Zespół',
    hint: 'Osoby w zespole i teksty strony',
    icon: 'team',
    pageDescription:
      'Osoby w zespole oraz teksty na stronie głównej i w sekcji O nas.',
    Panel: HeroPanel,
  },
  {
    id: 'pakiety',
    label: 'Pakiety',
    hint: 'Zestawy zabiegów i ceny',
    icon: 'packages',
    pageDescription:
      'Pakiety tak jak na stronie.',
    Panel: OfferPanel,
  },
  {
    id: 'cennik',
    label: 'Cennik',
    hint: 'Pojedyncze usługi i stawki',
    icon: 'pricing',
    pageDescription:
      'Zabiegi i stawki, tak jak na stronie.',
    Panel: PricingPanel,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    hint: 'Zdjęcia efektów pracy',
    icon: 'portfolio',
    pageDescription:
      'Zdjęcia tak jak w galerii na stronie.',
    Panel: GalleryPanel,
  },
  {
    id: 'opinie',
    label: 'Opinie',
    hint: 'Recenzje klientek',
    icon: 'reviews',
    pageDescription:
      'Opinie klientek, tak jak na stronie.',
    Panel: ReviewsPanel,
  },
  {
    id: 'komunikaty',
    label: 'Komunikaty',
    hint: 'Pasek u góry strony',
    icon: 'notices',
    pageDescription:
      'Ogłoszenia w pasku u góry strony.',
    Panel: NoticesPanel,
  },
  {
    id: 'firma',
    label: 'Dane firmy',
    hint: 'Adres, telefon, godziny',
    icon: 'company',
    pageDescription:
      'Adres, telefon i godziny w zakładce Kontakt.',
    Panel: ContactPanel,
  },
]
