import { describe, expect, it } from 'vitest'
import { pathForSection, sectionFromPathname } from './admin/adminRoutes.js'
import { isNoticePending, isNoticeVisible } from './content/context.js'
import { DEFAULT_THEME, themeTokens } from './content/themes.js'
import { imageSrc, tileLabel } from './components/galleryHelpers.js'
import { fallbackSteps, resolveCardText, resolveLead, resolveSteps } from './lib/packageDetails.js'
import { formatHoursLine, parseHoursLine } from './lib/hours.js'
import { defaultMapEmbedSrc, mapEmbedSrc } from './lib/mapEmbed.js'
import { bindPolishWidows } from './lib/polishText.js'
import { isSupabaseConfigured, mediaUrl } from './lib/supabaseConfig.js'
import {
  localBusinessJsonLd,
  normalizeSiteUrl,
  openingHoursSpecification,
  renderSeoHead,
  robotsTxt,
  sitemapXml,
} from './seo/site.js'
import { contactDefaults } from './data/defaults.js'

describe('mapa i adresy zdjęć', () => {
  it('zostawia obecny embed Google bez zmian', () => {
    expect(mapEmbedSrc(defaultMapEmbedSrc)).toBe(defaultMapEmbedSrc)
  })

  it('wyciąga src z wklejonego iframe i odrzuca obcą domenę', () => {
    const wrapped = `<iframe src="${defaultMapEmbedSrc}"></iframe>`
    expect(mapEmbedSrc(wrapped)).toBe(defaultMapEmbedSrc)
    expect(mapEmbedSrc('<iframe src="https://evil.example/maps"></iframe>')).toBe('')
    expect(mapEmbedSrc('javascript:alert(1)')).toBe('')
  })

  it('zaczyna mapę od zwykłego widoku', () => {
    const satellite = defaultMapEmbedSrc.replace('!5e0', '!5e1')
    expect(mapEmbedSrc(satellite)).toContain('!5e0')
    expect(mapEmbedSrc(satellite)).not.toContain('!5e1')
  })

  it('buduje publiczny adres tylko dla pliku w buckecie', () => {
    expect(mediaUrl('')).toBe('')
    expect(mediaUrl('https://example.com/foto.jpg')).toBe('https://example.com/foto.jpg')

    const local = mediaUrl('galeria/a.webp')
    if (isSupabaseConfigured) {
      expect(local).toContain('/storage/v1/object/public/media/galeria/a.webp')
    } else {
      expect(local).toBe('')
    }
  })

  it('podpisuje kafel galerii i woli gotowy src', () => {
    expect(imageSrc({ src: '/lokalne.webp', storage_path: 'galeria/a.webp' })).toBe('/lokalne.webp')
    expect(tileLabel({ category: 'Rzęsy' })).toBe('Rzęsy. Powiększ zdjęcie')
    expect(tileLabel({})).toBe('Powiększ zdjęcie')
  })
})

describe('kolory i komunikaty', () => {
  it('zostawia bezpieczny kolor i odrzuca wstrzyknięcie CSS', () => {
    const tokens = themeTokens(DEFAULT_THEME, {
      '--krem': '#ffffff',
      '--zle': 'red; } body { background: url(https://evil.test) }',
      color: 'red',
    })

    expect(tokens['--krem']).toBe('#ffffff')
    expect(tokens['--zle']).toBeUndefined()
    expect(tokens.color).toBeUndefined()
  })

  it('nieznany motyw wraca do palety domyślnej', () => {
    expect(themeTokens('nie-ma', { '--radius': '2px' })['--radius']).toBe('2px')
  })

  it('pokazuje komunikat tylko w jego oknie czasu', () => {
    const now = Date.parse('2026-06-01T12:00:00Z')
    const notice = {
      is_active: true,
      starts_at: '2026-06-01T10:00:00Z',
      ends_at: '2026-06-01T18:00:00Z',
    }

    expect(isNoticeVisible(notice, now)).toBe(true)
    expect(isNoticeVisible({ ...notice, starts_at: '2026-06-01T13:00:00Z' }, now)).toBe(false)
    expect(isNoticePending({ ...notice, starts_at: '2026-06-01T13:00:00Z' }, now)).toBe(true)
    expect(isNoticeVisible({ ...notice, is_active: false }, now)).toBe(false)
    expect(isNoticeVisible({ ...notice, ends_at: '2026-06-01T11:00:00Z' }, now)).toBe(false)
    expect(isNoticePending(null, now)).toBe(false)
  })
})

