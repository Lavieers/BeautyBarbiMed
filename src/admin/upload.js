import { MEDIA_BUCKET, supabase } from '../lib/supabase'

// Nazwy plików ze zdjęć telefonu bywają z polskimi znakami i spacjami —
// Storage przyjmuje takie ścieżki niechętnie, więc je normalizujemy.
function safeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .toLowerCase()
}

export async function uploadMedia(file, folder = 'galeria') {
  const path = `${folder}/${Date.now()}-${safeName(file.name)}`

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error
  return path
}

export async function removeMedia(path) {
  if (!path || /^https?:\/\//.test(path)) return
  await supabase.storage.from(MEDIA_BUCKET).remove([path])
}
