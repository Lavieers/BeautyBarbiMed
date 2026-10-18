import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './supabaseConfig'

export { isSupabaseConfigured, mediaUrl, MEDIA_BUCKET } from './supabaseConfig'

// Klient jest ciężki, więc strona publiczna ładuje ten plik dopiero przy pobieraniu
// treści (dynamiczny import), a panel – razem ze swoim kodem.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
