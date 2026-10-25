// Krótkie spójniki i przyimki (całe wyrazy) — twarda spacja z wyrazem następującym.
const TIE_TO_NEXT =
  /(^|\s)(a|i|o|u|w|z|na|do|od|po|ku|ze|we|wi|to|co|bo|że|już|nie|jak|czy|ale|lub|ani|oraz|dla|przy|bez|nad|pod|przed)(\s+)/gim

export function bindPolishWidows(text) {
  if (typeof text !== 'string' || !text) return text
  return text.replace(TIE_TO_NEXT, (_, before, word) => `${before}${word}\u00A0`)
}

export function polishCopy(value) {
  return typeof value === 'string' ? bindPolishWidows(value.trim()) : value
}
