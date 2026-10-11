import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import { useToast } from '../../components/ToastProvider'
import type { CaseItem, CasePriority, CaseStatus } from '../../types'
import BoardColumn from './BoardColumn'
import { CaseCardBody } from './CaseCard'
import { COLUMNS, PRIORITIES } from './constants'
import CreateCaseModal from './CreateCaseModal'
import { useBoardCases, useChangeStatus } from './useCases'

function BoardSkeleton() {
  return (
    <div className="board">
      {COLUMNS.map((c) => (
        <section key={c.status} className="column">
          <header className="column-header"><span className="column-title">{c.label}</span></header>
          <div className="column-body">
            <div className="skeleton" /><div className="skeleton" />
          </div>
        </section>
      ))}
    </div>
  )
}

export default function BoardPage() {
  const { isManager } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { data, isLoading, isError, isFetching, refetch } = useBoardCases()
  const changeStatus = useChangeStatus()

  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search) // typing stays instant, filtering runs at low priority
  const [priority, setPriority] = useState<CasePriority | ''>('')
  const [creating, setCreating] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // A drag only starts after 6px of movement, so a plain click still opens the case
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const cases = useMemo(() => data?.content ?? [], [data])

  const byStatus = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    const map = {
      OPEN: [], IN_PROGRESS: [], PENDING_DOCUMENTS: [], APPROVED: [], REJECTED: [], CLOSED: [],
    } as Record<CaseStatus, CaseItem[]>
    for (const c of cases) {
      if (priority && c.priority !== priority) continue
      if (q && !`${c.title} ${c.customerName} ${c.caseNumber}`.toLowerCase().includes(q)) continue
      map[c.status].push(c)
    }
    return map
  }, [cases, deferredSearch, priority])

  const activeItem = useMemo(() => cases.find((c) => c.id === activeId) ?? null, [cases, activeId])

  const openCase = useCallback((id: string) => navigate(`/cases/${id}`), [navigate])

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const target = e.over?.id as CaseStatus | undefined
    const item = cases.find((c) => c.id === e.active.id)
    if (!target || !item || item.status === target) return

    const column = COLUMNS.find((c) => c.status === target)
    if (column?.managerOnly && !isManager) {
      toast.push('Only managers can approve or reject a case.', 'error')
      return
    }
    changeStatus.mutate(
      { id: item.id, status: target },
      {
        onSuccess: () => toast.push(`${item.caseNumber} moved to ${column?.label}`, 'success'),
        onError: (err) => toast.push(errorMessage(err), 'error'),
      },
    )
  }

  return (
    <div className="board-page">
      <div className="page-header">
        <div>
          <h1>Case board</h1>
          <p className="muted">
            Drag a card to change its status.
            {!isManager && ' Approving and rejecting is limited to managers.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>+ Create case</button>
      </div>

      <div className="toolbar">
        <input className="input search" placeholder="Search by title, customer or case number"
               value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={priority}
                onChange={(e) => setPriority(e.target.value as CasePriority | '')}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {isFetching && !isLoading && <span className="muted small">Syncing…</span>}
      </div>

      {isError && data && (
        <div className="banner banner-warn">Could not refresh. Showing the last loaded data.</div>
      )}

      {isLoading ? (
        <BoardSkeleton />
      ) : isError && !data ? (
        <div className="state-box">
          <p>We could not load the cases.</p>
          <button className="btn btn-primary" onClick={() => refetch()}>Try again</button>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}
                    onDragCancel={() => setActiveId(null)}>
          <div className="board">
            {COLUMNS.map((column) => (
              <BoardColumn key={column.status} column={column} items={byStatus[column.status]}
                           locked={column.managerOnly && !isManager} onOpen={openCase} />
            ))}
          </div>
          <DragOverlay>{activeItem ? <CaseCardBody item={activeItem} overlay /> : null}</DragOverlay>
        </DndContext>
      )}

      {creating && <CreateCaseModal onClose={() => setCreating(false)} />}
    </div>
  )
}