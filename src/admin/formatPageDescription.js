/** Tekst z **wyróżnieniem** → fragmenty do nagłówka panelu. */
export function pageDescriptionParts(text) {
  if (!text) return []

  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((part) => part.length > 0)
    .map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return { type: 'strong', text: part.slice(2, -2) }
      }
      return { type: 'text', text: part }
    })
}
