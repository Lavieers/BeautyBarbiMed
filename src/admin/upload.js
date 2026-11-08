import { MEDIA_BUCKET, PRIVATE_MEDIA_BUCKET, supabase } from '../lib/supabase'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 8 * 1024 * 1024

function imageType(file) {
  if (file.type === 'image/jpg') return 'image/jpeg'
  return file.type
}

function safeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .toLowerCase()
}

function localPath(path) {
  return Boolean(path) && !/^https?:\/\//.test(path)
}

async function readBucket(bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error || !data) return null
  return data
}

async function writeBucket(bucket, path, data) {
  const { error } = await supabase.storage.from(bucket).upload(path, data, {
    upsert: true,
    contentType: data.type || 'image/jpeg',
    cacheControl: '3600',
  })
  if (error) throw error
}

export async function uploadMedia(file, folder = 'galeria') {
  const type = imageType(file)
  if (!ALLOWED_TYPES.has(type)) {
    throw new Error('Dozwolone są pliki JPG, PNG, WEBP i GIF.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Plik jest za duży – maksymalnie 8 MB.')
  }

  const path = `${folder}/${Date.now()}-${safeName(file.name)}`

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: type,
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error
  return path
}

export async function hiddenMediaUrl(path) {
  if (!localPath(path)) return ''

  const { data, error } = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).createSignedUrl(path, 60 * 60)
  if (error || !data?.signedUrl) return ''
  return data.signedUrl
}

// Zdejmuje plik z publicznego adresu. Opublikowane zdjęcia na stronie zostają.
export async function concealMedia(path) {
  if (!localPath(path)) return
  if (await hiddenMediaUrl(path)) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path])
    return
  }

  const file = await readBucket(MEDIA_BUCKET, path)
  if (!file) return

  await writeBucket(PRIVATE_MEDIA_BUCKET, path, file)
  await supabase.storage.from(MEDIA_BUCKET).remove([path])
}

// Przywraca plik pod ten sam publiczny adres, zanim wiersz znów będzie widoczny.
export async function revealMedia(path) {
  if (!localPath(path)) return
  if (!(await hiddenMediaUrl(path))) return

  const file = await readBucket(PRIVATE_MEDIA_BUCKET, path)
  if (!file) throw new Error('Nie udało się odczytać ukrytego zdjęcia.')

  await writeBucket(MEDIA_BUCKET, path, file)
  await supabase.storage.from(PRIVATE_MEDIA_BUCKET).remove([path])
}

export async function removeMedia(path) {
  if (!localPath(path)) return
  await Promise.allSettled([
    supabase.storage.from(MEDIA_BUCKET).remove([path]),
    supabase.storage.from(PRIVATE_MEDIA_BUCKET).remove([path]),
  ])
}
