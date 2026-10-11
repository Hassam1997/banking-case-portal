import type { Role } from '../types'

export interface Session {
  token: string
  username: string
  role: Role
  expiresAt: number // epoch ms
}

const KEY = 'bcp.session'

export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    return session.expiresAt > Date.now() ? session : null
  } catch {
    return null
  }
}

export function saveSession(session: Session) {
  sessionStorage.setItem(KEY, JSON.stringify(session))
}

export function clearSession() {
  sessionStorage.removeItem(KEY)
}