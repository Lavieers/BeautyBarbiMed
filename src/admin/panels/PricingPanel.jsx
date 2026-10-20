import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { sectionDefaults } from '../../data/defaults'
import { useContent } from '../../content/context'
import AdminIcon from '../AdminIcon'
import {
  finalizePricingRow,
  isDirty,
  newPricingRow,
  seedInfo,
  stripCurrency,
} from '../pricingForm'
import { TreatmentEditForm, TreatmentEditorModal } from './TreatmentEditor'
import '../../components/PackageModal.scss'
import './PricingPanel.scss'

const sectionKey = 'pricing'

function slugId(text) {
  return (
    String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'grupa'
  )
}

function flattenPricingRows(groups) {
  const out = []
  for (const group of groups ?? []) {
    for (const row of group.rows ?? []) {
      out.push({
        id: row.id,
        name: row.name,
        price: row.price,
        category: group.label ?? '',
        groupId: group.id,
        info: row.info,
      })
    }
  }
  return out
}

function groupPricingRows(flat) {
  const groups = []
  const indexByLabel = new Map()

  for (const row of flat) {
    const label = String(row.category ?? '').trim() || 'Inne'
    let idx = indexByLabel.get(label)
    if (idx === undefined) {
      idx = groups.length
      indexByLabel.set(label, idx)
      groups.push({
        id: row.groupId || slugId(label),
        label,
        rows: [],
      })
    }
    groups[idx].rows.push({
      id: row.id || `row-${Math.random().toString(36).slice(2, 8)}`,
      name: row.name ?? '',
      price: row.price ?? '',
      ...(row.info ? { info: row.info } : {}),
    })
  }

  return groups
}

