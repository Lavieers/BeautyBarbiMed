import { mediaUrl } from '../lib/supabaseConfig'

export const TILE_WIDTH = 800
export const TILE_HEIGHT = 1000

export function imageSrc(image) {
  if (image?.src) return image.src
  return mediaUrl(image?.storage_path)
}

export function captionOf(image) {
  return {
    treatment: (image?.category || '').trim(),
    fact: (image?.caption || '').trim(),
  }
}

export function tileLabel(image) {
  const { treatment, fact } = captionOf(image)
  const parts = []

  for (const part of [image?.alt, treatment, fact]) {
    const text = (part || '').trim()
    if (text && !parts.includes(text)) parts.push(text)
  }

  parts.push('Powiększ zdjęcie')
  return parts.join('. ')
}
