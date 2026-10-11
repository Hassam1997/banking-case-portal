import { api } from './client'
import type {
  CaseItem, CasePriority, CaseStatus, CreateCaseInput, PageResponse, UpdateCaseInput,
} from '../types'

export interface ListParams {
  status?: CaseStatus
  priority?: CasePriority
  page?: number
  size?: number
}

export const caseApi = {
  list: (params: ListParams = {}) =>
    api.get<PageResponse<CaseItem>>('/api/cases', { params }).then((r) => r.data),
  get: (id: string) => api.get<CaseItem>(`/api/cases/${id}`).then((r) => r.data),
  create: (body: CreateCaseInput) => api.post<CaseItem>('/api/cases', body).then((r) => r.data),
  update: (id: string, body: UpdateCaseInput) =>
    api.put<CaseItem>(`/api/cases/${id}`, body).then((r) => r.data),
  changeStatus: (id: string, status: CaseStatus) =>
    api.patch<CaseItem>(`/api/cases/${id}/status`, { status }).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/cases/${id}`).then(() => undefined),
}