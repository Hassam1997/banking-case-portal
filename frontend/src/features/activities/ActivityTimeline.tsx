import { useState, type FormEvent } from 'react'
import { errorMessage } from '../../api/client'
import Avatar from '../../components/Avatar'
import { useToast } from '../../components/ToastProvider'
import type { ActivityType } from '../../types'
import { formatDateTime } from '../../utils/format'
import { useActivities, useAddActivity } from './useActivities'

const ICON: Record<ActivityType, string> = {
  NOTE: '📝', CUSTOMER_CONTACTED: '📞', DOCUMENTS_REQUESTED: '📎',
  STATUS_CHANGE: '🔄', APPROVED: '✅', REJECTED: '⛔',
}
const LABEL: Record<ActivityType, string> = {
  NOTE: 'Note', CUSTOMER_CONTACTED: 'Customer contacted', DOCUMENTS_REQUESTED: 'Documents requested',
  STATUS_CHANGE: 'Status change', APPROVED: 'Approved', REJECTED: 'Rejected',
}
// STATUS_CHANGE is written by the system, so it is not offered in the form
const AGENT_TYPES: ActivityType[] = ['NOTE', 'CUSTOMER_CONTACTED', 'DOCUMENTS_REQUESTED']
const MANAGER_TYPES: ActivityType[] = [...AGENT_TYPES, 'APPROVED', 'REJECTED']

export default function ActivityTimeline({ caseId, isManager }: { caseId: string; isManager: boolean }) {
  const { data, isLoading, isError, refetch } = useActivities(caseId)
  const add = useAddActivity(caseId)
  const toast = useToast()
  const [type, setType] = useState<ActivityType>('NOTE')
  const [content, setContent] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    add.mutate(
      { type, content: content.trim() },
      {
        onSuccess: () => { setContent(''); toast.push('Activity added', 'success') },
        onError: (err) => toast.push(errorMessage(err), 'error'),
      },
    )
  }

  return (
    <section className="panel">
      <h2>Activity</h2>

      <form className="note-form" onSubmit={submit}>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
          {(isManager ? MANAGER_TYPES : AGENT_TYPES).map((t) => (
            <option key={t} value={t}>{LABEL[t]}</option>
          ))}
        </select>
        <textarea className="input" rows={2} maxLength={2000} placeholder="Add a note or activity…"
                  value={content} onChange={(e) => setContent(e.target.value)} />
        <button className="btn btn-primary" disabled={add.isPending || !content.trim()}>
          {add.isPending ? 'Saving…' : 'Add'}
        </button>
      </form>

      {isLoading && <div className="skeleton" />}
      {isError && (
        <div className="banner banner-warn">
          Could not load the activity history.{' '}
          <button className="link-btn" onClick={() => refetch()}>Try again</button>
        </div>
      )}
      {data && data.length === 0 && <p className="muted">No activity yet.</p>}

      <ol className="timeline">
        {data?.map((a) => (
          <li key={a.id}>
            <span className="timeline-icon">{ICON[a.type]}</span>
            <div className="timeline-body">
              <div className="timeline-head">
                <strong>{LABEL[a.type]}</strong>
                <Avatar name={a.createdBy} size={18} />
                <span className="muted small">{a.createdBy} · {formatDateTime(a.createdAt)}</span>
              </div>
              <div className="timeline-text">{a.content}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}