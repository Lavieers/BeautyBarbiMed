// Dane, które Google czyta z HTML, zanim uruchomi Reacta.
// Adres strony jest pusty, dopóki nie ma domeny (VITE_SITE_URL).

import { contactDefaults } from '../data/defaults.js'
import { parseHoursLine } from '../lib/hours.js'

export const SITE_NAME = 'Beauty Barbi Med'

export const SITE_TITLE =
  'Beauty Barbi Med - Gabinet Medycyny Estetycznej i Kosmetologii | Lublin'

export const SITE_DESCRIPTION =
  'Gabinet kosmetologii i medycyny estetycznej w Lublinie przy ul. Romera 30. Mezoterapia i pielęgnacja twarzy, które odświeżają spojrzenie. Umów wizytę online.'

const SCHEMA_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const PL_DAY = {
  poniedziałek: 'Monday',
  wtorek: 'Tuesday',
  środa: 'Wednesday',
  czwartek: 'Thursday',
  piątek: 'Friday',
  sobota: 'Saturday',
  niedziela: 'Sunday',
}

export function normalizeSiteUrl(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  try {
    return new URL(withProtocol).origin
  } catch {
    return ''
  }
}

function escapeAttr(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}

function postalAddress(address) {
  const text = String(address ?? '').trim()
  const match = text.match(/^(.*?)\s*,\s*(\d{2}-\d{3})\s+(.+)$/)
  if (!match) {
    return {
      '@type': 'PostalAddress',
      streetAddress: text,
      addressLocality: 'Lublin',
      addressCountry: 'PL',
    }
  }
  return {
    '@type': 'PostalAddress',
    streetAddress: match[1].trim(),
    postalCode: match[2],
    addressLocality: match[3].trim(),
    addressCountry: 'PL',
  }
}

function geoFromMap(embedUrl) {
  const match = String(embedUrl ?? '').match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/)
  if (!match) return null
  return { latitude: match[2], longitude: match[1] }
}

function schemaDays(label) {
  const parts = String(label)
    .split(/\s*[–—-]\s*/)
    .map((part) => PL_DAY[part.trim().toLowerCase()])
    .filter(Boolean)
  if (parts.length < 2) return parts
  const start = SCHEMA_DAYS.indexOf(parts[0])
  const end = SCHEMA_DAYS.indexOf(parts[parts.length - 1])
  if (start < 0 || end < start) return parts
  return SCHEMA_DAYS.slice(start, end + 1)
}

export function openingHoursSpecification(hours) {
  const lines = Array.isArray(hours) ? hours : []
  return lines.flatMap((line) => {
    const parsed = parseHoursLine(line)
    if (!parsed.time || parsed.closed) return []
    const [opens, closes] = parsed.time.split(/\s*[–—-]\s*/)
    const days = schemaDays(parsed.days)
    if (!opens || !closes || days.length === 0) return []
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: days,
        opens,
        closes,
      },
    ]
  })
}

export function localBusinessJsonLd({ siteUrl, contact = contactDefaults, imagePath = '/og.webp' } = {}) {
  const origin = normalizeSiteUrl(siteUrl)
  const sameAs = [contact.facebook, contact.instagram, contact.booksy]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
  const telephone = String(contact.phoneHref ?? '').replace(/^tel:/i, '') || contact.phone
  const geo = geoFromMap(contact.mapEmbedUrl)

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    telephone,
    address: postalAddress(contact.address),
    openingHoursSpecification: openingHoursSpecification(contact.hours),
  }

  if (origin) {
    data['@id'] = `${origin}/#gabinet`
    data.url = `${origin}/`
    data.image = `${origin}${imagePath}`
  }
  if (geo) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    }
  }
  if (contact.mapLink) data.hasMap = contact.mapLink
  if (sameAs.length) data.sameAs = sameAs
  if (contact.booksy) {
    data.potentialAction = {
      '@type': 'ReserveAction',
      name: 'Umów wizytę',
      target: contact.booksy,
    }
  }

  return data
}

export function renderSeoHead({ siteUrl, imagePath = '/og.webp' }) {
  const origin = normalizeSiteUrl(siteUrl)
  const image = origin ? `${origin}${imagePath}` : imagePath
  const canonical = origin ? `${origin}/` : ''
  const json = JSON.stringify(localBusinessJsonLd({ siteUrl: origin, imagePath })).replaceAll('<', '\\u003c')

  const lines = []
  if (canonical) lines.push(`<link rel="canonical" href="${escapeAttr(canonical)}" />`)
  lines.push(
    `<meta name="description" content="${escapeAttr(SITE_DESCRIPTION)}" />`,
    `<meta name="robots" content="index, follow" id="robots" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="pl_PL" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
  )
  if (canonical) lines.push(`<meta property="og:url" content="${escapeAttr(canonical)}" />`)
  lines.push(
    `<meta property="og:title" content="${escapeAttr(SITE_TITLE)}" />`,
    `<meta property="og:description" content="${escapeAttr(SITE_DESCRIPTION)}" />`,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
    `<meta property="og:image:alt" content="Gabinet Beauty Barbi Med w Lublinie" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(SITE_TITLE)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(SITE_DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(image)}" />`,
    `<script type="application/ld+json" id="local-business">${json}</script>`,
    `<script>
      if (location.pathname === "/admin" || location.pathname.indexOf("/admin/") === 0) {
        var robots = document.getElementById("robots")
        if (robots) robots.setAttribute("content", "noindex, nofollow")
      }
    </script>`,
  )

  return lines.join('\n    ')
}

export function robotsTxt(siteUrl) {
  const origin = normalizeSiteUrl(siteUrl)
  const lines = [
    '# /admin dostaje noindex w HTML. Nie blokujemy go tutaj, żeby Google mógł ten zakaz odczytać.',
    'User-agent: *',
    'Allow: /',
    '',
  ]
  if (origin) lines.push(`Sitemap: ${origin}/sitemap.xml`, '')
  return lines.join('\n')
}

export function sitemapXml(siteUrl) {
  const origin = normalizeSiteUrl(siteUrl)
  if (!origin) return ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
  </url>
</urlset>
`
}
