import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

// Samo zalogowanie nie daje jeszcze prawa edycji — konto musi być wpisane
// do tabeli `admins`. Te same reguły pilnuje RLS po stronie bazy, tutaj
// sprawdzamy je tylko po to, żeby nie pokazywać panelu bez uprawnień.
export function useAdminSession() {
  const [state, setState] = useState({
    loading: isSupabaseConfigured,
    session: null,
    isAdmin: false,
  })

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let cancelled = false

    const verify = async (session) => {
      if (!session) {
        if (!cancelled) setState({ loading: false, session: null, isAdmin: false })
        return
      }

      const { data } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!cancelled) setState({ loading: false, session, isAdmin: Boolean(data) })
    }

    supabase.auth.getSession().then(({ data }) => verify(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      verify(session)
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  return state
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut()
}
