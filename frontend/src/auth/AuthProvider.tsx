import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { setUnauthorizedHandler } from '../api/client'
import { clearSession, loadSession, saveSession, type Session } from './session'

const EXPIRED = 'Your session has expired. Please sign in again.'

interface AuthContextValue {
  session: Session | null
  isManager: boolean
  notice: string | null
  login: (username: string, password: string) => Promise<void>
  logout: (notice?: string) => void
  clearNotice: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(() => loadSession())
  const [notice, setNotice] = useState<string | null>(null)

  const logout = useCallback(
    (message?: string) => {
      clearSession()
      setSession(null)
      setNotice(message ?? null)
      queryClient.clear() // never keep one user's data around for the next login
    },
    [queryClient],
  )

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password)
    const next: Session = {
      token: res.accessToken,
      username: res.username,
      role: res.role,
      expiresAt: Date.now() + res.expiresIn * 1000,
    }
    saveSession(next)
    setNotice(null)
    setSession(next)
  }, [])

  // Layer 1: any 401 from the API means the token is no longer valid
  useEffect(() => {
    setUnauthorizedHandler(() => logout(EXPIRED))
    return () => setUnauthorizedHandler(null)
  }, [logout])

  // Layers 2 and 3: a timer at expiry, plus a re-check when the tab wakes up
  useEffect(() => {
    if (!session) return
    const timer = setTimeout(
      () => logout(EXPIRED),
      Math.max(session.expiresAt - Date.now(), 0),
    )
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() >= session.expiresAt) logout(EXPIRED)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [session, logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isManager: session?.role === 'MANAGER',
      notice,
      login,
      logout,
      clearNotice: () => setNotice(null),
    }),
    [session, notice, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}