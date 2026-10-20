import { mediaUrl } from '../lib/supabaseConfig'
import maskImage from '../assets/guide-maska.webp'
import mezoImage from '../assets/mezo.webp'
import mezoMikroImage from '../assets/mezo-mikro.webp'
import mezoIglaImage from '../assets/mezo-igla.webp'
import mezoBezIglaImage from '../assets/mezo-bezigla.webp'
import pediKlasycznyImage from '../assets/pedi-klasyczny.webp'
import pediSpaImage from '../assets/pedi-spa.webp'
import pediLuksusImage from '../assets/pedi-luksus.webp'
import lashesImage from '../assets/rzesy-naturalne.webp'
import cabinetImage from '../assets/gabinet-wnetrze.webp'
import guideSuchoscImage from '../assets/guide-suchosc.webp'
import guideBiopenImage from '../assets/guide-biopen.webp'
import guideRfImage from '../assets/guide-rf.webp'
import guideRzesyImage from '../assets/guide-rzesy.webp'
import rzesyKrysztalkiImage from '../assets/rzesy-krysztalki.webp'
import pannyMlodejImage from '../assets/panny-mlodej.webp'
import okazjaImage from '../assets/okazja-tulipany.webp'
import urodaImage from '../assets/uroda-4-tygodnie.webp'

// Zdjęcie pakietu zależy od kategorii; pozostałe dostają wnętrze gabinetu.
const categoryImages = {
  twarz: maskImage,
  mezoterapia: mezoImage,
  'rzesy-brwi': lashesImage,
}

// Każdy pakiet ma własne zdjęcie, dopasowane do zabiegów, które zawiera.
const packageImages = {
  // pakiety na twarz
  'odswiezenie-blask': { src: guideSuchoscImage, position: '50% 30%' },
  'odmlodzenie-premium': { src: guideBiopenImage, position: '50% 40%' },
  'lifting-ujedrnienie': { src: guideRfImage, position: '60% 40%' },
  // pakiety na rzęsy i brwi
  'piekne-spojrzenie': { src: guideRzesyImage, position: '50% 45%' },
  'perfekcyjne-brwi': { src: lashesImage, position: '50% 35%' },
  'full-look': { src: rzesyKrysztalkiImage, position: '50% 40%' },
  'mezo-mikro-3': { src: mezoMikroImage, position: '62% 50%' },
  'mezo-iglowa-3': { src: mezoIglaImage, position: '58% 30%' },
  'mezo-beziglowa-3': { src: mezoBezIglaImage, position: '55% 40%' },
  // pakiety na stopy (środkowy: ciepłe, brązowe zdjęcie z kąpielą z płatkami róż)
  'klasyczny-relaks': { src: pediKlasycznyImage, position: '40% 55%' },
  'spa-nawilzenie': { src: pediSpaImage, position: '45% 68%' },
  'luksusowe-spa': { src: pediLuksusImage, position: '42% 50%' },
  // pakiety „Na specjalną okazję”
  'perfect-day': { src: okazjaImage, position: '50% 62%' },
  'panny-mlodej': { src: pannyMlodejImage, position: '50% 45%' },
  // pakiet „Uroda na 4 tygodnie”
  'miesieczna-pielegnacja': { src: urodaImage, position: '50% 45%' },
}

// Zdjęcie i kadr pakietu – to samo w oknie „Dowiedz się więcej” i w karuzeli na telefonie.
export function packagePhoto(pkg, category) {
  // własne zdjęcie wgrane w panelu admina ma pierwszeństwo
  if (pkg?.image) return { src: mediaUrl(pkg.image), position: pkg.imagePosition || '50% 50%' }
  return (
    (pkg && packageImages[pkg.id]) || {
      src: categoryImages[category?.id] ?? cabinetImage,
      position: 'center',
    }
  )
}