function PricingPanel() {
  const { sections, refresh } = useContent()
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState(null)
  const [modal, setModal] = useState(null)
  const [flashRow, setFlashRow] = useState(null)
  const flashRef = useRef(null)

  useEffect(() => {
    if (flashRow === null) return undefined
    flashRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const timer = window.setTimeout(() => setFlashRow(null), 2600)
    return () => window.clearTimeout(timer)
  }, [flashRow])

  const saved = { ...(sectionDefaults[sectionKey] ?? {}), ...(sections?.[sectionKey] ?? {}) }
  const pricing = draft?.key === sectionKey ? draft.value : saved
  const rows = flattenPricingRows(pricing.groups)

  const categories = useMemo(() => {
    const labels = new Set((pricing.groups ?? []).map((group) => group.label).filter(Boolean))
    for (const row of rows) {
      if (row.category?.trim()) labels.add(row.category.trim())
    }
    return [...labels].sort((a, b) => a.localeCompare(b, 'pl'))
  }, [pricing.groups, rows])

  const setRows = (nextRows) => {
    setDraft({
      key: sectionKey,
      value: { ...pricing, groups: groupPricingRows(nextRows) },
    })
  }

  const save = async () => {
    setStatus({ kind: 'busy', text: 'Zapisuję…' })

    const { error } = await supabase
      .from('sections')
      .upsert({ key: sectionKey, content: pricing }, { onConflict: 'key' })

    if (error) {
      setStatus({ kind: 'error', text: error.message })
      return
    }

    await refresh()
    setDraft(null)
    setStatus({ kind: 'ok', text: 'Zapisane. Odśwież stronę główną, żeby zobaczyć zmiany.' })
  }

  const closeModal = () => setModal(null)

  const openAdd = () => {
    const value = newPricingRow(categories)
    setModal({ mode: 'add', value, initial: structuredClone(value), error: null })
  }

  const openEdit = (rowIndex) => {
    const row = rows[rowIndex]
    const value = { ...row, price: stripCurrency(row.price), info: seedInfo(row) }
    setModal({ mode: 'edit', rowIndex, value, initial: structuredClone(value), error: null })
  }

  const commitModal = () => {
    if (!modal) return
    const { row, error } = finalizePricingRow(modal.value)
    if (error) {
      setModal({ ...modal, error })
      return
    }

    const unsaved = 'Kliknij „Zapisz na stronie”, żeby zmiany pojawiły się na stronie.'

    if (modal.mode === 'add') {
      const nextRows = [...rows, row]
      setRows(nextRows)
      setFlashRow(
        flattenPricingRows(groupPricingRows(nextRows)).findIndex(
          (item) => item.name === row.name && item.price === row.price && item.category === row.category,
        ),
      )
      setStatus({ kind: 'ok', text: `Dodano zabieg „${row.name}” do listy. ${unsaved}` })
    } else {
      setRows(rows.map((item, index) => (index === modal.rowIndex ? row : item)))
      setStatus({ kind: 'ok', text: `Zmieniono „${row.name}”. ${unsaved}` })
    }

    closeModal()
  }

  const removeRow = (rowIndex) => {
    if (!window.confirm('Usunąć tę pozycję z cennika?')) return
    const removed = rows[rowIndex]
    setRows(rows.filter((_, index) => index !== rowIndex))
    setStatus({
      kind: 'ok',
      text: `Usunięto „${removed?.name ?? 'pozycję'}” z listy. Kliknij „Zapisz na stronie”, żeby zmiana pojawiła się na stronie.`,
    })
    closeModal()
  }

  return (
    <div className="adm-panel adm-panel--home adm-pricing">
      <section className="adm-pricing__stage" aria-label="Cennik zabiegów">
        {rows.length === 0 ? (
          <p className="adm-pricing__empty">Cennik jest pusty — dodaj pierwszą pozycję plusem w rogu.</p>
        ) : (
          <div className="adm-pricing__table-wrap">
            <table className="adm-pricing__table">
              <thead>
                <tr>
                  <th scope="col">Nazwa</th>
                  <th scope="col">Kategoria</th>
                  <th scope="col">Cena</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={row.id ?? rowIndex}
                    ref={rowIndex === flashRow ? flashRef : null}
                    className={rowIndex === flashRow ? 'adm-pricing__row--flash' : undefined}
                  >
                    <td>
                      <button
                        type="button"
                        className="adm-pricing__row-hit"
                        onClick={() => openEdit(rowIndex)}
                      >
                        <span className="adm-pricing__name">{row.name}</span>
                        <span className="adm-pricing__hint">Kliknij, aby edytować</span>
                      </button>
                    </td>
                    <td>{row.category}</td>
                    <td className="adm-pricing__price">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <button type="button" className="adm-panel-fab" aria-label="Dodaj pozycję cennika" onClick={openAdd}>
        <AdminIcon name="plus" className="adm-panel-fab__icon" />
      </button>

      {modal ? (
        <TreatmentEditorModal
          title={modal.mode === 'add' ? 'Nowa pozycja' : 'Edytuj pozycję'}
          size="edit"
          dirty={isDirty(modal.initial, modal.value)}
          onClose={closeModal}
          footer={
            <>
              <button type="button" className="adm-btn adm-btn--primary" onClick={commitModal}>
                {modal.mode === 'add' ? 'Dodaj' : 'Zapisz'}
              </button>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={closeModal}>
                Anuluj
              </button>
              {modal.mode === 'edit' ? (
                <button
                  type="button"
                  className="adm-btn adm-btn--quiet adm-pricing__delete"
                  onClick={() => removeRow(modal.rowIndex)}
                >
                  Usuń
                </button>
              ) : null}
              <span className="adm-pkg-modal__hint">
                Kliknij w nazwę, opis, czas, cenę lub zdjęcie w oknie i wpisz zmianę. Tak okno zobaczą klientki.
              </span>
              {modal.error ? (
                <span className="adm-status adm-status--error adm-pricing__modal-error" role="alert">
                  {modal.error}
                </span>
              ) : null}
            </>
          }
        >
          <TreatmentEditForm
            value={modal.value}
            categories={categories}
            onChange={(value) => setModal({ ...modal, value, error: null })}
          />
        </TreatmentEditorModal>
      ) : null}

      <div className="adm-actions adm-actions--sticky adm-pricing__save">
        <button type="button" className="adm-btn adm-btn--primary adm-pricing__save-btn" onClick={save}>
          Zapisz na stronie
        </button>
        <span className="adm-pricing__status" aria-live="polite">
          {status ? <span className={`adm-status adm-status--${status.kind}`}>{status.text}</span> : null}
        </span>
      </div>
    </div>
  )
}

export default PricingPanel
