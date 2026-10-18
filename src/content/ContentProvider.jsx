import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabaseConfig'
import { contactDefaults, sectionDefaults } from '../data/defaults'
import { ContentContext, isNoticeVisible } from './context'
import { DEFAULT_THEME, themeTokens } from './themes'

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
      .order('created_at', { ascending: false }),
  ])

  const firstError = [settings, sections, notices, gallery, reviews].find((r) => r.error)?.error
  if (firstError) throw firstError

  const sectionMap = { ...sectionDefaults }
  for (const row of sections.data ?? []) {
    if (row?.key) {
      sectionMap[row.key] = { ...(sectionDefaults[row.key] ?? {}), ...(row.content ?? {}) }
    }
  }

  return {
    contact: { ...contactDefaults, ...(settings.data?.contact ?? {}) },
    sections: sectionMap,
    theme: settings.data?.theme || DEFAULT_THEME,
    themeOverrides: settings.data?.theme_overrides ?? {},
    // RLS odsiewa komunikaty spoza okna czasowego, ale przy zalogowanym
    // adminie zapytanie zwraca wszystko — filtrujemy jeszcze raz u siebie.
    notices: (notices.data ?? []).filter((notice) => isNoticeVisible(notice)),
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
