import { useRef, useState } from 'react'
import { uploadMedia } from './upload'

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE_MB = 8

// Wybór i wgranie zdjęcia (domyślnie folder „pakiety”). Wspólne dla edycji na podglądzie.
export function usePhotoUpload(onChange, options = {}) {
  const folder = options.folder ?? 'pakiety'
  const acceptTypes = options.acceptTypes ?? IMAGE_TYPES
  const acceptAttr = options.accept ?? 'image/png,image/jpeg,image/webp'
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const open = () => inputRef.current?.click()

  const pick = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!acceptTypes.includes(file.type)) {
      setError(options.typeError ?? 'Wybierz zdjęcie w formacie PNG, JPG lub WEBP.')
    } else if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Zdjęcie jest za duże – maksymalnie ${MAX_IMAGE_MB} MB.`)
    } else {
      setBusy(true)
      setError(null)
      try {
        onChange(await uploadMedia(file, folder))
      } catch (cause) {
        setError(cause.message ?? 'Nie udało się wgrać pliku.')
      } finally {
        setBusy(false)
      }
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  return { inputRef, busy, error, open, pick, acceptAttr }
}
