import { useLayoutEffect, useRef, useState } from 'react'
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
  const label = String(category?.tabLabel ?? '').trim()
  if (label) return label
  return String(category?.title ?? '').replace(/^PAKIET(Y)? /i, '').trim() || 'Nowa'
}

function blankCategory() {
  return {
    id: `zakladka-${Math.random().toString(36).slice(2, 8)}`,
    icon: 'sparkle',
    tabLabel: '',
    title: '',
    subtitle: '',
    packages: [],
  }
}

function offerWithNamedTab(offer, draft) {
  if (!draft) return offer
  const categories = offer.categories ?? []
  const name = draft.name.trim()
  if (!name) {
    return { ...offer, categories: categories.filter((_, index) => index !== draft.index) }
  }
  const tabLabel = name.toLocaleUpperCase('pl-PL')
  return {
    ...offer,
    categories: categories.map((row, index) =>
      index === draft.index ? { ...row, tabLabel, title: `PAKIETY ${tabLabel}` } : row,
    ),
  }
}

function OfferPanel() {
  const { sections, refresh } = useContent()
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState(null)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [modal, setModal] = useState(null)
  const [tabDraft, setTabDraft] = useState(null)
  const tabDraftRef = useRef(null)
  // Na telefonie podgląd wygląda jak na stronie głównej (karuzela), a kategorie zmienia się palcem.
  const compact = useMediaQuery('(max-width: 900px)')

  const saved = { ...(sectionDefaults[sectionKey] ?? {}), ...(sections?.[sectionKey] ?? {}) }
  const offer = draft?.key === sectionKey ? draft.value : saved
  const offerRef = useRef(offer)
  useLayoutEffect(() => {
    offerRef.current = offer
  }, [offer])
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
  const setOffer = (next) => {
    offerRef.current = next
    setDraft({ key: sectionKey, value: next })
  }

  const updateCategories = (nextCategories) =>
    setOffer({ ...offerRef.current, categories: nextCategories })

  const updateCategory = (index, nextCategory) =>
    updateCategories(
      (offerRef.current.categories ?? []).map((row, position) =>
        position === index ? nextCategory : row,
      ),
    )

  const persistOffer = async (content) => {
    const { error } = await supabase
      .from('sections')
      .upsert({ key: sectionKey, content }, { onConflict: 'key' })

    if (error) throw error
    await refresh()
    setDraft(null)
  }

  const finishTabDraft = (keep) => {
    const current = tabDraftRef.current
    if (!current) return offerRef.current
    tabDraftRef.current = null
    setTabDraft(null)
    const next = keep
      ? offerWithNamedTab(offerRef.current, current)
      : offerWithNamedTab(offerRef.current, { ...current, name: '' })
    setOffer(next)
    if (!keep || !current.name.trim()) {
      setCategoryIndex(Math.max(0, current.index - 1))
    }
    return next
  }

  const addTab = () => {
    if (tabDraftRef.current) {
      document.getElementById('adm-offer-tab-name')?.focus()
      return
    }
    const nextCategories = [...categories, blankCategory()]
    const index = nextCategories.length - 1
    const nextDraft = { index, name: '' }
    tabDraftRef.current = nextDraft
    setTabDraft(nextDraft)
    updateCategories(nextCategories)
    setCategoryIndex(index)
  }

  const removeTab = (index) => {
    const category = categories[index]
    if (!category) return
    const draftName = tabDraftRef.current?.index === index ? tabDraftRef.current.name.trim() : ''
    const label = draftName || (String(category.tabLabel ?? '').trim() ? tabLabelFor(category) : '')
    const count = category.packages?.length ?? 0
    const detail = count === 0 ? '' : count === 1 ? ' razem z 1 pakietem' : ` razem z ${count} pakietami`
    const question = label ? `Usunąć zakładkę „${label}”${detail}?` : `Usunąć tę zakładkę${detail}?`
    if (!window.confirm(question)) return

    const currentDraft = tabDraftRef.current
    if (currentDraft) {
      if (currentDraft.index === index) {
        tabDraftRef.current = null
        setTabDraft(null)
      } else if (currentDraft.index > index) {
        const shifted = { ...currentDraft, index: currentDraft.index - 1 }
        tabDraftRef.current = shifted
        setTabDraft(shifted)
      }
    }

    updateCategories(categories.filter((_, position) => position !== index))
    setCategoryIndex((current) => {
      if (current > index) return current - 1
      if (current === index) return Math.max(0, index - 1)
      return current
    })
  }

  const save = async () => {
    const content = finishTabDraft(true)
    setStatus({ kind: 'busy', text: 'Zapisuję…' })

    try {
      await persistOffer(content)
      setStatus({ kind: 'ok', text: 'Zapisane.' })
    } catch (cause) {
      setStatus({ kind: 'error', text: cause.message ?? 'Nie udało się zapisać.' })
    }
  }

  const closeModal = () => setModal(null)

  // Okienko „Nowy pakiet”: tylko nazwa, zdjęcie, cena i krótki opis – resztę uzupełnia się w edycji.
  const openAdd = () => {
    const live = finishTabDraft(true)
    const liveCategories = live.categories ?? []
    if (liveCategories.length === 0) return
    const index = Math.min(activeIndex, liveCategories.length - 1)
    const value = newPackageValue()
    setModal({
      mode: 'add',
      pkgIndex: null,
      categoryIndex: index,
      initialCategory: index,
      value,
      initial: value,
      error: null,
    })
  }
  const removePackage = async (pkgIndex) => {
    if (!window.confirm('Na pewno usunąć ten pakiet ze strony?')) return

    const live = offerRef.current
    const liveCategories = live.categories ?? []
    const nextCategories = liveCategories.map((row, position) =>
      position === activeIndex
        ? { ...row, packages: (row.packages ?? []).filter((_, index) => index !== pkgIndex) }
        : row,
    )
    const nextOffer = { ...live, categories: nextCategories }

    closeModal()
    setStatus({ kind: 'busy', text: 'Usuwam pakiet…' })

    try {
      await persistOffer(nextOffer)
      setStatus({ kind: 'ok', text: 'Pakiet usunięty.' })
    } catch (cause) {
      setOffer(nextOffer)
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
      const index = modal.categoryIndex ?? activeIndex
      const target = (offerRef.current.categories ?? [])[index]
      if (!target) {
        setModal({ ...modal, error: 'Wybierz zakładkę.' })
        return
      }
      updateCategory(index, { ...target, packages: [...(target.packages ?? []), pkg] })
      setCategoryIndex(index)
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
        dirty={
          isDirty(modal.initial, modal.value) ||
          (adding && modal.categoryIndex !== modal.initialCategory)
        }
        onClose={closeModal}
        footer={
          <>
            <button
              type="button"
              className={adding ? 'adm-pkg-add__save' : 'adm-btn adm-btn--primary'}
              onClick={commitModalPackage}
            >
              {adding ? 'Dodaj' : 'Zapisz'}
            </button>
            <button
              type="button"
              className={adding ? 'adm-pkg-add__cancel' : 'adm-btn adm-btn--ghost'}
              onClick={closeModal}
            >
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
            <CardFields
              value={modal.value}
              category={categories[modal.categoryIndex] ?? activeCategory}
              tabs={categories.map((category, index) => ({
                id: category.id ?? index,
                index,
                label: tabDraft?.index === index && tabDraft.name.trim()
                  ? tabDraft.name.trim()
                  : tabLabelFor(category),
              }))}
              categoryIndex={modal.categoryIndex}
              onCategory={(categoryIndex) => setModal({ ...modal, categoryIndex, error: null })}
              onChange={patchValue}
            />
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
      <section className="offer adm-offer__stage" aria-label="Podgląd pakietów">
        <div className="adm-offer__stage-inner">
          <div className="adm-offer__tabbar" {...swipeTabs}>
            <div className="offer__tabs" role="tablist" aria-label="Rodzaj pakietów">
              {categories.map((category, index) =>
                tabDraft?.index === index ? null : (
                  <button
                    key={category.id ?? index}
                    type="button"
                    role="tab"
                    className={`offer__tab${index === activeIndex ? ' offer__tab--active' : ''}`}
                    aria-selected={index === activeIndex}
                    onClick={() => {
                      if (tabDraftRef.current) finishTabDraft(true)
                      setCategoryIndex(index)
                    }}
                  >
                    {tabLabelFor(category)}
                  </button>
                ),
              )}
            </div>
            {tabDraft ? (
              <input
                id="adm-offer-tab-name"
                className="adm-offer__tab-input"
                value={tabDraft.name}
                placeholder="Nazwa"
                aria-label="Nazwa zakładki"
                autoFocus
                onChange={(event) => {
                  const next = { index: tabDraft.index, name: event.target.value }
                  tabDraftRef.current = next
                  setTabDraft(next)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    finishTabDraft(true)
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    finishTabDraft(false)
                  }
                }}
                onBlur={() => finishTabDraft(true)}
              />
            ) : null}
            <div className="adm-offer__tab-tools">
              <button
                type="button"
                className="adm-offer__tab-btn"
                aria-label="Dodaj zakładkę"
                onMouseDown={(event) => event.preventDefault()}
                onClick={addTab}
              >
                <AdminIcon name="plus" />
              </button>
              <button
                type="button"
                className="adm-offer__tab-btn adm-offer__tab-btn--remove"
                aria-label="Usuń zakładkę"
                disabled={categories.length === 0}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => removeTab(activeIndex)}
              >
                <AdminIcon name="trash" />
              </button>
            </div>
          </div>

          <div className="adm-offer__viewport">
            <div className="adm-offer__viewport-main">
              {categories.length === 0 ? (
                <p className="adm-offer__empty">Brak zakładek.</p>
              ) : packages.length === 0 ? (
                <p className="adm-offer__empty">W tej zakładce nie ma pakietów.</p>
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
          </div>
        </div>
      </section>

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
