import { useEffect, useMemo, useRef, useState } from 'react'
import { mediaUrl, supabase } from '../../lib/supabase'
import { useContent } from '../../content/context'
import { useAdminTable } from '../useAdminTable'
import { removeMedia, uploadMedia } from '../upload'
import AdminIcon from '../AdminIcon'
import './GalleryPanel.scss'

function sortedRows(rows) {
  return [...rows].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.created_at).localeCompare(String(b.created_at)),
  )
}

function GalleryModal({ title, children, onClose }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="adm-modal" role="presentation">
      <button type="button" className="adm-modal__backdrop" aria-label="Zamknij" onClick={onClose} />
      <div
        className="adm-modal__panel adm-modal__panel--gallery"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-gallery-modal-title"
      >
        <header className="adm-modal__head">
          <h2 id="adm-gallery-modal-title" className="adm-modal__title">
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

function GalleryForm({ value, onChange }) {
  const patch = (next) => onChange({ ...value, ...next })

  return (
    <div className="adm-gallery__modal-layout">
      <div className="adm-gallery__modal-preview">
        <img src={mediaUrl(value.storage_path)} alt="" />
      </div>

      <div className="adm-gallery__modal-fields">
        <label className="adm-field">
          <span className="adm-field__label">Nazwa zabiegu (na kafelku)</span>
          <input
            className="adm-input"
            value={value.category ?? ''}
            onChange={(event) => patch({ category: event.target.value })}
            placeholder="np. Mezoterapia mikroigłowa"
          />
        </label>

        <label className="adm-field">
          <span className="adm-field__label">Krótki fakt pod zdjęciem</span>
          <input
            className="adm-input"
            value={value.caption ?? ''}
            onChange={(event) => patch({ caption: event.target.value })}
            placeholder="np. Efekt po 3 tygodniach"
          />
        </label>

        <label className="adm-field">
          <span className="adm-field__label">Opis dla czytników ekranu</span>
          <input
            className="adm-input"
            value={value.alt ?? ''}
            onChange={(event) => patch({ alt: event.target.value })}
            placeholder="np. Stanowisko do zabiegu"
          />
        </label>

        <label className="adm-field adm-field--check adm-gallery__modal-check">
          <input
            type="checkbox"
            checked={Boolean(value.is_published)}
            onChange={(event) => patch({ is_published: event.target.checked })}
          />
          <span>Widoczne na stronie</span>
        </label>
      </div>

      <p className="adm-field__hint adm-gallery__modal-hint">
        Kolejność: strzałki ↑↓ na kafelku w galerii (niższy numer = wyżej na stronie).
      </p>
    </div>
  )
}

function GalleryPanel() {
  const { refresh } = useContent()
  const { rows, loading, reload } = useAdminTable(
    'gallery_images',
    'sort_order.asc,created_at.desc',
  )
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [modal, setModal] = useState(null)

  const ordered = useMemo(() => sortedRows(rows), [rows])

  const afterChange = async (text) => {
    await reload()
    await refresh()
    setStatus({ kind: 'ok', text })
  }

  const upload = async (event) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    setBusy(true)
    setStatus({ kind: 'busy', text: `Wgrywam ${files.length} plik(i)…` })

    try {
      let nextOrder = ordered.reduce((max, row) => Math.max(max, row.sort_order ?? 0), 0)

      for (const file of files) {
        const storagePath = await uploadMedia(file, 'galeria')
        nextOrder += 1

        const { error } = await supabase.from('gallery_images').insert({
          storage_path: storagePath,
          alt: '',
          sort_order: nextOrder,
          is_published: true,
        })

        if (error) throw error
      }

      await afterChange('Zdjęcia dodane — kliknij kafelek i uzupełnij podpis.')
    } catch (cause) {
      setStatus({ kind: 'error', text: cause.message ?? 'Nie udało się wgrać zdjęć.' })
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const move = async (id, direction) => {
    const list = sortedRows(rows)
    const index = list.findIndex((row) => row.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= list.length) return

    const next = [...list]
    ;[next[index], next[target]] = [next[target], next[index]]

    setStatus({ kind: 'busy', text: 'Zmieniam kolejność…' })

    const updates = next.map((row, position) =>
      supabase.from('gallery_images').update({ sort_order: position + 1 }).eq('id', row.id),
    )

    const results = await Promise.all(updates)
    const failed = results.find((result) => result.error)
    if (failed?.error) {
      setStatus({ kind: 'error', text: failed.error.message })
      return
    }

    await afterChange('Kolejność zapisana.')
  }

  const saveModal = async () => {
    if (!modal) return
    const value = modal.value

    const { error } = await supabase
      .from('gallery_images')
      .update({
        alt: value.alt,
        caption: value.caption,
        category: value.category,
        is_published: value.is_published,
      })
      .eq('id', value.id)

    if (error) {
      setStatus({ kind: 'error', text: error.message })
      return
    }

    setModal(null)
    await afterChange('Zapisane.')
  }

  const remove = async (row) => {
    if (!window.confirm('Usunąć to zdjęcie z portfolio?')) return

    const { error } = await supabase.from('gallery_images').delete().eq('id', row.id)

    if (error) {
      setStatus({ kind: 'error', text: error.message })
      return
    }

    await removeMedia(row.storage_path)
    setModal(null)
    await afterChange('Zdjęcie usunięte.')
  }

  return (
    <div className="adm-panel adm-panel--home adm-gallery">
      <section className="adm-gallery__stage" aria-label="Zdjęcia portfolio">
        {loading ? (
          <p className="adm-gallery__empty">Wczytuję…</p>
        ) : ordered.length === 0 ? (
          <p className="adm-gallery__empty">
            Galeria jest pusta — wgraj pierwsze zdjęcie plusem w rogu (najlepiej pionowe, min. 900 × 1125 px).
          </p>
        ) : (
          <ul className="adm-gallery__grid">
            {ordered.map((row, index) => {
              const label = (row.category || row.caption || '').trim()
              return (
                <li key={row.id} className="adm-gallery__tile">
                  <span className="adm-gallery__order">{index + 1}</span>
                  {!row.is_published && (
                    <span className="adm-gallery__badge">Ukryte</span>
                  )}
                  <button
                    type="button"
                    className="adm-gallery__hit"
                    onClick={() => setModal({ value: { ...row } })}
                  >
                    <img src={mediaUrl(row.storage_path)} alt="" loading="lazy" decoding="async" />
                    {label ? <span className="adm-gallery__label">{label}</span> : null}
                    <span className="adm-gallery__edit">Edytuj</span>
                  </button>
                  <div className="adm-gallery__reorder">
                    <button
                      type="button"
                      className="adm-gallery__arrow"
                      aria-label="Przesuń wcześniej na liście"
                      disabled={index === 0 || busy}
                      onClick={() => move(row.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="adm-gallery__arrow"
                      aria-label="Przesuń później na liście"
                      disabled={index === ordered.length - 1 || busy}
                      onClick={() => move(row.id, 1)}
                    >
                      ↓
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="adm-field__file"
        onChange={upload}
      />

      <button
        type="button"
        className="adm-panel-fab"
        aria-label="Dodaj zdjęcia"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <AdminIcon name="plus" className="adm-panel-fab__icon" />
      </button>

      {modal ? (
        <GalleryModal title="Zdjęcie w portfolio" onClose={() => setModal(null)}>
          <GalleryForm value={modal.value} onChange={(value) => setModal({ value })} />
          <div className="adm-modal__foot">
            <button type="button" className="adm-btn adm-btn--primary" onClick={saveModal}>
              Zapisz
            </button>
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setModal(null)}>
              Anuluj
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--quiet adm-gallery__delete"
              onClick={() => remove(modal.value)}
            >
              Usuń zdjęcie
            </button>
          </div>
        </GalleryModal>
      ) : null}

      <div className="adm-gallery__status-bar" aria-live="polite">
        {status && <span className={`adm-status adm-status--${status.kind}`}>{status.text}</span>}
      </div>
    </div>
  )
}

export default GalleryPanel
