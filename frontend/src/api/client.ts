import axios, { type AxiosError } from 'axios'
import { loadSession } from '../auth/session'

export const api = axios.create({ baseURL: '', timeout: 10_000 })

// The AuthProvider registers this so the client never imports React code (no circular imports).
let unauthorizedHandler: (() => void) | null = null
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn
}

api.interceptors.request.use((config) => {
  const session = loadSession()
  if (session) config.headers.Authorization = `Bearer ${session.token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // A 401 from the login call itself just means "wrong password", not "session expired"
    const isLoginCall = error.config?.url?.includes('/api/auth/login')
    if (error.response?.status === 401 && !isLoginCall) unauthorizedHandler?.()
    return Promise.reject(error)
  },
)

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Cannot reach the server. Check your connection and try again.'
    const { status, data } = error.response
    const message = (data as { message?: string } | undefined)?.message
    if (message) return message
    if (status === 403) return 'You do not have permission to do that.'
    if (status === 404) return 'The requested item was not found.'
    if (status >= 500) return 'The server had a problem. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}