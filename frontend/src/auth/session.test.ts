import { describe, expect, it } from 'vitest'
import { clearSession, loadSession, saveSession } from './session'

const base = { token: 't', username: 'agent1', role: 'AGENT' as const }

describe('session storage', () => {
  it('returns a saved session that has not expired', () => {
    saveSession({ ...base, expiresAt: Date.now() + 60_000 })
    expect(loadSession()?.username).toBe('agent1')
  })

  it('ignores an expired session', () => {
    saveSession({ ...base, expiresAt: Date.now() - 1000 })
    expect(loadSession()).toBeNull()
  })

  it('clears the session', () => {
    saveSession({ ...base, expiresAt: Date.now() + 60_000 })
    clearSession()
    expect(loadSession()).toBeNull()
  })

  it('survives corrupted storage', () => {
    sessionStorage.setItem('bcp.session', '{not json')
    expect(loadSession()).toBeNull()
  })
})