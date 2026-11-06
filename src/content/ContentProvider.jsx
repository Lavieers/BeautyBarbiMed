import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabaseConfig'
import { contactDefaults, sectionDefaults } from '../data/defaults'
import { ContentContext, isNoticePending } from './context'
import { DEFAULT_THEME, themeTokens } from './themes'

// Panel edytuje tylko te pola. Reszta sekcji zostaje w kodzie — stary zapis
// z czasów, gdy dało się zmieniać całą stronę, nie podmienia już tekstu.
const LIVE_SECTION_FIELDS = {
  hero: ['description'],
  about: ['paragraph', 'teamLabel', 'team'],
  offer: ['categories'],
  pricing: ['groups'],
}

function mergeLiveSections(rows) {
  const next = { ...sectionDefaults }

  for (const row of rows ?? []) {
    const fields = LIVE_SECTION_FIELDS[row?.key]
    if (!fields || !row.content || typeof row.content !== 'object') continue

    // W bazie leży starszy, pełny zapis sekcji „O gabinecie”. Nowy panel
    // zapisuje tylko akapit i zespół (z polem source). Bez tego znacznika
    // strona zostaje przy tekście z kodu.
    if (row.key === 'about' && row.content.source !== 'copy-editor') continue

    const section = { ...(sectionDefaults[row.key] ?? {}) }
    for (const field of fields) {
      if (row.content[field] != null) section[field] = row.content[field]
    }
    next[row.key] = section
  }

  return next
}

function sameNotices(current, next) {
  if (!Array.isArray(current) || current.length !== next.length) return false

  return current.every((notice, index) => {
    const other = next[index]
    return (
      notice.id === other.id &&
      notice.updated_at === other.updated_at &&
      notice.message === other.message &&
      notice.kind === other.kind &&
      notice.starts_at === other.starts_at &&
      notice.ends_at === other.ends_at &&
      notice.is_active === other.is_active
    )
  })
}

function mergeContact(saved) {
  const next = { ...contactDefaults }

  for (const [key, value] of Object.entries(saved ?? {})) {
    if (value == null || value === '') continue
    if (Array.isArray(value) && value.length === 0) continue
    next[key] = value
  }

  if (typeof next.phone === 'string') next.phone = next.phone.replace(/\s+/g, ' ').trim()
  if (typeof next.address === 'string') {
    next.address = next.address.replace(/(\d{2}-\d{3}),\s+/g, '$1 ').replace(/\s+/g, ' ').trim()
  }

  return next
}

async function fetchContent() {
  // Klient Supabase (~200 kB) ładujemy dopiero tutaj, już po pierwszym wyświetleniu strony.
  const { supabase } = await import('../lib/supabase')

  const [settings, sections, notices, gallery, reviews] = await Promise.all([
    supabase
      .from('site_settings')
      .select('contact, theme, theme_overrides')
      .eq('id', 1)
      .maybeSingle(),
    supabase.from('sections').select('key, content'),
    supabase.from('notices').select('*').order('created_at', { ascending: false }),
    supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  const firstError = [settings, sections, notices, gallery, reviews].find((r) => r.error)?.error
  if (firstError) throw firstError

  return {
    contact: mergeContact(settings.data?.contact),
    sections: mergeLiveSections(sections.data),
    theme: settings.data?.theme || DEFAULT_THEME,
    themeOverrides: settings.data?.theme_overrides ?? {},
    // Zaplanowane komunikaty zostają w pamięci, żeby pasek włączył się sam
    // o godzinie startu. Zakończone odpadają. RLS anonima i tak oddaje tylko
    // wiersze, które polityka uzna za publiczne.
    notices: (notices.data ?? []).filter((notice) => isNoticePending(notice)),
    gallery: gallery.data ?? [],
    reviews: reviews.data ?? [],
  }
}

function ContentProvider({ children }) {
  const [data, setData] = useState(null)
  const [ready, setReady] = useState(!isSupabaseConfigured)
  const [error, setError] = useState(null)
  const appliedTokens = useRef([])

  // Strona zostaje na treściach domyślnych, gdy baza nie odpowiada — lepsze
  // to niż pusty ekran.
  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return

    try {
      setData(await fetchContent())
      setError(null)
    } catch (cause) {
      console.error('Nie udało się pobrać treści z Supabase:', cause)
      setError(cause)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let cancelled = false

    const syncNotices = async () => {
      try {
        const { supabase } = await import('../lib/supabase')
        const { data, error: cause } = await supabase
          .from('notices')
          .select('*')
          .order('created_at', { ascending: false })

        if (cancelled || cause) return

        const notices = (data ?? []).filter((notice) => isNoticePending(notice))

        setData((current) => {
          if (!current || sameNotices(current.notices, notices)) return current
          return { ...current, notices }
        })
      } catch {
        // Kolejna próba przy następnym tyknięciu.
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') syncNotices()
    }

    const timer = window.setInterval(syncNotices, 15000)
    document.addEventListener('visibilitychange', onVisible)

    const run = async () => {
      try {
        const content = await fetchContent()
        if (cancelled) return

        setData(content)
        setError(null)
      } catch (cause) {
        if (cancelled) return

        console.error('Nie udało się pobrać treści z Supabase:', cause)
        setError(cause)
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    run()

    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const theme = data?.theme ?? DEFAULT_THEME
  const themeOverrides = useMemo(() => data?.themeOverrides ?? {}, [data])

  useEffect(() => {
    const root = document.documentElement
    const tokens = themeTokens(theme, themeOverrides)

    // Zdejmujemy tokeny poprzedniego motywu, żeby zmiana palety nie
    // zostawiała po sobie pojedynczych kolorów.
    for (const name of appliedTokens.current) {
      if (!(name in tokens)) root.style.removeProperty(name)
    }

    for (const [name, value] of Object.entries(tokens)) {
      root.style.setProperty(name, value)
    }

    appliedTokens.current = Object.keys(tokens)
  }, [theme, themeOverrides])

  const value = useMemo(
    () => ({
      contact: data?.contact ?? contactDefaults,
      sections: data?.sections ?? sectionDefaults,
      theme,
      themeOverrides,
      notices: data?.notices ?? [],
      gallery: data?.gallery ?? [],
      reviews: data?.reviews ?? [],
      ready,
      error,
      refresh: load,
    }),
    [data, theme, themeOverrides, ready, error, load],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export default ContentProvider
