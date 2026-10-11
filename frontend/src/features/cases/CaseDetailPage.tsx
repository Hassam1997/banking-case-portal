import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { errorMessage } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import Avatar from '../../components/Avatar'
import PriorityBadge from '../../components/PriorityBadge'
import { useToast } from '../../components/ToastProvider'
import type { CaseItem, CasePriority, CaseStatus } from '../../types'
import { formatDateTime } from '../../utils/format'
import ActivityTimeline from '../activities/ActivityTimeline'
import { COLUMNS, PRIORITIES } from './constants'
import StatusBadge from './StatusBadge'
import { useCase, useChangeStatus, useDeleteCase, useUpdateCase } from './useCases'

function EditForm({ item, onReload }: { item: CaseItem; onReload: () => void }) {
  const update = useUpdateCase()
  const toast = useToast()
  const [form, setForm] = useState({
    customerName: item.customerName,
    title: item.title,
    description: item.description ?? '',
    priority: item.priority as CasePriority,
  })
  const [error, setError] = useState<string | null>(null)
  const [conflict, setConflict] = useState(false)

  const dirty =
    form.customerName !== item.customerName || form.title !== item.title ||
    form.description !== (item.description ?? '') || form.priority !== item.priority

  function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setConflict(false)
    update.mutate(
      {
        id: item.id,
        body: {
          ...form,
          customerName: form.customerName.trim(),
          title: form.title.trim(),
          version: item.version, // lets the server detect that someone else saved first
        },
      },
      {
        onSuccess: () => toast.push('Case updated', 'success'),
        onError: (err) => {
          if (axios.isAxiosError(err) && err.response?.status === 409) setConflict(true)
          else setError(errorMessage(err))
        },
      },
    )
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2>Details</h2>
      {conflict && (
        <div className="banner banner-warn" role="alert">
          Someone else changed this case. Your edits were not saved.{' '}
          <button type="button" className="link-btn" onClick={onReload}>Load the latest version</button>
        </div>
      )}
      {error && <div className="banner banner-error" role="alert">{error}</div>}

      <label className="field">Customer name
        <input className="input" required maxLength={100} value={form.customerName}
               onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
      </label>
      <label className="field">Title
        <input className="input" required maxLength={150} value={form.title}
               onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </label>
      <label className="field">Description
        <textarea className="input" rows={4} maxLength={2000} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <label className="field">Priority
        <select className="input" value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as CasePriority })}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <button className="btn btn-primary" disabled={!dirty || update.isPending}>
        {update.isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}

export default function CaseDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isManager } = useAuth()
  const { data, isLoading, error, refetch } = useCase(id)
  const changeStatus = useChangeStatus()
  const remove = useDeleteCase()

  if (isLoading) return <div className="skeleton" style={{ height: 240 }} />
  if (error || !data) {
    return (
      <div className="state-box">
        <p>{errorMessage(error)}</p>
        <Link to="/cases" className="btn btn-primary">Back to cases</Link>
      </div>
    )
  }

  function onStatus(status: CaseStatus) {
    changeStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.push('Status updated', 'success'),
        onError: (err) => toast.push(errorMessage(err), 'error'),
      },
    )
  }

  function onDelete() {
    if (!window.confirm(`Delete ${data!.caseNumber}? This cannot be undone.`)) return
    remove.mutate(id, {
      onSuccess: () => { toast.push('Case deleted', 'success'); navigate('/cases') },
      onError: (err) => toast.push(errorMessage(err), 'error'),
    })
  }

  return (
    <div className="detail">
      <div className="breadcrumb"><Link to="/cases">Cases</Link> / {data.caseNumber}</div>
      <div className="detail-head">
        <h1>{data.title}</h1>
        <StatusBadge status={data.status} />
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          {/* key = version: the form resets itself whenever fresh data arrives */}
          <EditForm key={data.version} item={data} onReload={() => refetch()} />
          <ActivityTimeline caseId={id} isManager={isManager} />
        </div>

        <aside className="panel detail-side">
          <h2>Status</h2>
          <select className="input" value={data.status} disabled={changeStatus.isPending}
                  onChange={(e) => onStatus(e.target.value as CaseStatus)}>
            {COLUMNS.map((c) => (
              <option key={c.status} value={c.status} disabled={c.managerOnly && !isManager}>
                {c.label}{c.managerOnly && !isManager ? ' (manager only)' : ''}
              </option>
            ))}
          </select>

          <dl className="facts">
            <dt>Case number</dt><dd>{data.caseNumber}</dd>
            <dt>Priority</dt><dd><PriorityBadge priority={data.priority} /> {data.priority}</dd>
            <dt>Created by</dt><dd><Avatar name={data.createdBy} size={18} /> {data.createdBy}</dd>
            <dt>Created</dt><dd>{formatDateTime(data.createdAt)}</dd>
            <dt>Updated</dt><dd>{formatDateTime(data.updatedAt)}</dd>
          </dl>

          {isManager && (
            <button className="btn btn-danger" onClick={onDelete} disabled={remove.isPending}>
              Delete case
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}