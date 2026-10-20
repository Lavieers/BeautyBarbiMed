import { rowKey, treatmentGuide } from '../data/treatmentGuide'

export const INFO_TEXT_FIELDS = ['duration', 'what', 'forWhom', 'effects', 'avoid', 'note']

const CURRENCY_TAIL = /\s*(zł|zl|pln)\.?\s*$/i

export const stripCurrency = (price) => String(price ?? '').replace(CURRENCY_TAIL, '').trim()

export const withCurrency = (price) => {
  const amount = stripCurrency(price)
  return amount ? `${amount} zł` : ''
}

export function isDirty(initial, value) {
  return JSON.stringify(initial) !== JSON.stringify(value)
}

export function newPricingRow(categories) {
  return {
    id: `row-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    category: categories[0] ?? '',
    price: '',
    groupId: '',
    info: emptyInfo(),
  }
}

export function emptyInfo() {
  return {
    duration: '',
    what: '',
    forWhom: '',
    effects: '',
    avoid: '',
    note: '',
    image: '',
    position: '',
  }
}

export function seedInfo(row) {
  const guide = buildGuideForSeed(row)
  return {
    duration: guide.duration ?? '',
    what: guide.what ?? '',
    forWhom: guide.forWhom ?? '',
    effects: guide.effects ?? '',
    avoid: guide.avoid ?? '',
    note: guide.note ?? '',
    image: row.info?.image ?? '',
    position: row.info?.position ?? '',
  }
}

function buildGuideForSeed(row) {
  const base = treatmentGuide[rowKey(row)]
  const info = row?.info ?? {}
  const out = {}
  for (const field of INFO_TEXT_FIELDS) {
    out[field] = typeof info[field] === 'string' ? info[field] : (base?.[field] ?? '')
  }
  return out
}

export function finalizePricingRow(value) {
  const name = String(value.name ?? '').trim()
  if (!name) return { error: 'Wpisz nazwę zabiegu.' }

  const category = String(value.category ?? '').trim()
  if (!category) return { error: 'Wpisz kategorię.' }

  const price = withCurrency(value.price)
  if (!price) return { error: 'Wpisz cenę.' }

  const cleaned = {
    ...value,
    id: value.id || `row-${Math.random().toString(36).slice(2, 8)}`,
    name,
    category,
    price,
  }

  const info = Object.fromEntries(
    INFO_TEXT_FIELDS.map((field) => [field, String(value.info?.[field] ?? '').trim()]),
  )
  const image = String(value.info?.image ?? '').trim()
  const hasContent = INFO_TEXT_FIELDS.some((field) => info[field])
  const hasDefaults = Boolean(treatmentGuide[rowKey(cleaned)])
  if (hasContent || hasDefaults) {
    cleaned.info = { ...info, ...(image ? { image } : {}) }
  } else {
    delete cleaned.info
  }

  return { row: cleaned }
}
