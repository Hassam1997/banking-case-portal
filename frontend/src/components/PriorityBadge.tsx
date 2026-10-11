import type { CasePriority } from '../types'

const ICON: Record<CasePriority, string> = { LOW: '▼', MEDIUM: '=', HIGH: '▲', CRITICAL: '▲▲' }

export default function PriorityBadge({ priority }: { priority: CasePriority }) {
  return <span className={`prio-badge badge-${priority}`} title={priority}>{ICON[priority]}</span>
}