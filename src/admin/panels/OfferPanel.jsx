import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { sectionDefaults } from '../../data/defaults'
import { useContent } from '../../content/context'
import AdminIcon from '../AdminIcon'
import PackageCarousel from '../../components/PackageCarousel'
import { CardFields, EditForm, PackageEditorModal } from './PackageEditor'
import { editableValue, finalizePackage, isDirty, newPackageValue } from '../packageForm'
import useMediaQuery from '../../lib/useMediaQuery'
import useSwipe from '../../lib/useSwipe'
import '../../components/Offer.scss'
import '../../components/PackageCarousel.scss'
import './OfferPanel.scss'

const sectionKey = 'offer'

function tabLabelFor(category) {
  if (category?.tabLabel) return category.tabLabel
  return String(category?.title ?? '').replace(/^PAKIET(Y)? /i, '') || 'Kategoria'
}

function OfferPanel() {
  const { sections, refresh } = useContent()
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState(null)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [modal, setModal] = useState(null)
  // Na telefonie podgląd wygląda jak na stronie głównej (karuzela), a kategorie zmienia się palcem.
  const compact = useMediaQuery('(max-width: 900px)')

  const saved = { ...(sectionDefaults[sectionKey] ?? {}), ...(sections?.[sectionKey] ?? {}) }
  const offer = draft?.key === sectionKey ? draft.value : saved
  const categories = offer.categories ?? []
  const activeIndex =
    categories.length === 0 ? 0 : Math.min(categoryIndex, categories.length - 1)

  const activeCategory = categories[activeIndex]
  const packages = activeCategory?.packages ?? []
  const packageCount = packages.length
  const swipeTabs = useSwipe(compact && categories.length > 1, (direction) => {
    const count = categories.length
    setCategoryIndex((activeIndex + direction + count) % count)
  })

  // Karuzela wymaga unikalnych identyfikatorów – nowo dodane pakiety mogą ich jeszcze nie mieć.
  const carouselPackages = packages.map((pkg, index) => ({ ...pkg, id: pkg.id || `nowy-${index}` }))

  // Okno edycji szczegółów pakietu („Dowiedz się więcej” + dane karty).
  const openEdit = (pkgIndex) => {
    const value = editableValue(packages[pkgIndex])
    setModal({ mode: 'edit', pkgIndex, value, initial: value, error: null })
  }
  const setOffer = (next) => setDraft({ key: sectionKey, value: next })

  const updateCategories = (nextCategories) => setOffer({ ...offer, categories: nextCategories })

  const updateCategory = (index, nextCategory) =>
    updateCategories(categories.map((row, position) => (position === index ? nextCategory : row)))

  const persistOffer = async (content) => {
    const { error } = await supabase
      .from('sections')
      .upsert({ key: sectionKey, content }, { onConflict: 'key' })

    if (error) throw error
    await refresh()
    setDraft(null)
  }

  const save = async () => {
    setStatus({ kind: 'busy', text: 'Zapisuję…' })

    try {
      await persistOffer(offer)
      setStatus({ kind: 'ok', text: 'Zapisane. Odśwież stronę główną, żeby zobaczyć zmiany.' })
    } catch (cause) {
      setStatus({ kind: 'error', text: cause.message ?? 'Nie udało się zapisać.' })
    }
  }

  const closeModal = () => setModal(null)

  // Okienko „Nowy pakiet”: tylko nazwa, zdjęcie, cena i krótki opis – resztę uzupełnia się w edycji.
  const openAdd = () => {
    const value = newPackageValue()
    setModal({ mode: 'add', pkgIndex: null, value, initial: value, error: null })
  }
  const removePackage = async (pkgIndex) => {
    if (!window.confirm('Na pewno usunąć ten pakiet ze strony?')) return

    const nextCategories = categories.map((row, position) =>
      position === activeIndex
        ? { ...row, packages: packages.filter((_, index) => index !== pkgIndex) }
        : row,
    )
    const nextOffer = { ...offer, categories: nextCategories }

    closeModal()
    setStatus({ kind: 'busy', text: 'Usuwam pakiet…' })

    try {
      await persistOffer(nextOffer)
      setStatus({ kind: 'ok', text: 'Pakiet usunięty ze strony.' })
    } catch (cause) {
      setDraft({ key: sectionKey, value: nextOffer })
      setStatus({ kind: 'error', text: cause.message ?? 'Nie udało się usunąć pakietu.' })
    }
  }

  const commitModalPackage = () => {
    if (!modal) return
    const { pkg, error } = finalizePackage(modal.value)
    if (error) {
      setModal({ ...modal, error })
      return
    }

    if (modal.mode === 'add') {
      updateCategory(activeIndex, { ...activeCategory, packages: [...packages, pkg] })
    } else {
      const nextPackages = packages.map((row, position) => (position === modal.pkgIndex ? pkg : row))
      updateCategory(activeIndex, { ...activeCategory, packages: nextPackages })
    }

    closeModal()
    setStatus(null)
  }

  let modalNode = null

  if (modal) {
    const adding = modal.mode === 'add'
    const patchValue = (next) => setModal({ ...modal, value: { ...modal.value, ...next }, error: null })

    modalNode = (
      <PackageEditorModal
        title={adding ? 'Nowy pakiet' : 'Edytuj pakiet'}
        size={adding ? 'add' : 'edit'}
        dirty={isDirty(modal.initial, modal.value)}
        onClose={closeModal}
        footer={
          <>
            <button type="button" className="adm-btn adm-btn--primary" onClick={commitModalPackage}>
              {adding ? 'Dodaj' : 'Zapisz'}
            </button>
            <button type="button" className="adm-btn adm-btn--ghost" onClick={closeModal}>
              Anuluj
            </button>
            {!adding ? (
              <button
                type="button"
                className="adm-btn adm-btn--quiet adm-offer__delete"
                onClick={() => removePackage(modal.pkgIndex)}
              >
                Usuń pakiet
              </button>
            ) : null}
            {!adding ? (
              <span className="adm-pkg-modal__hint">
                Kliknij w nazwę, opis, zabieg, cenę lub zdjęcie w oknie i wpisz zmianę. Tak okno zobaczą klientki.
              </span>
            ) : null}
            {modal.error ? (
              <span className="adm-status adm-status--error adm-pkg-modal__error" role="alert">
                {modal.error}
              </span>
            ) : null}
          </>
        }
      >
        {adding ? (
          <div className="adm-pkg-modal__add">
            <CardFields value={modal.value} category={activeCategory} onChange={patchValue} />
          </div>
        ) : (
          <EditForm
            value={modal.value}
            category={activeCategory}
            position={modal.pkgIndex}
            total={packages.length}
            onChange={(value) => setModal({ ...modal, value, error: null })}
          />
        )}
      </PackageEditorModal>
    )
  }
  return (
    <div className="adm-panel adm-panel--home adm-offer">
      {categories.length === 0 ? (
        <p className="adm-empty">Brak pakietów do edycji — skontaktuj się z administratorem strony.</p>
      ) : (
        <section className="offer adm-offer__stage" aria-label="Podgląd pakietów">
          <div className="adm-offer__stage-inner">
            <div className="offer__tabs" role="tablist" aria-label="Rodzaj pakietów" {...swipeTabs}>
              {categories.map((category, index) => (
                <button
                  key={category.id ?? index}
                  type="button"
                  role="tab"
                  className={`offer__tab${index === activeIndex ? ' offer__tab--active' : ''}`}
                  aria-selected={index === activeIndex}
                  onClick={() => setCategoryIndex(index)}
                >
                  {tabLabelFor(category)}
                </button>
              ))}
            </div>

            <div className="adm-offer__viewport">
              <div className="adm-offer__viewport-main">
                {packages.length === 0 ? (
                  <p className="adm-offer__empty">
                    W tej zakładce nie ma jeszcze pakietów — użyj plusa w rogu.
                  </p>
                ) : (
                  <PackageCarousel
                    key={`${activeIndex}-${packageCount}`}
                    packages={carouselPackages}
                    category={activeCategory}
                    autoPlay={false}
                    onPackageInfo={(pkg) =>
                      openEdit(carouselPackages.findIndex((row) => row.id === pkg.id))
                    }
                  />
                )}
              </div>
              <p className="offer__slide-footnote adm-offer__footnote">
                Kliknij w okno, aby edytować
              </p>
            </div>
          </div>
        </section>
      )}

      {categories.length > 0 ? (
        <button type="button" className="adm-panel-fab" aria-label="Dodaj nowy pakiet" onClick={openAdd}>
          <AdminIcon name="plus" className="adm-panel-fab__icon" />
        </button>
      ) : null}

      {modalNode}

      <div className="adm-actions adm-actions--sticky adm-offer__save">
        <button type="button" className="adm-btn adm-btn--primary adm-offer__save-btn" onClick={save}>
          Zapisz na stronie
        </button>
        <span className="adm-offer__status" aria-live="polite">
          {status ? (
            <span className={`adm-status adm-status--${status.kind}`}>{status.text}</span>
          ) : null}
        </span>
      </div>
    </div>
  )
}

export default OfferPanel
