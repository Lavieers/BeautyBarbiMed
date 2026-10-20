import { resolveCardText, resolveLead, resolveSteps } from '../lib/packageDetails'

// ── Dane edytowanego pakietu ───────────────────────────────────────────────────

let counter = 0
export const uid = () => `k${Date.now().toString(36)}${(counter += 1)}`

export const text = (value) => String(value ?? '').trim()

// Pusty pakiet z okienka „Nowy pakiet”: tylko to, co widać na karcie.
export function newPackageValue() {
  return {
    id: `pakiet-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    description: '',
    price: '',
    image: '',
  }
}

// Pakiet gotowy do edycji: pola uzupełnione tym, co klientka widzi teraz na stronie
// (opis karty, podpis okna, punkty „Co wchodzi w pakiet”).
export function editableValue(pkg) {
  return {
    ...pkg,
    name: pkg.name ?? '',
    description: resolveCardText(pkg),
    lead: resolveLead(pkg),
    price: pkg.price ?? '',
    was: pkg.was ?? '',
    save: pkg.save ?? '',
    image: pkg.image ?? '',
    steps: resolveSteps(pkg).map((step) => ({
      title: step.title ?? '',
      text: step.text ?? '',
      _k: uid(),
    })),
  }
}

// Sprawdza formularz i zwraca pakiet do zapisania albo komunikat błędu.
export function finalizePackage(value) {
  const name = text(value.name)
  if (!name) return { error: 'Wpisz nazwę pakietu.' }

  const price = Number(value.price)
  if (value.price === '' || !Number.isFinite(price) || price <= 0) {
    return { error: 'Wpisz cenę pakietu.' }
  }

  const description = text(value.description)
  if (!description) return { error: 'Dodaj krótki opis pakietu.' }

  const pkg = { ...value, name, description, price, image: value.image || '' }

  for (const key of ['was', 'save']) {
    const number = Number(value[key])
    if (value[key] === '' || value[key] == null || !Number.isFinite(number)) delete pkg[key]
    else pkg[key] = number
  }

  if (typeof value.lead === 'string') pkg.lead = text(value.lead)

  if (Array.isArray(value.steps)) {
    pkg.steps = value.steps
      .map((step) => ({ title: text(step.title), text: text(step.text) }))
      .filter((step) => step.title)
  }
  pkg.items = (pkg.steps ?? []).map((step) => step.title)

  return { pkg }
}

// Zmiany względem wartości początkowych (do pytania o niezapisane zmiany).
export function isDirty(initial, value) {
  return JSON.stringify(initial) !== JSON.stringify(value)
}
