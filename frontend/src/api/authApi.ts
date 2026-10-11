import { api } from './client'
import type { LoginResponse } from '../types'

export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { username, password }).then((r) => r.data),
}