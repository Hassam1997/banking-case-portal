import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activityApi } from '../../api/activityApi'
import type { ActivityType } from '../../types'

export function useActivities(caseId: string) {
  return useQuery({
    queryKey: ['activities', caseId],
    queryFn: () => activityApi.list(caseId),
    enabled: !!caseId,
  })
}

export function useAddActivity(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { type: ActivityType; content: string }) => activityApi.add(caseId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities', caseId] }),
  })
}