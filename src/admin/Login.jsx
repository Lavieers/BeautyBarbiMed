import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setStatus({ kind: 'busy', text: 'Loguję…' })

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    // Po udanym logowaniu przekierowaniem zajmuje się useAdminSession.
    if (error) setStatus({ kind: 'error', text: 'Nieprawidłowy e-mail lub hasło.' })
  }

  return (
    <div className="adm-login">
      <form className="adm-login__box" onSubmit={submit}>
        <p className="adm-login__kicker">Beauty Barbi Med · Lublin</p>
        <h1 className="adm-login__title">Zaloguj się do panelu</h1>
        <p className="adm-login__lead">
          Tu edytujesz cennik, pakiety, zdjęcia i komunikaty na stronie gabinetu.
        </p>

        <label className="adm-field">
          <span className="adm-field__label">E-mail</span>
          <input
            type="email"
            className="adm-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="adm-field">
          <span className="adm-field__label">Hasło</span>
          <input
            type="password"
            className="adm-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="adm-btn adm-btn--primary">
          Zaloguj
        </button>

        {status && <span className={`adm-status adm-status--${status.kind}`}>{status.text}</span>}
      </form>
    </div>
  )
}

export default Login
