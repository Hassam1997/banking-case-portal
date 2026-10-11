import { api } from './client'
import type { Activity, ActivityType } from '../types'

export const activityApi = {
  list: (caseId: string) =>
    api.get<Activity[]>(`/api/cases/${caseId}/activities`).then((r) => r.data),
  add: (caseId: string, body: { type: ActivityType; content: string }) =>
    api.post<Activity>(`/api/cases/${caseId}/activities`, body).then((r) => r.data),
}