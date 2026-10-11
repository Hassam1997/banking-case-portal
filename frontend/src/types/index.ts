export type Role = 'AGENT' | 'MANAGER'
export type CaseStatus =
  | 'OPEN' | 'IN_PROGRESS' | 'PENDING_DOCUMENTS' | 'APPROVED' | 'REJECTED' | 'CLOSED'
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type ActivityType =
  | 'NOTE' | 'CUSTOMER_CONTACTED' | 'DOCUMENTS_REQUESTED' | 'STATUS_CHANGE' | 'APPROVED' | 'REJECTED'

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  username: string
  role: Role
}

export interface CaseItem {
  id: string
  caseNumber: string
  customerName: string
  title: string
  description: string | null
  status: CaseStatus
  priority: CasePriority
  createdBy: string
  createdAt: string
  updatedAt: string
  version: number
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CreateCaseInput {
  customerName: string
  title: string
  description: string
  priority: CasePriority
}

export interface UpdateCaseInput extends CreateCaseInput {
  version: number
}

export interface Activity {
  id: string
  caseId: string
  type: ActivityType
  content: string
  createdBy: string
  createdAt: string
}