import { createContext, useContext, useMemo } from 'react'
import { isSupabaseConfigured } from '../lib/supabaseConfig'
import { contactDefaults, sectionDefaults } from '../data/defaults'
import { DEFAULT_THEME } from './themes'

const emptyContent = {
  contact: contactDefaults,
  sections: sectionDefaults,
  theme: DEFAULT_THEME,
  themeOverrides: {},
  notices: [],
  gallery: [],
  reviews: [],
  // Bez skonfigurowanego Supabase nie ma na co czekać — od razu gotowe.
  ready: !isSupabaseConfigured,
  error: null,
  refresh: () => {},
}

export const ContentContext = createContext(emptyContent)

function withPlainDashes(value) {
  if (typeof value === 'string') return value.replaceAll('\u2014', '-')
  if (Array.isArray(value)) return value.map(withPlainDashes)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, withPlainDashes(val)]))
  }
  return value
}

export function useContent() {
  return useContext(ContentContext)
}

// Treść sekcji z bazy nadpisuje domyślną pole po polu, więc częściowy zapis
// (albo nowe pole dodane w kodzie) nie wybija strony.
export function useSection(key) {
  const { sections } = useContent()

  return useMemo(
    () => withPlainDashes({ ...(sectionDefaults[key] ?? {}), ...(sections?.[key] ?? {}) }),
    [sections, key],
  )
}

export function useContactInfo() {
  const { contact } = useContent()
  return useMemo(() => withPlainDashes(contact), [contact])
}

export function useNotices() {
  const { notices } = useContent()
  return useMemo(() => withPlainDashes(notices), [notices])
}

export function useGallery() {
  const { gallery } = useContent()
  return useMemo(() => {
    const rows = withPlainDashes(Array.isArray(gallery) ? gallery : [])
    // Kolejność z zapytania (sort_order, potem data) zostaje bez zmian.
    return rows.filter(
      (image) => image && image.is_published !== false && (image.src || image.storage_path),
    )
  }, [gallery])
}

export function useReviews() {
  const { reviews } = useContent()
  return useMemo(() => withPlainDashes(reviews), [reviews])
}

export function isNoticeVisible(notice, now = Date.now()) {
  if (!notice?.is_active) return false
  if (notice.starts_at && new Date(notice.starts_at).getTime() > now) return false
  if (notice.ends_at && new Date(notice.ends_at).getTime() < now) return false
  return true
}
