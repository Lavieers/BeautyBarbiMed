import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { sectionDefaults } from '../../data/defaults'
import { useContent } from '../../content/context'
import { blankLike } from '../fields/blank'
import AdminIcon from '../AdminIcon'
import '../../components/Offer.scss'
import './OfferPanel.scss'

const sectionKey = 'offer'

function tabLabelFor(category) {
  if (category?.tabLabel) return category.tabLabel
  return String(category?.title ?? '').replace(/^PAKIET(Y)? /i, '') || 'Kategoria'
}

function featuredIndexOf(packages) {
  const list = packages ?? []
  const marked = list.findIndex((pkg) => pkg.featured)
  if (marked >= 0) return marked
  if (list.length >= 3) return 1
  if (list.length === 2) return 1
  return 0
}

function ItemsEditor({ items, onChange }) {
  const list = Array.isArray(items) ? items : []

  return (
    <div className="adm-field">
      <span className="adm-field__label">Co wchodzi w pakiet?</span>
      <ul className="adm-list adm-offer__item-list">
        {list.map((item, index) => (
          <li key={index} className="adm-list__row">
            <input
              className="adm-input"
              value={item ?? ''}
              onChange={(event) =>
                onChange(list.map((row, position) => (position === index ? event.target.value : row)))
              }
              placeholder="np. Peeling kawitacyjny"
            />
            <button
              type="button"
              className="adm-btn adm-btn--quiet"
              onClick={() => onChange(list.filter((_, position) => position !== index))}
            >
              Usuń
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="adm-btn adm-btn--ghost" onClick={() => onChange([...list, ''])}>
        + Dodaj kolejny zabieg
      </button>
    </div>
  )
}

function OfferModal({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="adm-modal" role="presentation">
      <button type="button" className="adm-modal__backdrop" aria-label="Zamknij" onClick={onClose} />
      <div className="adm-modal__panel" role="dialog" aria-modal="true" aria-labelledby="adm-offer-modal-title">
        <header className="adm-modal__head">
          <h2 id="adm-offer-modal-title" className="adm-modal__title">
            {title}
          </h2>
          <button type="button" className="adm-modal__close" aria-label="Zamknij" onClick={onClose}>
            <span />
            <span />
          </button>
        </header>
        <div className="adm-modal__body">{children}</div>
      </div>
    </div>
  )
}

function PackagePreviewCard({ pkg, featured, onEdit }) {
  const price = pkg.price ?? '—'
  const was = pkg.was
  const save = pkg.save

  return (
    <li className={`offer__package${featured ? ' offer__package--featured' : ''}`}>
      <button type="button" className="adm-offer__card-hit" onClick={onEdit}>
        <div className="offer__package-inner">
          <h3 className="offer__package-name">{pkg.name || 'Nowy pakiet'}</h3>
          <span className="offer__package-rule" aria-hidden="true">
            <i />
          </span>
          <div className="offer__package-body">
            {pkg.description ? <p className="offer__package-desc">{pkg.description}</p> : null}
            {pkg.items?.length ? (
              <ul className="offer__package-items">
                {pkg.items.map((item, itemIndex) => (
                  <li key={`${pkg.id}-${itemIndex}`}>{item}</li>
                ))}
              </ul>
            ) : null}
            {!pkg.description && !pkg.items?.length ? (
              <p className="offer__package-desc adm-offer__placeholder">Uzupełnij zabiegi w pakiecie</p>
            ) : null}
          </div>
          <div
            className="offer__pricing"
            aria-label={
              typeof price === 'number' && was && save
                ? `Cena ${price} zł, zamiast ${was} zł, oszczędzasz ${save} zł`
                : undefined
            }
          >
            <p className="offer__price-main">
              <span className="offer__price-value">{price}</span>
              <span className="offer__price-currency">zł</span>
            </p>
            {was != null && was !== '' ? (
              <p className="offer__price-was">
                <span>zamiast</span> <s>{was} zł</s>
              </p>
            ) : null}
            {save != null && save !== '' ? <p className="offer__price-save">oszczędzasz {save} zł</p> : null}
          </div>
          <span className="adm-offer__edit-hint">Kliknij, aby edytować</span>
        </div>
      </button>
    </li>
  )
}

function PackageForm({ value, onChange }) {
  const patch = (next) => onChange({ ...value, ...next })

  const syncSave = (nextPrice, nextWas) => {
    const price = nextPrice ?? value.price
    const was = nextWas ?? value.was
    if (typeof price === 'number' && typeof was === 'number' && was >= price) {
      return was - price
    }
    return value.save
  }

  return (
    <>
      <label className="adm-field">
        <span className="adm-field__label">Nazwa pakietu</span>
        <input
          className="adm-input"
          value={value.name ?? ''}
          onChange={(event) => patch({ name: event.target.value })}
          placeholder="np. Odświeżenie i blask"
        />
      </label>

      <ItemsEditor
        items={value.items ?? []}
        onChange={(items) => patch({ items, description: items.length ? '' : value.description })}
      />

      <label className="adm-field">
        <span className="adm-field__label">Albo jeden krótki opis (bez listy)</span>
        <textarea
          className="adm-input adm-input--area"
          rows={3}
          value={value.description ?? ''}
          onChange={(event) =>
            patch({
              description: event.target.value,
              items: event.target.value.trim() ? [] : value.items,
            })
          }
          placeholder="Np. gdy pakiet ma jeden akapit zamiast punktów."
        />
      </label>

      <div className="adm-row adm-offer__price-row">
        <label className="adm-field">
          <span className="adm-field__label">Cena w pakiecie (zł)</span>
          <input
            type="number"
            className="adm-input"
            value={value.price ?? ''}
            onChange={(event) => {
              const price = event.target.value === '' ? '' : Number(event.target.value)
              patch({ price, save: syncSave(price, undefined) })
            }}
          />
        </label>
        <label className="adm-field">
          <span className="adm-field__label">Cena pojedynczo (zł)</span>
          <input
            type="number"
            className="adm-input"
            value={value.was ?? ''}
            onChange={(event) => {
              const was = event.target.value === '' ? '' : Number(event.target.value)
              patch({ was, save: syncSave(undefined, was) })
            }}
          />
        </label>
        <label className="adm-field">
          <span className="adm-field__label">Oszczędność (zł)</span>
          <input
            type="number"
            className="adm-input"
            value={value.save ?? ''}
            onChange={(event) =>
              patch({ save: event.target.value === '' ? '' : Number(event.target.value) })
            }
          />
        </label>
      </div>
      <p className="adm-field__hint adm-offer__price-hint">
        Po wpisaniu obu cen oszczędność policzy się sama — możesz też poprawić ręcznie.
      </p>
    </>
  )
}

function OfferPanel() {
  const { sections, refresh } = useContent()
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState(null)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [modal, setModal] = useState(null)

  const saved = { ...(sectionDefaults[sectionKey] ?? {}), ...(sections?.[sectionKey] ?? {}) }
  const offer = draft?.key === sectionKey ? draft.value : saved
  const categories = offer.categories ?? []
  const activeIndex =
    categories.length === 0 ? 0 : Math.min(categoryIndex, categories.length - 1)

  const activeCategory = categories[activeIndex]
  const packages = activeCategory?.packages ?? []
  const packageCount = packages.length
  const featuredIndex = featuredIndexOf(packages)

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

  const openAdd = () =>
    setModal({
      kind: 'package',
      mode: 'add',
      value: blankLike(
        packages[0] ?? { id: '', name: '', items: [], price: 0, was: 0, save: 0 },
      ),
    })

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
    if (!modal || modal.kind !== 'package') return
    const name = String(modal.value.name ?? '').trim()
    if (!name) {
      setStatus({ kind: 'error', text: 'Wpisz nazwę pakietu.' })
      return
    }

    const cleaned = {
      ...modal.value,
      name,
      items: (modal.value.items ?? []).map((row) => String(row).trim()).filter(Boolean),
      description: String(modal.value.description ?? '').trim(),
    }

    if (!cleaned.description && cleaned.items.length === 0) {
      setStatus({ kind: 'error', text: 'Dodaj choć jeden zabieg albo krótki opis.' })
      return
    }

    if (modal.mode === 'add') {
      updateCategory(activeIndex, {
        ...activeCategory,
        packages: [...packages, cleaned],
      })
    } else {
      const nextPackages = packages.map((row, position) =>
        position === modal.pkgIndex ? cleaned : row,
      )
      updateCategory(activeIndex, { ...activeCategory, packages: nextPackages })
    }

    closeModal()
    setStatus(null)
  }

  let modalNode = null

  if (modal?.kind === 'package') {
    modalNode = (
      <OfferModal
        title={modal.mode === 'add' ? 'Nowy pakiet' : 'Zmień pakiet'}
        onClose={closeModal}
      >
        <PackageForm value={modal.value} onChange={(value) => setModal({ ...modal, value })} />
        <div className="adm-modal__foot">
          <button type="button" className="adm-btn adm-btn--primary" onClick={commitModalPackage}>
            {modal.mode === 'add' ? 'Dodaj' : 'Zapisz'}
          </button>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={closeModal}>
            Anuluj
          </button>
          {modal.mode === 'edit' ? (
            <button
              type="button"
              className="adm-btn adm-btn--quiet adm-offer__delete"
              onClick={() => removePackage(modal.pkgIndex)}
            >
              Usuń pakiet
            </button>
          ) : null}
        </div>
      </OfferModal>
    )
  }

  return (
    <div className="adm-panel adm-panel--home adm-offer">
      {categories.length === 0 ? (
        <p className="adm-empty">Brak pakietów do edycji — skontaktuj się z administratorem strony.</p>
      ) : (
        <section className="offer adm-offer__stage" aria-label="Podgląd pakietów">
          <div className="adm-offer__stage-inner">
            <div className="offer__tabs" role="tablist" aria-label="Rodzaj pakietów">
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
                  <ul
                    className={`offer__packages offer__packages--count-${Math.min(packageCount, 3)} adm-offer__cards`}
                  >
                    {packages.map((pkg, pkgIndex) => (
                      <PackagePreviewCard
                        key={pkg.id ?? pkgIndex}
                        pkg={pkg}
                        featured={pkgIndex === featuredIndex}
                        onEdit={() =>
                          setModal({
                            kind: 'package',
                            mode: 'edit',
                            pkgIndex,
                            value: {
                              ...pkg,
                              items: [...(pkg.items ?? [])],
                            },
                          })
                        }
                      />
                    ))}
                  </ul>
                )}
              </div>
              <p className="offer__slide-footnote adm-offer__footnote" aria-live="polite">
                {activeCategory?.footnote || '\u00a0'}
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
