import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { caseApi, type ListParams } from '../../api/caseApi'
import type {
  CaseItem, CaseStatus, CreateCaseInput, PageResponse, UpdateCaseInput,
} from '../../types'

export const caseKeys = {
  all: ['cases'] as const,
  board: ['cases', 'board'] as const,
  detail: (id: string) => ['cases', 'detail', id] as const,
}

/** The board and dashboard show the 100 most recent cases (the API caps page size at 100). */
export function useBoardCases() {
  return useQuery({
    queryKey: caseKeys.board,
    queryFn: () => caseApi.list({ size: 100 }),
    refetchInterval: 30_000,
  })
}

/** Paginated table. keepPreviousData avoids a flash of empty content when changing page. */
export function useCasesPage(params: ListParams) {
  return useQuery({
    queryKey: [...caseKeys.all, 'list', params],
    queryFn: () => caseApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useCase(id: string) {
  return useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => caseApi.get(id),
    enabled: !!id,
  })
}

export function useCreateCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCaseInput) => caseApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: caseKeys.all }),
  })
}

export function useUpdateCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCaseInput }) => caseApi.update(id, body),
    onSuccess: (data) => {
      qc.setQueryData(caseKeys.detail(data.id), data)
      qc.invalidateQueries({ queryKey: caseKeys.all })
    },
  })
}

export function useDeleteCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => caseApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: caseKeys.all }),
  })
}

export function useChangeStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CaseStatus }) =>
      caseApi.changeStatus(id, status),

    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: caseKeys.board })
      const previous = qc.getQueryData<PageResponse<CaseItem>>(caseKeys.board)
      if (previous) {
        qc.setQueryData<PageResponse<CaseItem>>(caseKeys.board, {
          ...previous,
          content: previous.content.map((c) => (c.id === id ? { ...c, status } : c)),
        })
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(caseKeys.board, ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: caseKeys.all })
      qc.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}