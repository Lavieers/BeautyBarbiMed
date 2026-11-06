import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { sectionDefaults } from '../../data/defaults'
import { useContent } from '../../content/context'
import useModalBehavior from '../../lib/useModalBehavior'
import AdminIcon from '../AdminIcon'
import './HeroPanel.scss'

function peopleFrom(team) {
  const source = Array.isArray(team) ? team : []
  return source.map((person, index) => ({
    id: person?.id || `osoba-${index + 1}`,
    name: person?.name ?? '',
    role: person?.role ?? '',
    phone: person?.phone ?? '',
    desc: person?.desc ?? '',
  }))
}

function blankPerson() {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `osoba-${Date.now()}`
  return { id, name: '', role: '', phone: '', desc: '' }
}

function letterOf(name) {
  const clean = String(name ?? '').trim()
  return clean ? clean.charAt(0).toLocaleUpperCase('pl') : '?'
}

function HeroPanel() {
  const { sections, refresh } = useContent()
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState(null)
  const [editor, setEditor] = useState(null)
  const nameInputRef = useRef(null)
  const descriptionRef = useRef(null)
  const paragraphRef = useRef(null)

  const heroSaved = { ...(sectionDefaults.hero ?? {}), ...(sections?.hero ?? {}) }
  const aboutSaved = { ...(sectionDefaults.about ?? {}), ...(sections?.about ?? {}) }
  const saved = {
    description: heroSaved.description ?? '',
    paragraph: aboutSaved.paragraph ?? '',
    teamLabel: aboutSaved.teamLabel ?? '',
    team: peopleFrom(aboutSaved.team),
  }
  const data = draft ?? saved

  const closeEditor = useCallback(() => setEditor(null), [])
  const panelRef = useModalBehavior(Boolean(editor), closeEditor)
  const editorKey = editor ? `${editor.mode}:${editor.index ?? 'new'}` : ''

  useEffect(() => {
    if (!editorKey) return undefined
    nameInputRef.current?.focus()
    return undefined
  }, [editorKey])

  // Okna „Pod tytułem” i „O gabinecie” rosną z treścią — bez wewnętrznego paska przewijania.
  useLayoutEffect(() => {
    const areas = [descriptionRef.current, paragraphRef.current].filter(Boolean)
    const fit = () => {
      areas.forEach((node) => {
        node.style.height = '0px'
        const border = node.offsetHeight - node.clientHeight
        node.style.height = `${node.scrollHeight + border}px`
      })
    }
    fit()

    const widths = new Map()
    const observer = new ResizeObserver((entries) => {
      const widthChanged = entries.some((entry) => {
        const width = Math.round(entry.contentRect.width)
        const previous = widths.get(entry.target)
        widths.set(entry.target, width)
        return previous !== width
      })
      if (widthChanged) fit()
    })
    areas.forEach((node) => {
      if (node.parentElement) observer.observe(node.parentElement)
    })
    return () => observer.disconnect()
  }, [data.description, data.paragraph])

  const patch = (next) => setDraft({ ...data, ...next })

  const openAdd = () => {
    setEditor({ mode: 'add', index: null, value: blankPerson(), error: null })
  }

  const openEdit = (index) => {
    const person = data.team[index]
    setEditor({
      mode: 'edit',
      index,
      value: {
        name: person?.name ?? '',
        role: person?.role ?? '',
        phone: person?.phone ?? '',
      },
      error: null,
    })
  }

  const patchEditor = (next) => {
    setEditor((current) =>
      current ? { ...current, value: { ...current.value, ...next }, error: null } : current,
    )
  }

  const commitEditor = () => {
    if (!editor) return
    const name = String(editor.value.name ?? '').trim()
    const role = String(editor.value.role ?? '').trim()
    const phone = String(editor.value.phone ?? '').trim()
    if (!name) {
      setEditor({ ...editor, error: 'Wpisz imię.' })
      nameInputRef.current?.focus()
      return
    }

    if (editor.mode === 'add') {
      patch({ team: [...data.team, { ...blankPerson(), name, role, phone }] })
    } else {
      patch({
        team: data.team.map((person, position) =>
          position === editor.index ? { ...person, name, role, phone } : person,
        ),
      })
    }
    setEditor(null)
  }

  const removePerson = (index) => {
    const named = String(data.team[index]?.name ?? '').trim()
    const question = named ? `Usunąć ${named} z zespołu?` : 'Usunąć tę osobę z zespołu?'
    if (!window.confirm(question)) return
    patch({ team: data.team.filter((_, position) => position !== index) })
    setEditor((current) => {
      if (!current || current.mode !== 'edit') return current
      if (current.index === index) return null
      if (current.index > index) return { ...current, index: current.index - 1 }
      return current
    })
  }

  const save = async () => {
    setStatus({ kind: 'busy', text: 'Zapisuję…' })

    const team = data.team
      .map((person) => ({
        id: person.id,
        name: String(person.name ?? '').trim(),
        role: String(person.role ?? '').trim(),
        phone: String(person.phone ?? '').trim(),
        desc: person.desc ?? '',
      }))
      .filter((person) => person.name || person.role)

    const { error } = await supabase.from('sections').upsert(
      [
        {
          key: 'hero',
          content: { description: data.description ?? '' },
        },
        {
          key: 'about',
          content: {
            source: 'copy-editor',
            paragraph: data.paragraph ?? '',
            teamLabel: String(data.teamLabel ?? '').trim(),
            team,
          },
        },
      ],
      { onConflict: 'key' },
    )

    if (error) {
      setStatus({ kind: 'error', text: error.message })
      return
    }

    await refresh()
    setDraft(null)
    setStatus({ kind: 'ok', text: 'Zapisane. Odśwież stronę główną, żeby zobaczyć zmiany.' })
  }

  return (
    <div className="adm-panel adm-panel--home adm-copy">
      <section className="adm-copy__team" aria-label="Zespół">
        <label className="adm-field adm-copy__heading">
          <span className="adm-field__label">Nagłówek zespołu</span>
          <input
            className="adm-input"
            value={data.teamLabel}
            placeholder="Dwuosobowy zespół"
            onChange={(event) => patch({ teamLabel: event.target.value })}
          />
        </label>

        {data.team.length === 0 ? (
          <p className="adm-copy__empty">Zespół jest pusty. Dodaj osobę, która ma się pojawić na stronie.</p>
        ) : (
          <div className="adm-copy__table-wrap">
            <table className="adm-copy__table">
              <thead>
                <tr>
                  <th scope="col">Osoba</th>
                  <th scope="col">Rola</th>
                  <th scope="col">Telefon</th>
                  <th scope="col">
                    <span className="adm-copy__sr">Akcje</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.team.map((person, index) => {
                  const name = String(person.name ?? '').trim()
                  const role = String(person.role ?? '').trim()
                  const phone = String(person.phone ?? '').trim()
                  return (
                    <tr key={person.id}>
                      <td>
                        <div className="adm-copy__person">
                          <span className="adm-copy__avatar" aria-hidden="true">
                            {letterOf(name)}
                          </span>
                          <span className="adm-copy__name">{name || 'Bez imienia'}</span>
                        </div>
                      </td>
                      <td className={role ? 'adm-copy__role' : 'adm-copy__role adm-copy__role--empty'}>{role || '—'}</td>
                      <td className={phone ? 'adm-copy__phone' : 'adm-copy__phone adm-copy__phone--empty'}>
                        {phone || '—'}
                      </td>
                      <td>
                        <div className="adm-copy__actions">
                          <button
                            type="button"
                            className="adm-copy__edit"
                            onClick={() => openEdit(index)}
                          >
                            Edytuj
                          </button>
                          <button
                            type="button"
                            className="adm-copy__delete"
                            onClick={() => removePerson(index)}
                          >
                            Usuń
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <button type="button" className="adm-copy__add" onClick={openAdd}>
          <AdminIcon name="plus" className="adm-copy__add-icon" />
          Dodaj osobę
        </button>
      </section>

      <section className="adm-copy__texts" aria-label="Teksty">
        <label className="adm-field adm-copy__pane">
          <span className="adm-field__label">Pod tytułem</span>
          <span className="adm-field__hint">Pierwszy akapit na stronie głównej, pod hasłem.</span>
          <textarea
            ref={descriptionRef}
            className="adm-input adm-input--area"
            rows={4}
            value={data.description}
            onChange={(event) => patch({ description: event.target.value })}
          />
        </label>

        <label className="adm-field adm-copy__pane">
          <span className="adm-field__label">O gabinecie</span>
          <span className="adm-field__hint">Akapit w sekcji O nas, obok zdjęcia salonu.</span>
          <textarea
            ref={paragraphRef}
            className="adm-input adm-input--area"
            rows={4}
            value={data.paragraph}
            onChange={(event) => patch({ paragraph: event.target.value })}
          />
        </label>
      </section>

      <div className="adm-actions adm-actions--sticky">
        <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={status?.kind === 'busy'}>
          Zapisz na stronie
        </button>
        <span aria-live="polite">
          {status ? <span className={`adm-status adm-status--${status.kind}`}>{status.text}</span> : null}
        </span>
      </div>

      {editor ? (
        <div className="adm-modal" role="presentation">
          <button type="button" className="adm-modal__backdrop" aria-label="Zamknij" onClick={closeEditor} />
          <div
            ref={panelRef}
            className="adm-modal__panel adm-copy__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-team-modal-title"
            tabIndex={-1}
          >
            <header className="adm-modal__head">
              <h2 id="adm-team-modal-title" className="adm-modal__title">
                {editor.mode === 'add' ? 'Nowa osoba' : 'Edytuj osobę'}
              </h2>
              <button type="button" className="adm-modal__close" aria-label="Zamknij" onClick={closeEditor}>
                <span />
                <span />
              </button>
            </header>
            <div className="adm-modal__body">
              <label className="adm-field">
                <span className="adm-field__label">Imię</span>
                <input
                  ref={nameInputRef}
                  className="adm-input"
                  value={editor.value.name}
                  onChange={(event) => patchEditor({ name: event.target.value })}
                />
              </label>
              <label className="adm-field">
                <span className="adm-field__label">Rola</span>
                <input
                  className="adm-input"
                  value={editor.value.role}
                  onChange={(event) => patchEditor({ role: event.target.value })}
                />
              </label>
              <label className="adm-field">
                <span className="adm-field__label">Telefon</span>
                <span className="adm-field__hint">Widoczny tylko w panelu, nie na stronie.</span>
                <input
                  className="adm-input"
                  inputMode="tel"
                  value={editor.value.phone}
                  placeholder="+48 …"
                  onChange={(event) => patchEditor({ phone: event.target.value })}
                />
              </label>
              {editor.error ? (
                <p className="adm-field__error" role="alert">
                  {editor.error}
                </p>
              ) : null}
              <div className="adm-modal__foot adm-copy__foot">
                <button type="button" className="adm-btn adm-btn--primary" onClick={commitEditor}>
                  {editor.mode === 'add' ? 'Dodaj' : 'Zapisz'}
                </button>
                <button type="button" className="adm-btn adm-btn--ghost" onClick={closeEditor}>
                  Anuluj
                </button>
                {editor.mode === 'edit' ? (
                  <button type="button" className="adm-btn adm-btn--quiet adm-copy__remove" onClick={() => removePerson(editor.index)}>
                    Usuń
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default HeroPanel
