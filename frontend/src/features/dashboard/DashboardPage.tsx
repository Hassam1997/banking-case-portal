import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import PriorityBadge from '../../components/PriorityBadge'
import type { CasePriority, CaseStatus } from '../../types'
import { COLUMNS, PRIORITIES } from '../cases/constants'
import StatusBadge from '../cases/StatusBadge'
import { useBoardCases } from '../cases/useCases'

export default function DashboardPage() {
  const { session } = useAuth()
  const { data, isLoading, isError, refetch } = useBoardCases()

  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(COLUMNS.map((c) => [c.status, 0])) as Record<CaseStatus, number>
    const byPriority = Object.fromEntries(PRIORITIES.map((p) => [p, 0])) as Record<CasePriority, number>
    for (const c of data?.content ?? []) {
      byStatus[c.status]++
      byPriority[c.priority]++
    }
    return { byStatus, byPriority, loaded: data?.content.length ?? 0 }
  }, [data])

  if (isError && !data) {
    return (
      <div className="state-box">
        <p>We could not load the dashboard.</p>
        <button className="btn btn-primary" onClick={() => refetch()}>Try again</button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {session?.username}</h1>
          <p className="muted">
            {data ? `${data.totalElements} cases in total` : ' '}
            {data && data.totalElements > stats.loaded && ` (charts use the latest ${stats.loaded})`}
          </p>
        </div>
      </div>

      <div className="stat-grid">
        {COLUMNS.map((c) => (
          <Link key={c.status} to={`/cases?status=${c.status}`} className="stat">
            <div className="stat-num">{isLoading ? '–' : stats.byStatus[c.status]}</div>
            <div className="stat-label">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="dash-grid">
        <section className="panel">
          <h2>By priority</h2>
          {PRIORITIES.map((p) => (
            <div key={p} className="bar-row">
              <span className="bar-label">{p}</span>
              <div className="bar-track">
                <div className={`bar-fill fill-${p}`}
                     style={{ width: stats.loaded ? `${(stats.byPriority[p] / stats.loaded) * 100}%` : 0 }} />
              </div>
              <span className="bar-count">{stats.byPriority[p]}</span>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Recent cases</h2>
          {isLoading && <div className="skeleton" />}
          {data?.content.slice(0, 5).map((c) => (
            <Link key={c.id} to={`/cases/${c.id}`} className="recent">
              <PriorityBadge priority={c.priority} />
              <span className="recent-title">{c.title}</span>
              <StatusBadge status={c.status} />
            </Link>
          ))}
          {data?.content.length === 0 && <p className="muted">No cases yet. Create one from the board.</p>}
        </section>
      </div>
    </div>
  )
}