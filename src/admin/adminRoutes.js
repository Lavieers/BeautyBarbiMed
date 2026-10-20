import { adminNavItems } from './adminNav'

const adminIds = new Set(adminNavItems.map((item) => item.id))

/** Id sekcji z adresu `/admin` lub `/admin/pakiety` itd. `null` gdy segment jest nieznany. */
export function sectionFromPathname(pathname) {
  const match = pathname.match(/^\/admin\/?(.*)$/)
  if (!match) return 'home'
  const segment = (match[1] || '').split('/').filter(Boolean)[0]
  if (!segment) return 'home'
  return adminIds.has(segment) ? segment : null
}

/** Adres panelu dla danej sekcji (Przegląd → `/admin`). */
export function pathForSection(id) {
  if (!id || id === 'home') return '/admin'
  return `/admin/${id}`
}
