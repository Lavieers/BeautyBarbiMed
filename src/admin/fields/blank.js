// Nowy element listy powstaje z kształtu istniejącego: te same pola, tylko
// bez treści. Dzięki temu „Dodaj” działa dla każdej listy w panelu.
export function blankLike(sample) {
  if (typeof sample === 'string') return ''
  if (typeof sample === 'number') return 0
  if (typeof sample === 'boolean') return false
  if (Array.isArray(sample)) return []

  if (sample && typeof sample === 'object') {
    return Object.fromEntries(
      Object.entries(sample).map(([key, value]) => [
        key,
        // Identyfikatory trafiają do atrybutu key w Reakcie, więc każdy
        // nowy element musi dostać własny.
        key === 'id' ? `poz-${Math.random().toString(36).slice(2, 8)}` : blankLike(value),
      ]),
    )
  }

  return ''
}
