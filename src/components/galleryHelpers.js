import { mediaUrl } from '../lib/supabaseConfig'

export const TILE_WIDTH = 800
export const TILE_HEIGHT = 1000

export function imageSrc(image) {
  if (image?.src) return image.src
  return mediaUrl(image?.storage_path)
}

export function treatmentOf(image) {
  return (image?.category || '').trim()
}

export function tileLabel(image) {
  const name = treatmentOf(image)
  return name ? `${name}. Powiększ zdjęcie` : 'Powiększ zdjęcie'
}
