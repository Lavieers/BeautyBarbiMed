// Konfiguracja Supabase bez samej biblioteki klienta (~200 kB). Strona publiczna
// potrzebuje tylko adresów zdjęć, więc nie ładuje klienta, dopóki nie pobiera treści
// (zob. ContentProvider) – dzięki temu pierwsze wyświetlenie jest szybsze.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Bez kluczy strona nadal działa — po prostu pokazuje treści domyślne
// z src/data/defaults.js, a panel prosi o uzupełnienie pliku .env.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const MEDIA_BUCKET = 'media'

export { url as supabaseUrl, anonKey as supabaseAnonKey }

export function mediaUrl(storagePath) {
  if (!storagePath) return ''
  // Zdjęcia mogą być też wklejone jako gotowy adres z zewnątrz.
  if (/^https?:\/\//.test(storagePath)) return storagePath
  if (!isSupabaseConfigured) return ''

  // Ten sam adres, który zwraca storage.getPublicUrl() w kliencie Supabase.
  return encodeURI(`${url}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`)
}
