import { useEffect, useMemo, useRef, useState } from 'react'
import { mediaUrl, supabase } from '../../lib/supabase'
import { useContent } from '../../content/context'
import { useAdminTable } from '../useAdminTable'
import { concealMedia, hiddenMediaUrl, removeMedia, revealMedia, uploadMedia } from '../upload'
import AdminIcon from '../AdminIcon'
import './GalleryPanel.scss'

function sortedRows(rows) {
  return [...rows].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.created_at).localeCompare(String(b.created_at)),
  )
}

function sameId(a, b) {
  return String(a) === String(b)
}

function moveId(ids, id, targetId, place) {
  const from = ids.findIndex((item) => sameId(item, id))
  const target = ids.findIndex((item) => sameId(item, targetId))
  if (from < 0 || target < 0 || from === target) return ids

  let to = place === 'before' ? target : target + 1
  if (from < to) to -= 1
  if (from === to) return ids

  const next = ids.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
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

function MoveIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d={direction === 'up' ? 'm6 14 6-6 6 6' : 'm6 10 6 6 6-6'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GalleryForm({ value, src, onChange }) {
  const patch = (next) => onChange({ ...value, ...next })
  const published = Boolean(value.is_published)

  return (
    <div className="adm-gallery__form">
      <div className="adm-gallery__preview">
        <img src={src || mediaUrl(value.storage_path)} alt="" />
      </div>

      <div className="adm-gallery__aside">
        <div className="adm-gallery__switch" role="group" aria-label="Widoczność zdjęcia">
          <button
            type="button"
            className={published ? 'is-on' : ''}
            aria-pressed={published}
            onClick={() => patch({ is_published: true })}
          >
            Widoczne
          </button>
          <button
            type="button"
            className={published ? '' : 'is-on'}
            aria-pressed={!published}
            onClick={() => patch({ is_published: false })}
          >
            Ukryte
          </button>
        </div>

        <label className="adm-gallery__name">
          <span>Nazwa zabiegu</span>
          <input
            value={value.category ?? ''}
            onChange={(event) => patch({ category: event.target.value })}
            placeholder="np. Mezoterapia mikroigłowa"
          />
        </label>
      </div>
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
  const gridRef = useRef(null)
  const dragRef = useRef(null)
  const suppressClick = useRef(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [modal, setModal] = useState(null)
  const [pendingIds, setPendingIds] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [drop, setDrop] = useState(null)
  const [ghost, setGhost] = useState(null)
  const [hiddenSrc, setHiddenSrc] = useState({})

  const ordered = useMemo(() => sortedRows(rows), [rows])

  useEffect(() => {
    let cancelled = false
    const hidden = ordered.filter(
      (row) => row.is_published === false && row.storage_path && !/^https?:\/\//.test(row.storage_path),
    )

    if (!hidden.length) return undefined

    const settle = async () => {
      const next = {}

      for (const row of hidden) {
        try {
          await concealMedia(row.storage_path)
        } catch {
          // Miniatura zostaje na publicznym adresie, gdy pliku nie da się schować.
        }

        next[row.id] = (await hiddenMediaUrl(row.storage_path)) || mediaUrl(row.storage_path)
      }

      if (!cancelled) setHiddenSrc(next)
    }

    void settle()
    return () => {
      cancelled = true
    }
  }, [ordered])

  const srcFor = (row) =>
    row.is_published === false && hiddenSrc[row.id] ? hiddenSrc[row.id] : mediaUrl(row.storage_path)

  const display = useMemo(() => {
    if (!pendingIds) return ordered
    const next = pendingIds
      .map((id) => ordered.find((row) => sameId(row.id, id)))
      .filter(Boolean)
    return next.length === ordered.length ? next : ordered
  }, [ordered, pendingIds])

  useEffect(() => {
    if (!pendingIds) return
    const server = ordered.map((row) => row.id)
    if (server.length === pendingIds.length && server.every((id, index) => sameId(id, pendingIds[index]))) {
      setPendingIds(null)
    }
  }, [ordered, pendingIds])

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
      let nextOrder = display.reduce((max, row) => Math.max(max, row.sort_order ?? 0), 0)

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

      await afterChange('Zdjęcia dodane — kliknij kafelek i uzupełnij nazwę.')
    } catch (cause) {
      setStatus({ kind: 'error', text: cause.message ?? 'Nie udało się wgrać zdjęć.' })
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const persistOrder = async (ids) => {
    const orderError = 'Nie udało się zapisać kolejności.'
    setBusy(true)
    setPendingIds(ids)
    setStatus(null)

    try {
      const updates = ids.map((id, position) =>
        supabase.from('gallery_images').update({ sort_order: position + 1 }).eq('id', id),
      )
      const results = await Promise.all(updates)
      const failed = results.find((result) => result.error)
      if (failed?.error) {
        setPendingIds(null)
        setStatus({ kind: 'error', text: orderError })
        return
      }

      await reload()
      await refresh()
    } catch {
      setPendingIds(null)
      setStatus({ kind: 'error', text: orderError })
    } finally {
      setBusy(false)
    }
  }

  const move = (id, direction) => {
    const ids = display.map((row) => row.id)
    const index = ids.findIndex((item) => sameId(item, id))
    const target = index + direction
    if (index < 0 || target < 0 || target >= ids.length) return

    const next = ids.slice()
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    return persistOrder(next)
  }

  const slotFromPoint = (x, y, sourceId) => {
    const tiles = gridRef.current?.querySelectorAll('.adm-gallery__tile') ?? []
    let best = null
    let bestDist = Infinity

    for (const tile of tiles) {
      if (sameId(tile.dataset.id, sourceId)) continue
      const rect = tile.getBoundingClientRect()
      const nearestX = Math.min(Math.max(x, rect.left), rect.right)
      const nearestY = Math.min(Math.max(y, rect.top), rect.bottom)
      const dist = (x - nearestX) ** 2 + (y - nearestY) ** 2
      if (dist < bestDist) {
        bestDist = dist
        best = { id: tile.dataset.id, rect }
      }
    }

    if (!best || bestDist > 48 * 48) return null
    return {
      id: best.id,
      place: x < best.rect.left + best.rect.width / 2 ? 'before' : 'after',
    }
  }

  const beginDrag = (event, row) => {
    if (event.button !== 0 || busy) return
    if (event.target.closest('.adm-gallery__arrow')) return

    suppressClick.current = false
    dragRef.current = {
      id: row.id,
      src: srcFor(row),
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
      drop: null,
    }
  }

  const trackDrag = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (!drag.dragging) {
      if (dx * dx + dy * dy < 36) return
      drag.dragging = true
      suppressClick.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setDraggingId(drag.id)
    }

    const slot = slotFromPoint(event.clientX, event.clientY, drag.id)
    drag.drop = slot
    setDrop(slot)
    setGhost({ src: drag.src, x: event.clientX, y: event.clientY })
  }

  const finishDrag = (event, commit) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const slot = drag.drop
    const moved = drag.dragging
    setGhost(null)
    setDrop(null)
    setDraggingId(null)

    if (!moved) return
    suppressClick.current = true
    if (!commit || !slot) return

    const ids = display.map((row) => row.id)
    const next = moveId(ids, drag.id, slot.id, slot.place)
    if (next === ids) return
    void persistOrder(next)
  }

  const saveModal = async () => {
    if (!modal) return
    const value = modal.value
    const previous = rows.find((row) => sameId(row.id, value.id))
    const wasPublished = previous?.is_published !== false
    const nextPublished = Boolean(value.is_published)

    try {
      if (!wasPublished && nextPublished) await revealMedia(value.storage_path)
    } catch (cause) {
      setStatus({ kind: 'error', text: cause.message ?? 'Nie udało się przywrócić zdjęcia.' })
      return
    }

    const { error } = await supabase
      .from('gallery_images')
      .update({
        category: value.category,
        is_published: value.is_published,
      })
      .eq('id', value.id)

    if (error) {
      setStatus({ kind: 'error', text: error.message })
      return
    }

    if (wasPublished && !nextPublished) {
      try {
        await concealMedia(value.storage_path)
      } catch (cause) {
        setModal(null)
        await afterChange(
          cause.message ||
            'Zdjęcie zniknęło ze strony. Pliku nie udało się zdjąć z publicznego adresu.',
        )
        return
      }
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
          <ul
            ref={gridRef}
            className={`adm-gallery__grid${draggingId ? ' is-sorting' : ''}`}
          >
            {display.map((row, index) => {
              const label = (row.category || '').trim()
              const dropping = drop && sameId(drop.id, row.id)
              return (
                <li
                  key={row.id}
                  data-id={row.id}
                  className={[
                    'adm-gallery__tile',
                    sameId(draggingId, row.id) ? 'is-dragging' : '',
                    dropping ? `is-drop-${drop.place}` : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onPointerDown={(event) => beginDrag(event, row)}
                  onPointerMove={trackDrag}
                  onPointerUp={(event) => finishDrag(event, true)}
                  onPointerCancel={(event) => finishDrag(event, false)}
                >
                  <button
                    type="button"
                    className="adm-gallery__hit"
                    aria-label={label ? `Edytuj: ${label}` : 'Edytuj zdjęcie'}
                    onClick={() => {
                      if (suppressClick.current) {
                        suppressClick.current = false
                        return
                      }
                      setModal({ value: { ...row } })
                    }}
                  >
                    <img
                      src={srcFor(row)}
                      alt=""
                      draggable="false"
                      loading="lazy"
                      decoding="async"
                    />
                    {label ? <span className="adm-gallery__label">{label}</span> : null}
                    {!row.is_published && <span className="adm-gallery__badge">Ukryte</span>}
                  </button>
                  <div className="adm-gallery__reorder">
                    <button
                      type="button"
                      className="adm-gallery__arrow"
                      aria-label="Przesuń wcześniej"
                      disabled={index === 0 || busy}
                      onClick={() => move(row.id, -1)}
                    >
                      <MoveIcon direction="up" />
                    </button>
                    <span className="adm-gallery__order">{index + 1}</span>
                    <button
                      type="button"
                      className="adm-gallery__arrow"
                      aria-label="Przesuń później"
                      disabled={index === ordered.length - 1 || busy}
                      onClick={() => move(row.id, 1)}
                    >
                      <MoveIcon direction="down" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {ghost ? (
        <div className="adm-gallery__ghost" style={{ left: ghost.x, top: ghost.y }}>
          <img src={ghost.src} alt="" draggable="false" />
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
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
          <GalleryForm
            value={modal.value}
            src={srcFor(modal.value)}
            onChange={(value) => setModal({ value })}
          />
          <div className="adm-gallery__foot">
            <button type="button" className="adm-gallery__save" onClick={saveModal}>
              Zapisz
            </button>
            <button type="button" className="adm-gallery__cancel" onClick={() => setModal(null)}>
              Anuluj
            </button>
            <button type="button" className="adm-gallery__delete" onClick={() => remove(modal.value)}>
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
