// Godziny otwarcia wpisuje się w panelu jako dowolne linijki tekstu, np.
// „pon - pt: 10:00 - 1800” albo „niedziela - nieczynne”. Tu rozbijamy je na
// „dni” i „godziny”, żeby dało się je pokazać w czytelnej tabelce.

const DAY_NAMES = {
  pon: 'Poniedziałek',
  poniedziałek: 'Poniedziałek',
  poniedzialek: 'Poniedziałek',
  wt: 'Wtorek',
  wtorek: 'Wtorek',
  śr: 'Środa',
  sr: 'Środa',
  środa: 'Środa',
  sroda: 'Środa',
  czw: 'Czwartek',
  czwartek: 'Czwartek',
  pt: 'Piątek',
  piątek: 'Piątek',
  piatek: 'Piątek',
  sob: 'Sobota',
  sobota: 'Sobota',
  niedz: 'Niedziela',
  ndz: 'Niedziela',
  nd: 'Niedziela',
  niedziela: 'Niedziela',
}

const TIME_RANGE = /(\d{1,2}[:.]?\d{2})\s*[-–—]\s*(\d{1,2}[:.]?\d{2})/
const CLOSED = /^(.*?)[\s:\-–—]+(nieczynne|zamknięte|zamkniete|wolne)\s*$/i

// „1800” → „18:00”, „9.30” → „09:30”
function normalizeTime(value) {
  const digits = value.replace(/\D/g, '').padStart(4, '0')
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

// „pon - pt” → „Poniedziałek – piątek”; nieznane zapisy zostają bez zmian.
function normalizeDays(value) {
  const cleaned = value.replace(/[:\s]+$/, '').trim()
  const parts = cleaned.split(/\s*[-–—]\s*/).map((part) => part.replace(/\./g, '').trim())
  const names = parts.map((part) => DAY_NAMES[part.toLowerCase()])

  if (parts.length > 0 && names.every(Boolean)) {
    return names.map((name, index) => (index === 0 ? name : name.toLowerCase())).join(' – ')
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export function parseHoursLine(line) {
  const text = String(line ?? '').replace(/\s+/g, ' ').trim()

  const range = text.match(TIME_RANGE)
  if (range) {
    const days = text.slice(0, range.index)
    return {
      days: normalizeDays(days),
      time: `${normalizeTime(range[1])} – ${normalizeTime(range[2])}`,
      closed: false,
    }
  }

  const closed = text.match(CLOSED)
  if (closed) {
    return { days: normalizeDays(closed[1]), time: 'nieczynne', closed: true }
  }

  return { days: text, time: '', closed: false }
}
