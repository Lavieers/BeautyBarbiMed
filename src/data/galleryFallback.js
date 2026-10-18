import { useMemo } from 'react'
import { useGallery } from '../content/context'
import imgRzesyKrysztalki from '../assets/rzesy-krysztalki.webp'
import imgBiopenProcedure from '../assets/zabieg-biopen.webp'
import imgRzesyWet from '../assets/rzesy-mokry-efekt.webp'
import imgGabinet from '../assets/gabinet-wnetrze.webp'
import imgRzesyNat from '../assets/rzesy-naturalne.webp'
import imgBiopenProd from '../assets/biopen-produkt.webp'

// Kadry z projektu, dopóki w gallery_images nie ma opublikowanych zdjęć.
const galleryFallback = [
  {
    id: 'def-1',
    src: imgRzesyKrysztalki,
    alt: 'Stylizacja rzęs ze zdobieniem z kryształków',
    category: 'Rzęsy Klaudia',
    caption: 'Stylizacja okolicznościowa - autorski efekt z kryształkami',
  },
  {
    id: 'def-2',
    src: imgBiopenProcedure,
    alt: 'Mezoterapia mikroigłowa BioPen w gabinecie',
    category: 'Rewitalizacja Barbara',
    caption: 'Mezoterapia mikroigłowa BioPen w wykonaniu pielęgniarki',
  },
  {
    id: 'def-3',
    src: imgRzesyWet,
    alt: 'Przedłużanie rzęs Mokry Efekt (Wet Look)',
    category: 'Rzęsy Klaudia',
    caption: 'Przedłużanie rzęs - najmodniejszy Mokry Efekt (Wet Look)',
  },
  {
    id: 'def-4',
    src: imgGabinet,
    alt: 'Wnętrze gabinetu przy ul. Romera 30 w Lublinie',
    category: 'Nasz Gabinet',
    caption: 'Kameralne, sterylne wnętrze gabinetu przy ul. Romera 30',
  },
  {
    id: 'def-5',
    src: imgRzesyNat,
    alt: 'Naturalna stylizacja rzęs 1:1',
    category: 'Rzęsy Klaudia',
    caption: 'Subtelna stylizacja 1:1 podkreślająca naturalne spojrzenie',
  },
  {
    id: 'def-6',
    src: imgBiopenProd,
    alt: 'Aparatura BioPen do mikroigłowej terapii',
    category: 'Aparatura Medyczna',
    caption: 'BioPen - zaawansowana stymulacja kolagenu i elastyny',
  },
]

export function usePortfolioImages() {
  const dbImages = useGallery()
  return useMemo(
    () => (dbImages.length > 0 ? dbImages : galleryFallback),
    [dbImages],
  )
}
