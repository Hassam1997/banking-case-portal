import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { Navigate, useLocation } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { useAuth } from './AuthProvider'

export default function LoginPage() {
  const { session, login, notice, clearNotice } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    clearNotice()
    setLoading(true)
    try {
      await login(username.trim(), password)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Invalid username or password.')
      } else {
        setError(errorMessage(err))
      }
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-logo">🏦</div>
        <h1>Case Portal</h1>
        <p className="muted">Sign in to manage customer cases</p>

        {notice && <div className="banner banner-warn" role="alert">{notice}</div>}
        {error && <div className="banner banner-error" role="alert">{error}</div>}

        <label className="field">
          Username
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)}
                 autoComplete="username" autoFocus required maxLength={50} />
        </label>
        <label className="field">
          Password
          <input className="input" type="password" value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 autoComplete="current-password" required maxLength={100} />
        </label>

        <button className="btn btn-primary btn-block" disabled={loading || !username || !password}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="hint">Demo users: agent1 or manager1, password Passw0rd!</p>
      </form>
    </div>
  )
}