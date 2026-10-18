/** Adres src z pola mapEmbedUrl albo wklejonego kodu iframe z Google Maps. */
export function mapEmbedSrc(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  if (raw.includes('<iframe')) {
    const match = raw.match(/src=["']([^"']+)["']/i)
    return forceRoadmap(match?.[1]?.trim() ?? '')
  }

  return forceRoadmap(raw)
}

// Parametr `!5eN` w adresie embed wybiera typ mapy: 0 = zwykła, 1/2 = satelita,
// 3 = teren. Zawsze startujemy od zwykłej mapy (satelita w tym miejscu wygląda słabo).
function forceRoadmap(src) {
  return src.replace(/!5e[1-3](?=!|$)/, '!5e0')
}

export const defaultMapEmbedSrc =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2310.7801490513057!2d22.539603176364665!3d51.20897797174693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4722579777dcff97%3A0xd5dd5d5647feea71!2sBeauty%20Barbi-Med%20-Paznokcie%2C%20Rz%C4%99sy%20i%20Kosmetologia!5e0!3m2!1spl!2spl!4v1791565871919!5m2!1spl!2spl'
