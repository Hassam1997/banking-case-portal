import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PriorityBadge from '../../components/PriorityBadge'
import type { CasePriority, CaseStatus } from '../../types'
import { formatDateTime } from '../../utils/format'
import { COLUMNS, PRIORITIES } from './constants'
import StatusBadge from './StatusBadge'
import { useCasesPage } from './useCases'

const PAGE_SIZE = 10

export default function CasesPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  // Filters live in the URL, so the page is linkable and the back button works.
  // Values are validated against known options before being sent to the API.
  const rawStatus = params.get('status') ?? ''
  const rawPriority = params.get('priority') ?? ''
  const status = COLUMNS.some((c) => c.status === rawStatus) ? (rawStatus as CaseStatus) : undefined
  const priority = PRIORITIES.includes(rawPriority as CasePriority) ? (rawPriority as CasePriority) : undefined
  const page = Math.max(Number(params.get('page')) || 0, 0)

  const { data, isLoading, isError, isFetching, refetch } = useCasesPage({
    status, priority, page, size: PAGE_SIZE,
  })

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  function goTo(p: number) {
    const next = new URLSearchParams(params)
    next.set('page', String(p))
    setParams(next)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Cases</h1>
          <p className="muted">{data ? `${data.totalElements} cases` : ' '}</p>
        </div>
        <Link to="/board" className="btn btn-subtle">Open board</Link>
      </div>

      <div className="toolbar">
        <select className="input" value={status ?? ''} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          {COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
        </select>
        <select className="input" value={priority ?? ''} onChange={(e) => setFilter('priority', e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {isFetching && !isLoading && <span className="muted small">Updating…</span>}
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: 320 }} />
      ) : isError && !data ? (
        <div className="state-box">
          <p>We could not load the cases.</p>
          <button className="btn btn-primary" onClick={() => refetch()}>Try again</button>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Case</th><th>Title</th><th>Customer</th><th>Status</th><th>Priority</th><th>Created</th></tr>
              </thead>
              <tbody>
                {data?.content.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/cases/${c.id}`)}>
                    <td className="nowrap">{c.caseNumber}</td>
                    <td>{c.title}</td>
                    <td>{c.customerName}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><PriorityBadge priority={c.priority} /> {c.priority}</td>
                    <td className="nowrap">{formatDateTime(c.createdAt)}</td>
                  </tr>
                ))}
                {data?.content.length === 0 && (
                  <tr><td colSpan={6} className="empty">No cases match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="pager">
              <button className="btn btn-subtle" disabled={page === 0} onClick={() => goTo(page - 1)}>Previous</button>
              <span>Page {page + 1} of {data.totalPages}</span>
              <button className="btn btn-subtle" disabled={page + 1 >= data.totalPages} onClick={() => goTo(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}