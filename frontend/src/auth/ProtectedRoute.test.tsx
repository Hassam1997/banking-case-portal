import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from './AuthProvider'

vi.mock('./AuthProvider', () => ({ useAuth: vi.fn() }))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/secret" element={<div>Secret page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects anonymous users to the login page', () => {
    vi.mocked(useAuth).mockReturnValue({ session: null } as never)
    renderAt('/secret')
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders the page for signed-in users', () => {
    vi.mocked(useAuth).mockReturnValue({ session: { username: 'agent1' } } as never)
    renderAt('/secret')
    expect(screen.getByText('Secret page')).toBeInTheDocument()
  })
})