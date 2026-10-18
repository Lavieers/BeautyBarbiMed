import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Sortowanie podajemy jako tekst („sort_order.asc,created_at.desc”), żeby
// hook miał w zależnościach zwykłą wartość, a nie nowy obiekt przy renderze.
function fetchRows(table, orderBy) {
  const query = orderBy
    .split(',')
    .filter(Boolean)
    .reduce((current, part) => {
      const [column, direction] = part.split('.')
      return current.order(column, { ascending: direction !== 'desc' })
    }, supabase.from(table).select('*'))

  return query
}

// Panel widzi wszystkie wiersze (także nieopublikowane) — pozwala na to
// polityka RLS „admin write”, która obejmuje również odczyt.
export function useAdminTable(table, orderBy = 'created_at.desc') {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const { data, error: cause } = await fetchRows(table, orderBy)

    setRows(data ?? [])
    setError(cause ?? null)
    setLoading(false)
  }, [table, orderBy])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const { data, error: cause } = await fetchRows(table, orderBy)
      if (cancelled) return

      setRows(data ?? [])
      setError(cause ?? null)
      setLoading(false)
    }

    run()

    return () => {
      cancelled = true
    }
  }, [table, orderBy])

  return { rows, loading, error, reload: load }
}