describe('godziny, pakiety i teksty', () => {
  it('rozbija godziny z panelu na dni i zakres', () => {
    expect(parseHoursLine('pon - pt: 10:00 - 18:00')).toEqual({
      days: 'Poniedziałek – piątek',
      time: '10:00 – 18:00',
      closed: false,
    })
    expect(parseHoursLine('niedziela - nieczynne').closed).toBe(true)
    expect(formatHoursLine('sobota: 8.00 - 1300')).toBe('Sobota: 08:00 – 13:00')
  })

  it('bierze opowieść pakietu, a przy braku wpisu listę zabiegów', () => {
    const known = resolveSteps({ id: 'odswiezenie-blask' })
    expect(known).toHaveLength(3)
    expect(known[0].title).toBe('Peeling kawitacyjny')
    expect(resolveLead({ id: 'odswiezenie-blask' })).toMatch(/blasku/)

    const custom = { id: 'nowy', items: ['Konsultacja'], description: 'Opis z panelu', lead: 'Lead z panelu', steps: [] }
    expect(resolveSteps(custom)).toEqual([])
    expect(resolveLead(custom)).toBe('Lead z panelu')
    expect(fallbackSteps({ name: 'Sam zabieg', items: [] })[0].title).toBe('Sam zabieg')
    expect(resolveCardText({ description: 'Na karcie' })).toBe('Na karcie')
  })

  it('spina krótkie polskie słowa z następnym wyrazem', () => {
    expect(bindPolishWidows('zabieg i pielęgnacja')).toBe('zabieg i\u00A0pielęgnacja')
    expect(bindPolishWidows('')).toBe('')
    expect(bindPolishWidows(null)).toBe(null)
  })
})

describe('adresy panelu i SEO', () => {
  it('rozpoznaje znane sekcje panelu', () => {
    expect(sectionFromPathname('/admin')).toBe('home')
    expect(sectionFromPathname('/admin/pakiety')).toBe('pakiety')
    expect(sectionFromPathname('/admin/nie-ma')).toBe(null)
    expect(sectionFromPathname('/')).toBe('home')
    expect(pathForSection('home')).toBe('/admin')
    expect(pathForSection('cennik')).toBe('/admin/cennik')
  })

  it('buduje dane gabinetu bez obcego adresu strony', () => {
    expect(normalizeSiteUrl('')).toBe('')
    expect(normalizeSiteUrl('beautybarbimed.pl')).toBe('https://beautybarbimed.pl')
    expect(normalizeSiteUrl('javascript:alert(1)')).toBe('')
    expect(sitemapXml('')).toBe('')
    expect(sitemapXml('https://beautybarbimed.pl')).toContain('https://beautybarbimed.pl/')
    expect(robotsTxt('https://beautybarbimed.pl')).toContain('Allow: /')

    const hours = openingHoursSpecification(contactDefaults.hours)
    expect(hours.length).toBeGreaterThan(0)
    expect(hours[0].opens).toBe('10:00')

    const business = localBusinessJsonLd({ siteUrl: 'https://beautybarbimed.pl' })
    expect(business['@type']).toBe('BeautySalon')
    expect(business.telephone).toBe('+48501280578')
    expect(business.url).toBe('https://beautybarbimed.pl/')

    const head = renderSeoHead({ siteUrl: 'https://beautybarbimed.pl' })
    expect(head).toContain('rel="canonical"')
    expect(head).toContain('application/ld+json')
    expect(head).not.toContain('</script><script')
  })
})
