import type { CaseStatus } from '../../types'
import { STATUS_LABEL } from './constants'

export default function StatusBadge({ status }: { status: CaseStatus }) {
  return <span className={`pill pill-${status}`}>{STATUS_LABEL[status]}</span>
}