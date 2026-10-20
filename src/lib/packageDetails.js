import { packageStories } from '../data/packageStories'
import { describeTreatment } from '../data/treatmentInfo'

// Dane okna „Dowiedz się więcej” przy pakiecie. Własne wpisy z panelu admina (`lead`, `steps`)
// mają pierwszeństwo, w drugiej kolejności gotowa opowieść pakietu (packageStories.js),
// a dla pakietu bez żadnej – lista zabiegów z krótkimi opisami (treatmentInfo.js).

// Zapasowy widok dla pakietu bez własnej opowieści (np. dodanego w panelu).
export function fallbackSteps(pkg) {
  const names = pkg?.items?.length ? pkg.items : [pkg?.name ?? '']
  return names
    .filter(Boolean)
    .map((name) => ({ title: name, text: describeTreatment(name)?.text ?? '' }))
}

// Punkty „Co wchodzi w pakiet” w oknie.
export function resolveSteps(pkg) {
  if (Array.isArray(pkg?.steps)) return pkg.steps
  const story = packageStories[pkg?.id]
  return story ? story.steps : fallbackSteps(pkg)
}

// Podpis pod nagłówkiem okna.
export function resolveLead(pkg) {
  if (typeof pkg?.lead === 'string') return pkg.lead
  return packageStories[pkg?.id]?.lead ?? pkg?.description ?? ''
}

// Krótki opis na karcie pakietu.
export function resolveCardText(pkg) {
  return pkg?.description || packageStories[pkg?.id]?.lead || ''
}
