import type { CasePriority, CaseStatus } from '../../types'

export interface ColumnDef {
  status: CaseStatus
  label: string
  managerOnly: boolean
}

export const COLUMNS: ColumnDef[] = [
  { status: 'OPEN', label: 'Open', managerOnly: false },
  { status: 'IN_PROGRESS', label: 'In progress', managerOnly: false },
  { status: 'PENDING_DOCUMENTS', label: 'Pending documents', managerOnly: false },
  { status: 'APPROVED', label: 'Approved', managerOnly: true },
  { status: 'REJECTED', label: 'Rejected', managerOnly: true },
  { status: 'CLOSED', label: 'Closed', managerOnly: false },
]

export const PRIORITIES: CasePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export const STATUS_LABEL = Object.fromEntries(
  COLUMNS.map((c) => [c.status, c.label]),
) as Record<CaseStatus, string>